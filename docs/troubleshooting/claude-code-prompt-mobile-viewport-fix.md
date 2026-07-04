# [작업 지시] 모바일 브라우저 크롬(주소창/컨트롤바)으로 인한 홈페이지 하단 레이아웃 꼬임 수정

## 배경 및 문제 정의

이 프로젝트는 Next.js App Router + GSAP ScrollTrigger(pin) + Lenis 기반의 스크롤 인터랙션 사이트다.
홈(`/`)은 `GlobalInteractionStage`가 `#home-stage`를 `pin: true`로 고정하고,
`finalY = (섹션 offsetHeight 합계 + 푸터 높이) - window.innerHeight` 만큼 스크럽하는 구조다.

**증상:** 모바일에서 홈페이지를 바닥까지 스크롤하면, 브라우저 주소창/컨트롤바가
접히거나 나타나면서 뷰포트 높이가 변하고, 마지막 섹션과 푸터의 정렬이 어긋나 보인다.

**근본 원인 (3가지가 겹침):**

1. `finalY`가 빌드 시점의 `window.innerHeight`로 고정된다. 모바일에서 innerHeight는
   주소창 상태에 따라 변하는 값이므로(펼침≈svh, 접힘≈lvh), 빌드 시점과 스크롤 종점의
   뷰포트가 다르면 크롬 높이(기기별 60~110px)만큼 오차가 생긴다.
2. 홈 섹션들이 `h-screen`(=100vh=모바일에서 lvh 기준)으로 크기가 잡혀 있어,
   innerHeight(≈svh) 기반 계산과 측정 기준 자체가 불일치한다.
3. 크롬 등장/퇴장이 리사이즈 핸들러의 높이 임계값 `max(80px, 12%)`를 넘어서
   하필 스크롤 바닥에서 `setRevision`(타임라인 전체 재빌드)이 발동하고,
   별도의 visualViewport 핸들러도 50px 이상 변화 시 `ScrollTrigger.refresh()`를
   호출해 핀 구간 끝에서 눈에 보이는 점프를 만든다.

**해결 전략:** 뷰포트 변화를 감지해 따라잡는 방식이 아니라, 스크롤 기하학 자체가
브라우저 크롬 상태와 무관하도록 만든다. 모든 측정 기준을 `svh`(small viewport height)
하나로 통일하고, 터치 기기에서는 높이 변화로 재빌드하지 않으며, 바닥의 잔여 오차는
CSS `calc(100lvh - 100svh)` 보정 패딩이 흡수한다.

---

## ⚠️ 작업 범위 제한 (반드시 준수)

- 이 작업은 **홈(`/`) 스크롤 기하학에만** 해당된다. 서브페이지(about, offerings,
  contact, diagnosis 등)의 레이아웃/스타일은 절대 건드리지 않는다.
- 기존 버전 주석 스타일(`[V66.Phase1]` 등)을 유지하고, 이번 수정에는
  `[V67.ViewportFix]` 태그로 주석을 단다.
- 아래 지시된 변경 외의 리팩토링(변수명 변경, 파일 이동, 포매팅 일괄 변경 등)은
  하지 않는다.
- `dvh` 단위는 절대 사용하지 않는다 (실시간으로 변하는 단위라 이 문제를 재생산함).
- 각 단계 완료 후 `npm run build`(또는 `next build`)가 통과하는지 확인한다.

---

## STEP 1 — 홈 섹션 높이 단위를 100svh로 통일

홈 스테이지 내부 섹션들의 뷰포트 높이 단위를 전부 `svh` 기준으로 바꾼다.
Tailwind 3.4 이상이면 `h-svh` / `min-h-svh`를 쓰고, 아니면 arbitrary value
`h-[100svh]` / `min-h-[100svh]`를 쓴다. (tailwind.config와 package.json에서
Tailwind 버전을 먼저 확인할 것.)

대상 파일과 변경 지점:

| 파일 | 현재 | 변경 |
|---|---|---|
| `components/sections/home/pain/PainSection.tsx` | sticky 컨테이너 `h-screen` | `h-[100svh]` |
| `components/sections/home/message/MessageSection.tsx` | sticky 컨테이너 `h-screen` | `h-[100svh]` |
| `components/sections/home/forwho/ForWhoSection.tsx` | sticky 컨테이너 `h-screen` | `h-[100svh]` |
| `components/sections/home/story/BrandStorySection.tsx` | sticky 컨테이너 `h-screen` | `h-[100svh]` |
| `components/sections/home/cta/CTASection.tsx` | `h-[100vh]` | `h-[100svh]` |
| `components/sections/home/HomeStage.tsx` | `#section-bridge`의 `h-[100vh]` | `h-[100svh]` |
| `components/sections/home/hero/HeroSection.tsx` | 루트의 `min-h-screen` | `min-h-[100svh]` |

