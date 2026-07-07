# Troubleshooting: 배경 오버레이 애니메이션 미작동 — Dead Code 버그 (2026-06-19)

> **브랜치**: `fix/mobile-scroll-bugs`
> **영향 범위**: 히어로 → 페인 구간 파란 조명 오버레이 전혀 변화 없음
> **해결 시간**: 즉시 (원인 파악 후 1줄 수정)

---

## 증상

`HomeStage.tsx`에 `--light-overlay-opacity` CSS 변수로 제어되는 파란 오버레이 div를 추가했음.
`scroll.ts`에 GSAP 애니메이션도 추가했음 (`rgba()` 문자열 → 수치형 변수로 2회 방식 변경 포함).
그러나 히어로에서 페인으로 스크롤해도 오버레이가 **전혀 변하지 않음**.

---

## 원인 분석

### 1차 시도: `--light-overlay: rgba()` 문자열 CSS 변수 (실패)

```ts
// globals.css
--light-overlay: rgba(0, 0, 0, 0);

// scroll.ts (GSAP)
tl.fromTo(document.documentElement,
  { '--light-overlay': 'rgba(0,0,0,0)' },
  { '--light-overlay': 'rgba(20, 55, 140, 0.28)' }
);
```

**원인**: GSAP은 CSS 변수에 대해 `rgba()` 문자열 보간을 지원하지 않음.
hex 색상(`--bg: #0a0a0a`)은 GSAP 내부 컬러 파서가 처리하지만, `rgba()` 문자열 변수는 단순 문자열 치환이라 중간값 계산 불가.

### 2차 시도: `--light-overlay-opacity` 수치형 변수 (여전히 실패)

```ts
// globals.css
--light-overlay-opacity: 0;

// HomeStage.tsx
<div style={{ backgroundColor: 'rgb(20, 55, 140)', opacity: 'var(--light-overlay-opacity, 0)' }} />

// scroll.ts
if (label === STAGES.TO_PAIN && options.isOn) {
  tl.fromTo(document.documentElement,
    { '--light-overlay-opacity': 0 },
    { '--light-overlay-opacity': 0.28 },
    startTime
  );
}
```

수치형 변수 → GSAP이 정상 보간 가능. 그러나 여전히 **완전히 작동 안 함**.

### 진짜 원인: `STAGES.TO_PAIN`이 `LOGO_JOURNEY_SECTIONS`에 없음

`buildSectionScrollTimeline()`의 배경 오버레이 코드는 `LOGO_JOURNEY_SECTIONS.forEach()` **내부**에 있음:

```ts
LOGO_JOURNEY_SECTIONS.forEach(({ label, stage }) => {
  // ...
  if (label === STAGES.TO_PAIN && options.isOn) {  // ← 절대 실행되지 않음
    tl.fromTo(document.documentElement, ...);
  }
});
```

`LOGO_JOURNEY_SECTIONS` (`interaction-journey.ts`):
```ts
export const LOGO_JOURNEY_SECTIONS = [
  { label: STAGES.START_TO_PAIN, stage: STAGES.START_TO_PAIN },  // ← START_TO_PAIN 있음
  { label: STAGES.RESONANCE, ... },
  { label: STAGES.PAIN_TO_MSG, ... },
  // ...
  // STAGES.TO_PAIN 없음!
];
```

`TO_PAIN`은 네모 모핑 여정(`NEMO_JOURNEY_SECTIONS`)에는 있지만, 로고 여정 배열에는 없음.
→ `label === STAGES.TO_PAIN` 조건이 영원히 `false` → **Dead Code**.

---

## 수정

```ts
// Before (dead code)
if (label === STAGES.TO_PAIN && options.isOn) {

// After
if (label === STAGES.START_TO_PAIN && options.isOn) {
```

`START_TO_PAIN`은 `LOGO_JOURNEY_SECTIONS`의 첫 번째 항목이므로 정상 실행됨.
`startTime` 계산식에서도 `START_TO_PAIN`일 때 `time = L[STAGES.START_TO_PAIN]`이므로 타이밍도 정확함.

---

## 추가 수정: 오버레이 색상 보라색 문제

배경 이미지(`hero-bg.webp`)가 따뜻한 크림/노란 계열이라, 파란 오버레이와 섞이면 보라색으로 보임.

**원인**: 색광 혼합에서 파란색(B)과 노란색(R+G)이 섞이면 흰색/회색 방향으로 가지만,
오버레이 색상의 빨간 채널(R=20)이 따뜻한 배경의 R 성분을 증폭시켜 보라색으로 보임.

**수정**: R을 0으로 낮추고 G를 올려 순수 청남색 방향으로 보정.
```
rgb(20, 55, 140) → rgb(0, 50, 130)
```

---

## 핵심 교훈

1. **`LOGO_JOURNEY_SECTIONS` vs `NEMO_JOURNEY_SECTIONS`**: 두 배열은 다른 목적이며 포함된 스테이지가 다름.
   배경/환경 제어 로직은 `LOGO_JOURNEY_SECTIONS` 기반 루프에서만 실행됨.
   `TO_PAIN`은 네모 배열에만 있고 로고 배열에는 없음.

2. **`LOGO_JOURNEY_SECTIONS`에 없는 스테이지를 루프 내에서 체크하면 Dead Code**:
   루프 외부에서 별도 `tl.fromTo()` 호출로 처리하거나, 해당 스테이지가 배열에 있는지 먼저 확인해야 함.

3. **GSAP CSS 변수 보간**: hex 색상은 GSAP 컬러 파서가 처리. `rgba()` 문자열은 보간 불가.
   투명도가 필요한 경우: 색상은 `rgb()`로 div에 고정하고, 수치형 opacity 변수(`--xxx-opacity: 0`)만 GSAP으로 제어.
