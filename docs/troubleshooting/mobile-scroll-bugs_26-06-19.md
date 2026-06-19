# Troubleshooting: 모바일 스크롤 버그 종합 진단 및 수정 이력 (2026-06)

> **작업 브랜치**: `fix/mobile-scroll-bugs` (2026-06-19 `main`에서 분기)
> **대상 기기**: iOS Safari, Android Chrome/Samsung Internet (터치 기반)
> **공통 특징**: 브라우저 에뮬레이터에서는 재현 안 됨, 실기기에서만 발생

---

## 진단된 버그 목록

| ID | 증상 | 주요 원인 | 수정 여부 |
|----|------|----------|----------|
| A | 특정 섹션에서 배경이 안 바뀜 | `ignoreMobileResize: true` + `initGlobalStyles` 가드 | Fix 4로 부분 개선 |
| B | 빠른 스크롤 / 역스크롤 시 텍스트·오브젝트 위치 꼬임 | Lenis 이중 RAF 루프 + 컨트롤 바 viewport 변화 | Fix 1 + Fix 4로 개선 |
| C | 헤더 로고 클릭 → 맨 위로 → 재스크롤 시 섹션 깨짐 | `ScrollTrigger.refresh()` 누락 | Fix 3으로 해결 |
| D | 다른 페이지 복귀 시 섹션 깨짐 | 복귀 타이밍 레이스 컨디션 (Fix 4 + 오버레이로 부분 개선) | 부분 개선 |
| E | 첫 진입/복귀 직후 오프모드에서 스크롤 시 빈 공간 노출 | JS 하이드레이션 전 iOS/Android 네이티브 스크롤 가능 | 투명 오버레이로 해결 |

---

## Fix 1 — Lenis 이중 RAF 루프 제거

### 파일
`src/hooks/useLenisScroll.ts`

### 현상
빠른 스크롤 / 역스크롤 시 텍스트·섹션 위치가 꼬임. 모바일에서만 발생하고 에뮬레이터에서는 안 됨.

### 원인
`integrateGSAP: true` 상태에서 두 가지 RAF 경로가 **동시에** `lenis.raf()`를 호출:

```ts
// 경로 1: 자체 requestAnimationFrame 루프 (매 프레임 lenis.raf(time) 호출)
const raf = (time: number) => {
  lenisRef.current.raf(time);
  rafRef.current = requestAnimationFrame(raf);
};
requestAnimationFrame(raf);

// 경로 2: GSAP ticker (동시에 lenis.raf(time * 1000) 호출)
gsap.ticker.add((time) => {
  lenisRef.current.raf(time * 1000);
});
```

매 프레임 Lenis가 2회 업데이트 → scroll velocity가 2배로 계산됨.
CPU가 불안정한 모바일에서 두 루프의 타이밍이 어긋나면 증폭됨.

### 수정
자체 RAF 루프 전체 제거. GSAP ticker 단일 경로만 유지.
제거된 것: `rafRef`, `raf()` 함수, `requestAnimationFrame(raf)` 시작 코드, `cancelAnimationFrame()` 정리 코드.

---

## Fix 2 — touchMultiplier 불일치 통일

### 파일
`src/app/layout.tsx`

### 현상
터치 스크롤 속도가 의도보다 빠르게 동작할 가능성.

### 원인
`SmoothScroll.tsx` 기본값(`touchMultiplier: 1.3`)과 `layout.tsx`에서 전달하는 값(`touchMultiplier={2}`)이 불일치.

### 수정
`layout.tsx`의 `touchMultiplier={2}` → `touchMultiplier={1.3}`으로 통일.

---

## Fix 3 — 로고 클릭 후 ScrollTrigger.refresh() 누락

### 파일
`src/components/sections/home/GlobalInteractionStage.tsx` (라인 556 근처)

### 현상
헤더 로고 클릭 → `lenis.scrollTo(0, { immediate: true })`로 맨 위 이동 → 다시 아래로 스크롤 시 섹션이 잘못된 위치에 표시되거나 배경이 맞지 않음.

### 원인
`lenis.scrollTo(0, { immediate: true })` 호출 후 `ScrollTrigger.refresh()`가 없어서
ScrollTrigger가 캐싱된 scroll position과 실제 위치 불일치 상태로 scrub을 재개함.

### 수정
```ts
if ((window as any).lenis) (window as any).lenis.scrollTo(0, { immediate: true });
// 추가: 다음 프레임에 ScrollTrigger 좌표 동기화
requestAnimationFrame(() => ScrollTrigger.refresh());
```

`requestAnimationFrame`으로 감싼 이유: `lenis.scrollTo`의 DOM 반영이 같은 프레임에서 완료되기 전에 `refresh()`가 호출되지 않도록.

---

## Fix 4 — 모바일 컨트롤 바 viewport 변화 대응

### 파일
`src/components/sections/home/GlobalInteractionStage.tsx`

### 배경
모바일 브라우저에는 주소창·하단 네비게이션 바(컨트롤 바)가 스크롤에 따라 등장/숨김.
이때 `window.innerHeight`(= viewport 높이)가 변한다.

**안드로이드의 복잡성**: 기기 시스템 네비게이션 바(항상 고정)와 브라우저 자체 주소창이 이중으로 존재.
스크롤 끝에 도달하면 브라우저 주소창이 재등장 → 두 바가 동시에 보임 → viewport 변화가 더 큼.

### 기존 설정과의 관계
`ignoreMobileResize: true`는 컨트롤 바 등장/숨김 시 ScrollTrigger가 매 픽셀마다 refresh하며 덜컹거리는 걸 방지하기 위해 의도적으로 추가된 설정.
그러나 이 때문에 컨트롤 바가 최종적으로 안정된 후에도 좌표가 갱신되지 않아 섹션/배경 어긋남 발생.