주의:
- `HeroSection.tsx`에는 이미 `height: '100svh'` 인라인 스타일을 쓰는 뷰 래퍼가
  있다. 이 부분은 그대로 두고, 루트 컨테이너의 `min-h-screen`만 교체한다.
- 위 표에 없는 파일에서도 홈 섹션 하위에 `h-screen`/`100vh`가 남아 있는지
  `grep -rn "h-screen\|100vh" components/sections/home` 으로 전수 확인하고,
  홈 스크롤 기하학에 영향을 주는 것만 교체한다.
- **예외:** `FallingKeywordsStage.tsx`와 `useParticles.ts` 등 캔버스/물리엔진의
  `window.innerHeight` 사용은 렌더링 캔버스 크기용이므로 **건드리지 않는다.**

## STEP 2 — finalY 계산을 svh 실측 기반으로 교체

파일: `components/sections/home/GlobalInteractionStage.tsx`

1. 컴포넌트 파일 상단(컴포넌트 밖)에 svh 실측 헬퍼를 추가한다:

```ts
// [V67.ViewportFix] 브라우저 크롬 상태와 무관한 안정 뷰포트 높이(100svh) 실측
const getStableVH = (): number => {
  if (typeof document === 'undefined') return 0;
  const probe = document.createElement('div');
  probe.style.cssText =
    'position:fixed;top:0;left:0;height:100svh;width:0;visibility:hidden;pointer-events:none;';
  document.body.appendChild(probe);
  const h = probe.offsetHeight;
  probe.remove();
  return h || window.innerHeight;
};
```

2. `runMeasurementAndBuild` 내부의 finalY 계산을 교체한다:

```ts
// 변경 전
const finalY = measuredTotalHeight - window.innerHeight;

// 변경 후
// [V67.ViewportFix] innerHeight(크롬 상태에 따라 가변) 대신 svh 실측값 사용
const stableVH = getStableVH();
const finalY = measuredTotalHeight - stableVH;
```

3. 같은 함수 스코프 안에서 `window.innerHeight`를 참조하는 다른 지점이 있는지
   확인하고, **스크롤 기하학(거리/오프셋) 계산에 쓰이는 것만** `stableVH`로
   교체한다. 스크롤 복구 로직의 `finalY * targetProgress`는 finalY만 바뀌면
   자동으로 일관되므로 추가 수정 불필요.
4. `components/sections/home/builders/` 하위 빌더들에서
   `grep -rn "innerHeight" components/sections/home/builders` 로 전수 확인.
   스크롤 거리 계산에 innerHeight를 쓰는 곳이 있으면 `builderOptions`에
   `stableVH: number`를 추가해 주입하고 그 값을 쓰도록 바꾼다.
   (단순 시각 요소 배치용이면 그대로 둔다 — 판단이 애매하면 변경하지 말고
   주석으로 `// [V67.ViewportFix-검토필요]` 를 남겨라.)

## STEP 3 — 터치 기기에서 높이 변화 리사이즈 무시

파일: `components/sections/home/GlobalInteractionStage.tsx`

`[V66.Phase1] 지능형 리사이즈 감지 정책` 주석이 붙은 resize useEffect를 수정한다.
`interactionMode`는 이미 props로 들어오고 있다.

```ts
// 변경 전
if (widthChanged || heightDiff > heightThreshold) {

// 변경 후
// [V67.ViewportFix] 터치 기기: 브라우저 크롬 등장/퇴장(높이 변화)은 무시.
// 화면 회전은 너비 변화(widthChanged)로 감지되므로 커버됨.
if (widthChanged || (interactionMode !== 'touch' && heightDiff > heightThreshold)) {
```

주의: 이 useEffect의 의존성 배열이 `[]`이면 `interactionMode`가 stale closure가
된다. 의존성 배열에 `interactionMode`를 추가하고, 핸들러 등록/해제가 올바르게
갈아끼워지는지 확인할 것.

