# 카카오톡 인앱 브라우저 뷰포트 버그 진단 및 수정 이력

## 배경

V67.ViewportFix에서 홈 스크롤 기하학을 `vh` → `svh`로 전환한 뒤,
카카오톡 인앱 브라우저에서 콘텐츠가 안 보이는 문제가 발생했다.

초기 원인은 카카오 WebView가 `svh`/`lvh` 단위를 아예 모르는 것으로 파악,
V68에서 CSS `@supports not (height: 100svh)` 폴백으로 1차 대응했다.
→ `docs/troubleshooting/claude-code-prompt-svh-legacy-webview-fallback.md` 참고

그러나 이후 실기기 진단 로그로 **추가 원인**이 확인됐다.

---

## 실기기 진단으로 확인된 추가 원인

카카오 WebView는 `svh`를 지원하긴 하지만 **스펙과 다르게 동작**한다.

- 일반 모바일 브라우저(Safari/Chrome): `svh` = 고정값 (컨트롤 바 상태 무관)
- 카카오 인앱 WebView: `svh` = `lvh`처럼 동작 — 컨트롤 바가 접히거나 펼쳐질 때마다 실시간으로 변함

결과: GSAP ScrollTrigger는 빌드 시점의 `svh` 픽셀값으로 좌표를 고정하는데,
스크롤 도중 컨트롤 바가 움직이면 실제 뷰포트와 ScrollTrigger 내부 좌표가 어긋나
콘텐츠가 보이지 않게 된다.

### 진단 방법

실기기에서 `chrome://inspect` 사용 불가 환경이었으므로 두 단계로 로그를 찍었다.

**1단계** — 로드 시점 스냅샷 (GlobalInteractionStage.tsx 내 runMeasurementAndBuild):
- UA 문자열, CSS dvh/svh/lvh 지원 여부
- `fonts.ready` 소요 시간 (3초 타임아웃)
- `getStableVH()` / `getStableLVH()` 실측값
- 섹션별 offsetHeight, finalY

**2단계** — visualViewport 변화 실시간 추적 (별도 useEffect):
- `visualViewport.resize` 이벤트마다 `getStableVH()` / `getStableLVH()` 재측정
- 임계값 없이 전량 기록, 타임스탬프 포함
- 확인 결과: 컨트롤 바 토글 시 svh 값이 실시간으로 변하는 것 확정

로그 확인 도구: `DebugConsole.tsx` (화면 내 콘솔 오버레이, 전체 복사 기능)
→ `docs/handover/debug-console.md` 참고

---

## 시도한 수정 및 결과

### 시도 1 — ScrollTrigger.refresh() 예외 허용 (롤백됨)

**접근**: 카카오 인앱 UA 감지 시 visualViewport resize 핸들러에서
`ScrollTrigger.refresh()`를 허용 (일반 터치 기기는 기존대로 차단 유지).

**구현 과정에서 발생한 버그**: `useRef`로 구현했을 때 deps 미등록으로 리스너가
아예 등록되지 않는 문제 발생 → `useState`로 교체 + deps에 `isKakao` 추가로 수정.

**실기기 로그 결과**:
```
[Kakao Verify] 리스너 등록됨 — interactionMode: touch, isKakao: true
[Kakao Verify] refresh 실행 — 현재 높이: 768.0px, progress: 0.295
[Kakao Verify] refresh 실행 — 현재 높이: 641.0px, progress: 0.227
```

리스너 등록과 refresh 실행 자체는 정상 작동했으나, **새로운 부작용 발생**:
- `ScrollTrigger.refresh()` 실행 시 svh 기반 트랙 길이가 재측정됨
- 스크롤 위치는 그대로인데 타임라인 진행률이 0.295 → 0.227로 뒤로 밀림
- 사용자가 스크롤하지 않았는데 화면이 되감기는 증상

원래 증상(콘텐츠 안 보임)도 미해결 상태이므로 **순수 마이너스** → 롤백.

**결론**: `ScrollTrigger.refresh()` 방식은 카카오 인앱 컨트롤 바 문제에 적합하지 않다.
refresh가 타임라인 좌표 전체를 재계산하기 때문에, svh가 변하는 환경에서는
오히려 진행률 점프를 유발한다.

---

### 시도 2 — CSS Variable 고정 (현재 적용)

**접근**: svh 값을 페이지 로드 시점에 한 번만 px로 측정해 CSS 변수에 고정.
컨트롤 바가 움직여도 측정값은 변하지 않으므로 레이아웃/스크롤 좌표가 안정됨.

**구현 내용**:

1. **`layout.tsx` `<head>` 인라인 스크립트** (블로킹 실행, 첫 렌더 이전):
   - UA에서 `KAKAOTALK` 감지
   - probe div(`height:100svh`)의 `offsetHeight`로 100svh를 px 측정
   - `document.documentElement.style.setProperty('--kakao-vh-unit', h/100 + 'px')`
   - `document.documentElement.classList.add('kakao-fixed-vh')`

2. **`globals.css` `.kakao-fixed-vh` 블록**:
   - `.kakao-fixed-vh { --unit-svh: var(--kakao-vh-unit); }`
     → 기존 인라인 style `calc(var(--unit-svh) * N)` 값들이 자동으로 고정값 사용
   - Tailwind arbitrary class 오버라이드 (`h-[1000svh]`, `h-[800svh]` 등)

3. **홈 뷰 파일 인라인 style 변환** (범위: home 한정):
   - `'80svh'` → `'calc(var(--unit-svh) * 80)'` 패턴으로 전부 변환
   - 대상 파일: `HeroOffPCView`, `HeroMobileView`, `HeroOffMobileView`,
     `HeroOffTabletView`, `HeroOnMobileView`, `HeroOnPCView`, `HeroOnTabletView`,
     `HeroPCView`, `HeroTabletView`, `GlobalScrollHint` (clamp 내부 포함)

**왜 `--kakao-vh-unit`에 `window.innerHeight`가 아닌 probe div `offsetHeight`를 쓰나**:
- `window.innerHeight`는 정수 반올림 없이 소수점을 포함할 수 있음
- `getStableVH()`도 probe div `offsetHeight`를 사용 → 동일 기준으로 GSAP과 CSS가 일치함
- 실측 로그: `visualViewport.height: 699.33`, `stableVH: 699` (offsetHeight 정수 반올림)

**GSAP 좌표와의 정합성**:
- GSAP 빌더는 `getStableVH()` → `svhPx(N, stableVH)` 경로로 px 값을 계산
- CSS는 `--kakao-vh-unit` = `getStableVH() / 100` 이므로 동일 기준
- 컨트롤 바가 움직여도 CSS/GSAP 모두 로드 시점 스냅샷 값을 유지 → 좌표 일치

**남은 한계**:
- `builders/scroll.ts:36`의 `#home-stage minHeight: '100dvh'` — `dvh`는 스펙상 동적이므로
  카카오에서도 변할 수 있으나, pinSpacing이 실제 길이를 제어하므로 영향 미미

---

## 현재 상태 (시도 2 적용 완료)

**적용된 방어 코드 전체**:
- `KakaoTalkBanner.tsx` — 인앱 감지 시 "기본 브라우저로 열기" 배너 표시
- `globals.css` — `@supports not (height: 100svh)` 폴백 (svh 미지원 구형 WebView)
- `layout.tsx` + `globals.css` — `--kakao-vh-unit` / `.kakao-fixed-vh` 고정 (시도 2)

---

## 다른 인앱 브라우저에서 같은 문제 발생 시

Instagram, 네이버, 라인 등 다른 인앱 브라우저에서 동일 증상이 나타날 경우:

1. **DebugConsole 활성화** (`docs/handover/debug-console.md` 참고)
2. **진단 로그 추가** — 위 1단계/2단계 방식 그대로 재사용
3. UA 감지: `navigator.userAgent.includes('Instagram')` 등으로 확인
4. **ScrollTrigger.refresh() 방식은 시도하지 말 것** — 시도 1의 부작용 참고
5. `layout.tsx` 인라인 스크립트의 UA 조건에 해당 UA 문자열 추가하는 것으로 확장 가능

> **주의**: 인앱 UA 문자열은 앱 업데이트로 변경될 수 있으므로, 실기기 로그로 먼저 UA를 확인할 것.

---

## 관련 파일 및 문서

| 항목 | 경로 |
|------|------|
| 핵심 파일 | `src/components/sections/home/GlobalInteractionStage.tsx` |
| CSS 폴백 (V68) | `src/app/globals.css` — `[V68.LegacyWebViewFallback]` 블록 |
| CSS 고정 (KakaoFix) | `src/app/globals.css` — `[KakaoFix]` 블록 |
| 카카오 배너 | `src/components/layout/KakaoTalkBanner.tsx` |
| 인라인 스크립트 | `src/app/layout.tsx` — `<head>` KakaoFix script |
| svh 폴백 배경 | `docs/troubleshooting/claude-code-prompt-svh-legacy-webview-fallback.md` |
| vh→svh 전환 배경 | `docs/troubleshooting/claude-code-prompt-mobile-viewport-fix.md` |
| 디버그 콘솔 사용법 | `docs/handover/debug-console.md` |
