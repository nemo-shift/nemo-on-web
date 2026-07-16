# iOS Safari 오프모드 스크롤 차단 버그 수정

> **브랜치**: `fix/kakao-vh-fix`
> **날짜**: 2026-07-16
> **상태**: ✅ 실기기 검증 완료

---

## 증상

iOS Safari에서 홈 페이지 첫 진입 시(오프모드 = `!isScrollable`), 스크롤이 차단되어야 하는데 **터치 스크롤이 가능**한 버그.

- Android Chrome, 데스크탑 브라우저: 정상 (스크롤 차단됨)
- **iOS Safari에서만 재현**

---

## 기존 방어 체계와 한계

### 1단계: `HeroContext.tsx` — `overflow: hidden`
```js
// pathname === '/' && !isScrollable 일 때:
document.body.style.overflow = 'hidden';
document.documentElement.style.overflow = 'hidden';
```
**한계**: iOS Safari는 body/html의 `overflow: hidden`을 무시하고 터치 스크롤을 허용하는 경우가 있음.

### 2단계: 투명 오버레이 (`GlobalInteractionStage.tsx`, 커밋 `07553f8`)
```
feat(ux): 타임라인 준비 전 투명 오버레이 추가 — iOS/Android 초기 터치 스크롤 차단
```
- `touch-action: none` + `pointer-events: all` 투명 div를 body에 포탈로 주입
- 타임라인 초기화 전 iOS/Android 터치 스크롤 차단 목적

**한계**: 이후 오프모드 스위치 차단 버그 수정(커밋 `b9a4731`)에서 **오프모드일 때 100ms 후 오버레이 제거** 로직이 추가됨.
```js
// 변경 후:
if (!isScrollable || isTimelineReady) {
  const delay = isTimelineReady ? 500 : 100;
  const timer = setTimeout(() => setShowOverlay(false), delay);
}
```
→ 오프모드에서 `isTimelineReady`는 영원히 `false` (타임라인이 빌드되지 않으므로)
→ `!isScrollable`이 `true` → 100ms 후 오버레이 제거
→ 100ms 이후 iOS Safari에서 스크롤 가능 상태로 돌아감

**100ms 해제 이유**: 오프모드에서 오버레이가 `pointerEvents: 'all'`이어서, 제거하지 않으면 토글 버튼 클릭까지 차단됨. 그래서 빠르게 제거하고 `HeroContext`의 `overflow: hidden`에 의존하는 구조였음 → iOS Safari에서 실패.

---

## 근본 원인

iOS Safari가 `overflow: hidden`을 무시하는 동작 + 오버레이 조기 제거(100ms)가 겹쳐서 발생.

1. 오버레이가 100ms 후 제거됨
2. `HeroContext`의 `overflow: hidden`만 남음
3. iOS Safari는 이를 무시 → 터치 스크롤 가능

---

## 해결 방법 (3중 방어)

### 1. 오버레이 오프모드 유지
오프모드(`!isScrollable`) 동안 오버레이를 제거하지 않음.
`isScrollable`이 `true`로 전환될 때까지 유지.

```js
// 변경 전:
if (!isScrollable || isTimelineReady) {
  const delay = isTimelineReady ? 500 : 100;
  const timer = setTimeout(() => setShowOverlay(false), delay);
}

// 변경 후:
if (isScrollable && isTimelineReady) {
  const timer = setTimeout(() => setShowOverlay(false), 500);
}
```

### 2. 오버레이 pointerEvents 분리
오버레이가 오프모드 동안 유지되므로 클릭 차단 문제 해결 필요.

```js
// 변경 전:
pointerEvents: isTimelineReady ? 'none' : 'all',  // 오프모드에서 클릭 차단

// 변경 후:
pointerEvents: 'none',  // 항상 클릭 통과 — 스크롤 차단은 별도 리스너가 담당
```

### 3. `document` touchmove 리스너 + `lenis.stop()` 이중 방어
오버레이의 `pointerEvents: 'none'`으로 인해 CSS `touch-action: none`이 터치 이벤트를 직접 받지 못하므로, document 레벨에서 별도 차단.

```js
useEffect(() => {
  if (!mounted) return;
  const preventTouchMove = (e: TouchEvent) => e.preventDefault();
  if (!isScrollable) {
    document.addEventListener('touchmove', preventTouchMove, { passive: false });
    const lenis = (window as any).lenis;
    if (lenis) lenis.stop();
  }
  return () => {
    document.removeEventListener('touchmove', preventTouchMove);
    if (isScrollable) {
      const lenis = (window as any).lenis;
      if (lenis) lenis.start();
    }
  };
}, [mounted, isScrollable]);
```

**왜 `{ passive: false }`인가**: iOS Safari는 기본적으로 touchmove를 passive로 처리. `preventDefault()`를 호출하려면 반드시 `{ passive: false }` 지정 필요.

**왜 `lenis.stop()`도 추가하는가**: Lenis는 body `overflow: hidden`을 무시하고 자체적으로 스크롤을 처리할 수 있음. touchmove 차단과 별개로 Lenis 엔진 자체를 정지시켜 이중 방어.

---

## stopPropagation 안전성 확인

`document` 레벨 touchmove 리스너가 모든 요소에서 동작하는지 확인함.

프로젝트 내 `stopPropagation()` 사용처:
- `ForWhoCarousel.tsx`: `onClick` 이벤트 → touchmove와 무관
- `ScrollOnboardingNudge.tsx`: `onPointerDown` 이벤트 → touchmove와 무관

**touchmove에 `stopPropagation()`을 쓰는 곳 없음** → document 리스너 정상 동작 보장.

---

## 수정 파일

| 파일 | 변경 |
|------|------|
| `GlobalInteractionStage.tsx` | 오버레이 해제 조건 변경, touchmove 리스너 추가, pointerEvents 분리 |

---

## 이전 시도와의 차이

| | 예전 (`07553f8`) | 이번 수정 |
|---|---|---|
| 오프모드 오버레이 | 100ms 후 제거 | isScrollable 전환까지 유지 |
| 스크롤 차단 | `touchAction: 'none'` + `pointerEvents: 'all'` | `touchAction: 'none'` + **touchmove preventDefault** + **lenis.stop()** |
| 클릭 처리 | 오버레이가 차단 (`pointerEvents: 'all'`) | 통과 (`pointerEvents: 'none'`) |

핵심: 이전 방식은 오버레이 하나로 스크롤과 클릭을 **둘 다** 제어 → 분리 불가능.
이번 방식은 스크롤 차단(touchmove 리스너)과 클릭 통과(pointerEvents: none)를 **분리**.

---

## 관련 커밋

- `07553f8` — 투명 오버레이 최초 추가 (iOS/Android 초기 터치 스크롤 차단)
- `b9a4731` — 오프모드 스위치 차단 버그 수정 (오버레이 해제 조건 분리 → 100ms 해제 도입)
- `c7e5289` — 이번 수정 (오프모드 오버레이 유지 + touchmove 리스너 + lenis.stop())
