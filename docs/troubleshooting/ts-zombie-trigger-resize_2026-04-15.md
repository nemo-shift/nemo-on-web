# Troubleshooting: 리사이즈 시 좀비 트리거 누적 및 레이아웃 오염

## 1. 현상 (Issue Context)

- **증상**: 브라우저 창 크기를 조절할 때 (특히 브레이크포인트 통과 시) 섹션 배치가 뒤죽박죽으로 무너지는 현상 발생.
- **재현 조건**: 별도 페이지 방문 없이, 홈에서 단순 리사이즈만으로도 발생.
- **콘솔 증거**: `타임라인 빌드 완료 - 트리거 개수`가 리사이즈를 할 때마다 `1 → 3 → 5 → 7`로 2개씩 무한 증가.

```
[DEBUG-Stage] 타임라인 빌드 완료 - 트리거 개수: 1   ← 초기
[DEBUG-Stage] 타임라인 빌드 완료 - 트리거 개수: 3   ← 리사이즈 1회
[DEBUG-Stage] 타임라인 빌드 완료 - 트리거 개수: 5   ← 리사이즈 2회
[DEBUG-Stage] 타임라인 빌드 완료 - 트리거 개수: 7   ← 리사이즈 3회
```

---

## 2. 원인 분석 (Root Cause Analysis)

### 2.1 `revertOnUpdate` 기본값 미설정 (주범)

`useGSAP` 훅의 `revertOnUpdate` 옵션은 **기본값이 `false`** 입니다.

이 상태에서 의존성 배열이 변경(리사이즈 → `footerHeight` 변경 등)되면:
- ✅ 새 콜백을 기존 Context에 **누적 추가**만 함
- ❌ 이전 콜백이 생성한 ScrollTrigger들을 **파괴하지 않음**
- ❌ `return () => { ... }` 클린업 함수를 **호출하지 않음**

```tsx
// 수정 전 - revertOnUpdate가 없어 의존성 변경 시 누적만 됨
useGSAP(() => { ... }, {
  dependencies: [isScrollable, isOn, footerHeight, ...]
  // revertOnUpdate가 없으면 기본값 false → 이전 트리거 살아있음!
});
```

아무리 정교한 클린업 로직을 작성해도, `revertOnUpdate: false` 상태에서는 그 클린업 함수 자체가 **호출되지 않기** 때문에 완전히 무효였습니다.

---

### 2.2 비동기 탈출 (Async Context Escape)

엔진 빌드는 레이아웃 확정을 위해 2단계 비동기로 실행됩니다:
1. `requestAnimationFrame` (rAF) → 다음 프레임 대기
2. `setTimeout(..., 100ms)` → 핀 좌표 정착 대기

`gsap.context()`는 **동기적으로 실행된 것만 추적**합니다. 비동기(rAF, setTimeout) 내부에서 생성된 ScrollTrigger들은 Context의 추적 범위 밖으로 탈출하여, `ctx.revert()` 시에도 파괴되지 않았습니다.

```tsx
// 문제 구조
const ctx = gsap.context(() => {
  requestAnimationFrame(() => {          // ← 비동기: ctx 추적 범위 탈출!
    localTl = gsap.timeline({ scrollTrigger: {...} }); // 좀비 후보 1
    localTrigger = ScrollTrigger.create({...});          // 좀비 후보 2
    
    setTimeout(() => {                   // ← 2중 비동기: 더 멀리 탈출!
      ScrollTrigger.refresh();           // 좀비 타이머! 파괴 후에도 실행됨
    }, 100);
  });
});

// 클린업 시 ctx.revert()는 rAF/setTimeout 내부 생성물을 파괴 못 함
```

---

### 2.3 rAF ID 덮어쓰기 (Race Condition)

빠른 연속 리사이즈 시:
1. 세션 A의 rAF가 예약됨 → `rafId.current = A`
2. 리사이즈 재발생 → 세션 A 클린업 전에 `rafId.current = B`로 덮어씌워짐
3. 클린업에서 `cancelAnimationFrame(B)` 실행 → A는 취소 안 됨
4. rAF-A가 뒤늦게 실행되어 좀비 트리거 2개 생성

