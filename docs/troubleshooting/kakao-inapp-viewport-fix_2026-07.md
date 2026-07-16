# 카카오 인앱 뷰포트 버그 진단·수정 이력

> **브랜치**: `fix/kakao-vh-fix`
> **기간**: 2026-07-16
> **상태**: ✅ 실기기 검증 완료 — 해결됨 (디버그 코드 정리 후 main 머지 예정)

---

## 증상

카카오톡 인앱 브라우저(KakaoTalk WebView)에서 홈페이지 스크롤 시 두 가지 증상 발생:

1. **CTA 진입 전 푸터 조기 노출** — CTA 섹션에 도달하기 전(또는 도달하는 시점에) 하단에 footer가 미리 보임
2. **스크롤 끝에서 되감기** — 홈 스크롤 끝에서 footer가 올라오다가 다시 내려가는(되감기) 현상

핵심 원인으로 지목한 것: **카카오 WebView에서 `svh`/`dvh` 단위가 컨트롤 바(주소창/툴바) 토글에 따라 동적으로 재계산됨.** 일반 브라우저의 `svh`는 "small viewport height"로 고정이어야 하나, 카카오 WebView는 이를 `lvh`처럼 동적으로 다룬다.

---

## 아키텍처 전제 (읽기 전 필수)

- 홈 페이지 = 단일 GSAP 마스터 타임라인 + **`#home-stage` 전체 핀(whole-pin)**
- `#home-stage` = `ScrollTrigger` `pin: true` 타깃. 핀 동안 `position: fixed` 상태.
- `#sections-content-wrapper` = `#home-stage` 내부, GSAP Y 트랜슬레이트로 이동
- `finalY = measuredTotalHeight - stableVH` = 핀이 유지되는 스크롤 거리
- `stableVH` = `getStableVH()` 함수가 반환하는 고정 뷰포트 높이 (카카오에서는 `window.__kakaoStableVH`)
- `measuredTotalHeight` = `#sections-content-wrapper` DOM 실측 높이 (모든 섹션 포함)
- Footer(홈): `isHomeStage=true` → `position: relative`, `#sections-content-wrapper` 내 최하단. 레이아웃 footer(`layout.tsx`)는 홈(`/`)에서 `<></>` 반환.

---

## Phase 1: CSS 변수 고정 (완료)

### 문제
카카오 WebView에서 `100svh` 기반 높이 값들이 컨트롤 바 토글 시 재계산됨.

### 해결
`layout.tsx <head>`에 **블로킹 인라인 스크립트** 추가:
- 로드 시점에 `100svh` probe div로 `offsetHeight` 실측
- `window.__kakaoStableVH = h` 전역 저장
- `--kakao-vh-unit = h/100 + 'px'` CSS 변수 설정
- `document.documentElement.classList.add('kakao-fixed-vh')` 클래스 부여

`globals.css`에 `.kakao-fixed-vh` 블록:
```css
.kakao-fixed-vh {
  --unit-svh: var(--kakao-vh-unit);  /* svh → 고정 px로 오버라이드 */
}
/* Tailwind arbitrary class 오버라이드 (h-[100svh] 등 14종) */
.kakao-fixed-vh .h-\[1000svh\] { height: calc(var(--unit-svh) * 1000); }
...
```

`getStableVH()` / `getStableLVH()` 수정:
```ts
if (window.__kakaoStableVH) return window.__kakaoStableVH;
```

### 결과
✅ svh 동적 변화 방지 완료. 그러나 두 가지 증상은 여전히 남음.

---

## Phase 2: KAKAO_VIEWPORT_SAFETY_MARGIN 도입 (1차 시도 — 방향 오류)

### 가설
컨트롤 바 높이(~105px)만큼 `#home-stage`가 짧아 CTA 하단이 잘리고, `finalY`가 부족해 되감기가 발생한다.

### 구현
- `constants/interaction.ts`: `KAKAO_VIEWPORT_SAFETY_MARGIN = 150` 추가 (→ 이후 120으로 조정)
- `scroll.ts`: `#home-stage minHeight = stableVH + 120`
- `GlobalInteractionStage.tsx`: `finalY = measuredTotalHeight - stableVH - 120`

### 실기기 결과
- `--kakao-stage-min-height set to: 714px` → 변수 설정 자체는 성공
- `getComputedStyle(#home-stage).minHeight: 714px` → CSS 반영 성공
- **그러나 증상 변화 없음**

### 원인 추적

**디버그 1:** `#home-stage minHeight`가 콘솔에서 빈 문자열로 찍힘
→ console.log가 `buildSectionScrollTimeline`(432번 줄) 호출 전에 찍히고 있었음. gsap.set이 아직 실행 전. **로그 순서 문제**였고 실제 값 주입은 정상.

**디버그 2:** `gsap.set('#home-stage', { minHeight: ... })` 이후 시간이 지나면 빈 값으로 돌아감
→ `#home-stage`의 React `style` prop에 `minHeight`가 없는 상태에서 React가 리렌더하면 GSAP imperative set 값을 지워버림.
→ **해결**: `setProperty('--kakao-stage-min-height', ...)` + globals.css CSS 규칙으로 전환 (React style prop 바깥)