### 수정
`ignoreMobileResize: true`는 유지하면서, `visualViewport` API로 높이 변화가 **안정된 후** 1회만 refresh:

```ts
useEffect(() => {
  if (typeof window === 'undefined' || !window.visualViewport) return;

  let debounceTimer: ReturnType<typeof setTimeout> | null = null;
  let lastHeight = window.visualViewport.height;

  const handleViewportResize = () => {
    const currentHeight = window.visualViewport!.height;
    const diff = Math.abs(currentHeight - lastHeight);
    if (diff < 50) return; // 컨트롤 바 수준(≥50px)만 감지

    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      lastHeight = window.visualViewport!.height;
      if (masterTl.current) ScrollTrigger.refresh(); // 타임라인 활성 시에만
      debounceTimer = null;
    }, 300); // 컨트롤 바 애니메이션 완전 안정화 대기
  };

  window.visualViewport.addEventListener('resize', handleViewportResize);
  return () => {
    window.visualViewport?.removeEventListener('resize', handleViewportResize);
    if (debounceTimer) clearTimeout(debounceTimer);
  };
}, []);
```

### 한계
근본 원인인 `window.scrollY` 미세 조정(브라우저가 컨트롤 바 등장 시 자동 보정)은 완전히 차단 불가.
Fix 4는 좌표 어긋남을 "발생 후 보정"하는 방식이며, 100% 해결이 아닌 개선.

---

## 투명 오버레이 추가 — 초기 터치 스크롤 차단

### 파일
`src/components/sections/home/GlobalInteractionStage.tsx`

### 현상
페이지 첫 진입 또는 다른 페이지에서 복귀 직후, JS 초기화 전에 iOS/Android 네이티브 스크롤이 가능해져:
- 오프모드: 스크롤 시 화면 전체가 올라가며 빈 공간 노출
- 온모드: 타임라인 미초기화 상태에서 스크롤 진행

### 기존 스크롤 잠금과의 관계
`HeroContext.tsx`에 이미 `overflow: hidden` 잠금이 있음 (조건: `pathname === '/' && !isScrollable`).
그러나 SSR → JS 하이드레이션 사이 짧은 갭(~100ms)에서 iOS/Android가 터치 스크롤 이벤트를 받는 문제.

### 수정
`touch-action: none` 투명 오버레이를 `document.body`에 주입, 초기화 완료 전 터치 이벤트 차단:

```ts
// 오버레이 해제 조건 (두 모드 분리):
// - 오프모드(!isScrollable): 마운트 후 100ms 해제 (HeroContext의 overflow:hidden이 이후 담당)
// - 온모드(isScrollable): isTimelineReady까지 대기 후 500ms 페이드아웃
useEffect(() => {
  if (!mounted) return;
  if (!isScrollable || isTimelineReady) {
    const delay = isTimelineReady ? 500 : 100;
    const timer = setTimeout(() => setShowOverlay(false), delay);
    return () => clearTimeout(timer);
  }
}, [mounted, isScrollable, isTimelineReady]);
```

**오프모드에서 100ms로 빠르게 해제하는 이유**: 오프모드에서는 타임라인이 빌드되지 않아 `isTimelineReady`가 영원히 `false`여서, 오버레이가 제거되지 않으면 토글 스위치 클릭 등 모든 인터랙션이 차단됨.

---

## 미결 / 장기 과제

### 1. svh 단위 전환 (검토 필요)
`vh` 기반 섹션 높이를 `svh`(소형 뷰포트 높이 = 컨트롤 바 표시 기준)로 전환하면
컨트롤 바 등장 시 viewport 변화 자체를 무의미하게 만들 수 있음.
**단점**: CSS/GSAP 빌더 전반 수정 필요 (중간~큰 작업), 모바일 비율 감각 재조정 필요.

### 2. 오프모드 → 온모드 가끔 멈춤 현상
다른 페이지 복귀 후 로고 클릭 시 극히 드물게 오프모드에 완전히 멈추는 현상.
`HeroProvider`는 루트 layout에 위치해 소프트 네비게이션 시 상태 유지가 보장됨.
원인: 브라우저의 예외적 레이아웃 리마운트로 추정. 재현 패턴이 불명확해 관찰 중.

### 3. CTA 역스크롤 완충 (진행 예정)
`CTA_STILL_TOUCH: 4.0 → 8.0` 증가 예정.
CTA 이전 섹션 타이밍에 영향 없음 (`calculateLabels`의 순차 누적 구조상 CTA 이후만 변경됨).
푸터 도달 전 스크롤 여유를 늘려 컨트롤 바 재등장 타이밍을 완충.

---

## 핵심 교훈

1. **이중 RAF = 2배 velocity**: `integrateGSAP: true`일 때 자체 RAF + GSAP ticker를 같이 쓰면 안 됨. Lenis 공식 문서에도 둘 중 하나만 사용하도록 명시됨.

2. **`ignoreMobileResize`의 트레이드오프**: 켜면 컨트롤 바 움직임 중 덜컹거림을 방지하지만 최종 좌표 어긋남을 허용. `visualViewport` 기반 디바운스 refresh가 현실적인 절충안.

3. **모바일 에뮬레이터 한계**: 이중 RAF 타이밍 어긋남은 CPU 불안정 환경에서 증폭되므로, 에뮬레이터(안정적 환경)에서는 재현 안 됨. 실기기 테스트 필수.

4. **오프모드/온모드 분기 처리**: 오프모드에서는 GSAP 타임라인이 빌드되지 않아 `isTimelineReady`가 영원히 `false`. 이를 감안하지 않은 로직은 모든 인터랙션을 영구 차단하는 심각한 회귀를 일으킬 수 있음.