## STEP 4 — visualViewport refresh 핸들러에 진행도 가드 추가

파일: `components/sections/home/GlobalInteractionStage.tsx`

`[Fix 4] 모바일 브라우저 컨트롤 바` 주석이 붙은 visualViewport useEffect에서,
디바운스 후 실행되는 부분을 다음과 같이 가드한다:

```ts
debounceTimer = setTimeout(() => {
  lastHeight = window.visualViewport!.height;
  // [V67.ViewportFix] 핀 구간 후반(푸터 근처)에서는 refresh가 눈에 보이는
  // 점프를 유발하므로 스킵. STEP 1~2로 기하학이 svh 고정이라 보정 불필요.
  const progress = masterTl.current?.progress() ?? 0;
  if (masterTl.current && progress <= 0.9) {
    ScrollTrigger.refresh();
  }
  debounceTimer = null;
}, 300);
```

## STEP 5 — 푸터 하단에 크롬 높이 보정 패딩 적용

파일: `components/layout/Footer.tsx`

1. 푸터에 적용된 고정 안전 여백(주석상 padding-bottom 80px, 실제 클래스는
   `pb-20` 또는 인라인 스타일일 수 있으니 파일에서 찾을 것)을 다음으로 교체:

```tsx
style={{
  // [V67.ViewportFix] 모바일 크롬 높이만큼 정확히 보정 (데스크톱에선 0).
  // lvh(주소창 접힘) - svh(주소창 펼침) = 해당 기기의 브라우저 크롬 높이.
  paddingBottom: 'calc(100lvh - 100svh + env(safe-area-inset-bottom, 0px))',
}}
```

2. 푸터 높이는 ResizeObserver → `setFooterHeight` → `finalY`로 이미 자동
   반영되므로 추가 배선은 불필요하다. 다만 이 패딩 변경으로 ResizeObserver가
   발화해 정상적으로 새 높이가 측정되는지 확인한다.
3. 홈 스테이지(또는 body)의 최하단 배경색을 푸터 배경색과 동일하게 맞춘다.
   `HomeStage.tsx`의 최상위 컨테이너 또는 `globals.css`의 body에
   푸터와 같은 배경색을 지정해서, 전환 순간 틈이 생겨도 이음새가 아닌
   자연스러운 여백으로 보이게 한다. (푸터 배경색은 Footer.tsx에서 확인.)

## STEP 6 — 검증

코드 수정 후 다음을 순서대로 수행하고 결과를 보고한다:

1. `npx tsc --noEmit` 및 `npm run build` 통과 확인.
2. `grep -rn "window.innerHeight" components/sections/home` 결과를 나열하고,
   남아 있는 각 사용처가 왜 그대로 두어도 되는지(캔버스용 등) 한 줄씩 설명.
3. `grep -rn "h-screen\|100vh" components/sections/home` 결과가 비어 있거나,
   남은 항목이 의도적 예외인지 확인.
4. 수정 파일 전체 목록과 각 파일의 변경 요약을 표로 출력.

수동 테스트 시나리오(내가 실기기에서 확인할 체크리스트도 함께 출력해줘):
- iOS Safari / Android Chrome 각각에서:
  a. 최상단에서 새로고침 → 바닥까지 스크롤 → 마지막 섹션·푸터 정렬 확인
  b. 바닥에서 살짝 위로 스크롤(주소창 재등장) → 다시 바닥 → 점프/꼬임 없는지
  c. 중간 지점에서 주소창 접힘/펼침 반복 → 타임라인 재빌드가 발생하지 않는지
     (콘솔에 '[Interaction/V33] Cleanup Context' 로그가 찍히면 재빌드된 것)
  d. 화면 회전(세로↔가로) 시에는 정상적으로 재빌드되는지
- 데스크톱 크롬에서 회귀 없는지: 스크롤 전체 구간, 리사이즈, 스냅 동작 확인.

## 하지 말 것 (재확인)

- 서브페이지 레이아웃, FooterRevealSpacer(서브페이지용) 수정 금지
- FallingKeywordsStage / useParticles의 캔버스 크기 로직 수정 금지
- `ignoreMobileResize: true` 설정 제거 금지 (유지해야 함)
- dvh 사용 금지, 100vh→100svh 일괄 치환을 홈 외 영역에 적용 금지
- 이 작업과 무관한 리팩토링/포매팅 금지