**디버그 3:** `inline style.height: 714px` 확인 → GSAP ScrollTrigger pin이 element를 고정할 때 `height` inline 주입. CSS 변수로 설정한 min-height를 GSAP이 측정해서 캡처한 것.

**디버그 4:** `pin-spacer exists: false` → rAF 타이밍이 너무 빨라 pin-spacer 생성 전에 쿼리. pin 자체는 정상 동작.

**디버그 5:** `computedStyle.height: 714px` 확인됨 → `#home-stage`는 정확히 714px. **그런데도 증상 동일.**

### 근본적 오류 발견
`#home-stage(window) = 714px`인데 그 안의 CTA 섹션은 `h-[100svh] = 594px`.
→ window 하단 120px에 CTA 아래 요소(footer)가 그대로 노출됨.
→ **KAKAO_VIEWPORT_SAFETY_MARGIN이 오히려 footer를 더 많이 보이게 만들고 있었음.**

- `#home-stage +120px` → 창이 커짐 → 창 아래쪽에 footer 노출
- `finalY -120px` → 핀 120px 일찍 끝남 → 더 빨리 footer 노출

두 변경 모두 반대 방향이었음.

---

## Phase 3: 전체화면 섹션 통합 — `--kakao-stage-height` 단일 변수 (현재 시도)

### 핵심 인사이트
**window(`#home-stage`)와 그 안의 전체화면 섹션이 동일한 높이여야 한다.**
`#home-stage = 714px`, CTA = 594px → 불일치가 원인.

### 전수 조사 결과

| 요소 | 파일 | 클래스 | 처리 |
|------|------|--------|------|
| CTA 섹션 | `CTASection.tsx` | `h-[100svh]` | ✅ 714px로 통일 |
| section-bridge | `HomeStage.tsx` | `h-[100svh]` | ✅ 714px로 통일 |
| Hero 최소 높이 | `HeroSection.tsx` | `min-h-[100svh]` | ✅ 714px로 통일 |
| Pain sticky 내부 | `PainSection.tsx` | `h-[100dvh]` | ❌ 변경 안 함 |
| Message sticky 내부 | `MessageSection.tsx` | `h-[100dvh]` | ❌ 변경 안 함 |
| ForWho sticky 내부 | `ForWhoSection.tsx` | `h-[100dvh]` | ❌ 변경 안 함 |
| BrandStory sticky 내부 | `BrandStorySection.tsx` | `h-[100dvh]` | ❌ 변경 안 함 |

**Pain/Message/ForWho/BrandStory를 제외한 이유:**
모두 `[V71]` 주석 포함:
```
// 구도 상자는 측정에 미관여(외곽 트랙이 측정 담당) →
// 실시간 뷰포트 채움을 위해 dvh 사용. 외곽 트랙·finalY의 svh는 유지.
```
- 외곽 섹션(`h-[1000svh]`, `h-[400svh]`)이 스크롤 공간 담당 → `measuredTotalHeight`에 반영
- sticky 내부는 **표시 전용** → 실시간 viewport 반응이 의도된 설계
- 이를 714px로 고정하면 V71이 해결하려 했던 문제가 재발

### 구현

**`layout.tsx <head>` 블로킹 스크립트:**
```js
var m = 120; // KAKAO_VIEWPORT_SAFETY_MARGIN — constants/interaction.ts와 동기화 필요
document.documentElement.style.setProperty('--kakao-stage-height', (h + m) + 'px');
```
→ React 첫 렌더 **전**에 설정 → sectionOffsets 측정 시 정확한 높이 반영

**`globals.css`:**
```css
.kakao-fixed-vh {
  --unit-svh: var(--kakao-vh-unit);
  /* CSS fallback (head 스크립트 미실행 시) */
  --kakao-stage-height: calc(var(--kakao-vh-unit) * 100 + 120px);
}
.kakao-fixed-vh #home-stage      { min-height: var(--kakao-stage-height) !important; }
.kakao-fixed-vh .h-\[100svh\]    { height: var(--kakao-stage-height); }     /* CTA, bridge */
.kakao-fixed-vh .min-h-\[100svh\]{ min-height: var(--kakao-stage-height); } /* Hero */
```

**`scroll.ts`:** `setProperty('--kakao-stage-min-height', ...)` 제거 (head 스크립트로 이전)

### 120 하드코딩 동기화 주의
이 값이 세 곳에 존재하며 **항상 일치해야 함**:
1. `constants/interaction.ts` → `KAKAO_VIEWPORT_SAFETY_MARGIN = 120` (TS 상수)
2. `layout.tsx` 인라인 스크립트 → `var m = 120` (head 블로킹 스크립트, import 불가)
3. `globals.css` CSS fallback → `+ 120px`

### finalY 공식 완전 설명

`finalY = measuredTotalHeight - stableVH - KAKAO_VIEWPORT_SAFETY_MARGIN`