---

## 3. 해결 방안 (Solution)

### Step 1: `revertOnUpdate: true` 적용

```tsx
// 수정 후 - 의존성 변경 = 완전한 파괴 후 재생성 보장
useGSAP(() => { ... }, {
  dependencies: [isScrollable, isOn, footerHeight, ...],
  revertOnUpdate: true  // ← 이 한 줄이 핵심!
});
```

### Step 2: 비동기 작업을 `ctx.add()`로 포획

`ctx.add()`로 감싸면 비동기로 실행되더라도 GSAP Context가 해당 작업을 자신의 영역으로 인식합니다.

```tsx
// 수정 후 - rAF 내부를 ctx.add()로 감싸 추적 보장
rafId.current = requestAnimationFrame(() => ctx.add(() => {
  // 이제 이 안에서 생성된 모든 ScrollTrigger는
  // ctx.revert() 시 자동으로 파괴됩니다
  localTl = gsap.timeline({ scrollTrigger: {...} });
  localTrigger = ScrollTrigger.create({...});
  // ...
}));
```

### Step 3: `setTimeout` 타이머 ID 저장 및 클린업

```tsx
// 수정 전 - ID 저장 없이 타이머 실행
setTimeout(() => { ScrollTrigger.refresh(); }, 100);

// 수정 후 - ID 저장 후 클린업 시 즉시 해체
layoutTimerRef.current = setTimeout(() => {
  ScrollTrigger.refresh(); 
}, 100);

// 클린업 함수 내
if (layoutTimerRef.current) {
  clearTimeout(layoutTimerRef.current);
  layoutTimerRef.current = null;
}
```

### Step 4: 훅 순서 고정 (Rules of Hooks 준수)

`revertOnUpdate` 옵션 적용 후 `useGSAP` 내부의 훅 개수가 변동될 수 있으므로, 그 뒤에 위치하던 `Double-Lock useEffect`를 `useGSAP` **앞으로 이동**하여 훅 순서를 불변으로 고정했습니다.

---

## 4. 검증 (Verification)

수정 후 콘솔 로그:
```
[DEBUG-Cleanup] 클린업 함수 실행 - 위상: {isOn: true, isScrollable: true}  ← 리사이즈마다 호출됨!
[DEBUG-Cleanup] 최종 트리거 잔액 (좀비 체크): 0                             ← 깔끔하게 0
[DEBUG-Stage] 타임라인 빌드 완료 - 트리거 개수: 1                           ← 항상 1 유지
[DEBUG-Stage] 최종 레이아웃 가드 완료 - 트리거 개수: 2                      ← +1 (독립 트리거)
```

---

## 5. 핵심 교훈

| 원인 | 교훈 |
|:---|:---|
| `revertOnUpdate` 기본값 `false` | GSAP `useGSAP`을 의존성 배열과 함께 쓸 때는 **항상 `revertOnUpdate: true`를 명시** |
| 비동기 Context 탈출 | rAF/setTimeout 내부에서 GSAP 인스턴스 생성 시 **반드시 `ctx.add()`로 포획** |
| setTimeout 미취소 | 비동기 타이머는 항상 **ID를 Ref에 보존**하고 클린업에서 `clearTimeout` 필수 |
| 훅 순서 불변성 | 조건부 동작을 하는 훅(useGSAP)의 앞뒤 훅 순서가 바뀌면 React Rules of Hooks 위반 → 관련 훅들은 useGSAP **위에** 배치 |

> **이 문제가 특히 어려웠던 이유**: 클린업 코드 자체는 완벽하게 작성되어 있었지만, `revertOnUpdate`가 없어서 그 클린업이 **호출 자체가 되지 않는** 상황이었습니다. 코드의 논리가 아닌 프레임워크 옵션의 기본값에 의한 버그였기 때문에 원인 특정이 매우 난해했습니다.