- 일반: `finalY = measuredTotalHeight - stableVH` → 마지막 594px 콘텐츠를 594px window에 딱 맞게 표시
- 카카오: `finalY = measuredTotalHeight - stableVH - 120` → 120px 덜 이동 → 마지막 `594 + 120 = 714px` 콘텐츠를 714px window에 딱 맞게 표시

"더 적게 이동"하는 것이 "더 많은 콘텐츠를 화면에 채움"으로 이어지는 이유: window가 커졌기 때문.

### 검증 결과 (2026-07-16 실기기)
```
[KakaoDebug] kakao-fixed-vh: true
[KakaoDebug] __kakaoStableVH: 594
[KakaoDebug] --kakao-stage-height: 714px      ✅ head 스크립트 정상 동작
[KakaoDebug] KAKAO_VIEWPORT_SAFETY_MARGIN: 120
[KakaoDebug] finalY: 20740                    ✅ (이전 20500 대비 +240 = CTA+Hero 각 120px 증가)
[KakaoDebug] pin 생성 후 #home-stage BCR.height: 714  ✅ min-height 적용
[KakaoDebug] pin 생성 후 #home-stage offsetHeight: 714
[KakaoDebug] pin-spacer exists: false         ※ rAF 타이밍 이슈 (pin 자체는 정상)
```

✅ **CTA 진입 시 footer 조기 노출 해소**
✅ **스크롤 끝에서 되감기 해소**

---

## 디버그 인프라 현황

### DebugConsole
- 위치: `src/components/ui/DebugConsole.tsx`
- 마운트: `HomeStage.tsx` 최상단 JSX
- 기능: `console.log/warn/error` 인터셉트 → 화면 오버레이 표시
- 사용법: 홈 우하단 "콘솔 (N)" 버튼 → 전체 복사
- **진단 완료 후 제거 필요**: `HomeStage.tsx`에서 import + `<DebugConsole />` 삭제

### 현재 활성 로그 (GlobalInteractionStage.tsx + scroll.ts)
```
[KakaoDebug] kakao-fixed-vh: true/false
[KakaoDebug] __kakaoStableVH: 594
[KakaoDebug] --kakao-stage-height: 714px
[KakaoDebug] KAKAO_VIEWPORT_SAFETY_MARGIN: 120
[KakaoDebug] finalY: 20740
[KakaoDebug] pin 생성 후 #home-stage BCR.height: 714
[KakaoDebug] pin 생성 후 #home-stage offsetHeight: 714
[KakaoDebug] pin-spacer exists: ...
[KakaoDebug] pin-spacer height: ...
```
**검증 완료. 아래 정리 항목에서 제거 필요.**

---

## 수정 파일 목록 (브랜치: `fix/kakao-vh-fix`)

| 파일 | 변경 내용 |
|------|---------|
| `src/app/layout.tsx` | `<head>` 블로킹 스크립트: `__kakaoStableVH`, `--kakao-vh-unit`, `--kakao-stage-height`, `kakao-fixed-vh` 클래스 |
| `src/app/globals.css` | `.kakao-fixed-vh` 블록: `--kakao-stage-height` 단일 변수 체계, svh 오버라이드 14종, footer-pb 규칙 |
| `src/constants/interaction.ts` | `KAKAO_VIEWPORT_SAFETY_MARGIN = 120` 상수 추가 |
| `src/components/sections/home/GlobalInteractionStage.tsx` | `getStableVH/LVH` → `__kakaoStableVH` 참조, `finalY` 카카오 분기, KakaoDebug 로그, pin-spacer 로그 |
| `src/components/sections/home/builders/scroll.ts` | `#home-stage` 카카오 분기 → CSS 변수 방식으로 전환, debug 로그 |
| `src/components/sections/home/HomeStage.tsx` | `<DebugConsole />` 마운트 (진단용, 완료 후 제거) |
| `src/constants/sub-interaction.ts` | `HORIZONTAL_SCROLL_END: 2.5 → 3.2` (Lab 애니 완성 후 즉시 이탈 방지) |
| `src/components/sections/offerings/outro/OfferingsOutro.tsx` | 텍스트 크기 조정, 모바일 줄바꿈 추가 |
| `src/components/layout/Footer.tsx` | `paddingBottom` 인라인 → `.footer-pb` 클래스로 이전 |

---

## 완료 후 정리 항목

- [ ] `HomeStage.tsx`: `import DebugConsole` + `<DebugConsole />` 제거
- [ ] `GlobalInteractionStage.tsx`: `[KakaoDebug]` console.log 5줄 제거
- [ ] `scroll.ts`: `[KakaoDebug]` console.log 제거
- [ ] `fix/kakao-vh-fix` → `main` PR 생성 및 머지

---

## 참고: 롤백하지 않은 이유

`KAKAO_VIEWPORT_SAFETY_MARGIN` 자체는 올바른 방향. 단지 **적용 범위가 불완전**했음.
`#home-stage`만 키우고 내부 전체화면 섹션(CTA 등)은 그대로여서 불일치가 생긴 것.
Phase 3에서 모든 전체화면 섹션을 동일 변수로 통일함으로써 완성.
