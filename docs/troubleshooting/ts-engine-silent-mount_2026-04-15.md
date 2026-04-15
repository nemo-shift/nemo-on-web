# Troubleshooting: 홈페이지 복귀 시 엔진 기동 실패 (Silent Mount)

## 1. 현상 (Issue Context)
- **증상**: 다른 페이지(서브 페이지)를 방문한 후 다시 홈('/')으로 복귀했을 때, `GlobalInteractionStage` 컴포넌트는 마운트되지만 인터랙션 타임라인이 빌드되지 않아 화면이 멈춰있는 현상 발생.
- **특이사항**: 페이지를 새로고침(F5)하면 정상 작동하나, Next.js 클라이언트 라우팅(Link 이동)으로 복귀할 때만 발생함.

## 2. 원인 분석 (Root Cause Analysis)

### 2.1 포탈 마운트와 Refs의 불일치
인터랙션 엔진은 `useGSAP` 내부에서 실행되며, 로고(`logoHandle`), 네모(`nemoHandle`) 등의 Refs가 확보되어야만 빌드를 시작합니다.
```tsx
// GlobalInteractionStage.tsx (수정 전)
useGSAP(() => {
  if (!logo?.containerEl || !nemo?.nemoEl || !falling) return; // [문제의 지점]
  // ... 엔진 빌드 로직
}, { dependencies: [isScrollable, isOn, ...] });
```

### 2.2 클라이언트 라우팅의 '의존성 정체'
1. **첫 마운트**: `useGSAP`이 실행되지만, `createPortal`로 렌더링되는 Refs가 아직 DOM에 붙기 전이므로 `return`으로 조기 종료됨.
2. **복귀 시**: 클라이언트 라우팅으로 복귀하면 `isScrollable`, `isOn` 등의 의존성 변수들이 이미 `true`인 상태로 유지됨.
3. **재빌드 누락**: `useGSAP`의 의존성 배열에 변화가 없으므로, 리액트는 이 훅을 다시 실행하지 않음. 엔진은 '영원히' 첫 번째 조기 종료 상태에 머물게 됨.

## 3. 해결 방안 (Solution Path)

### 3.1 핀셋 트리거 (Pinpoint Trigger) 시스템 도입
의존성의 정체를 깨뜨리기 위해, 컴포넌트 마운트 직후 엔진의 상태를 체크하여 수동으로 기동 신호를 보내는 로직을 추가했습니다.

### 3.2 핵심 로직
1. **`revision` 상테 추가**: 엔진 빌드를 강제로 유발할 수 있는 숫자형 상태값.
2. **감시자(Watcher) 배치**: `mounted`가 `true`인데 `masterTl.current`가 `null`인 '비정상적 침묵' 상태를 감시.
3. **비상 기동**: 위 조건 만족 시 `revision`을 증가시켜 `useGSAP`을 재실행 시킴.

```tsx
// [V11.6] 핀셋 기동 트리거
useEffect(() => {
  if (mounted && !masterTl.current && logoHandle.current?.containerEl) {
    setRevision(prev => prev + 1); // 엔진 깨우기
  }
}, [mounted]);
```

## 4. 교훈 및 결론
- **Next.js의 상태 보존**: 전역 컨텍스트나 라우팅 간 유지되는 상태값을 의존성으로 가진 훅은 복귀 시점에 재실행되지 않을 수 있음을 명심해야 함.
- **Refs Ready 보장**: 포탈을 사용하는 컴포넌트에서 Refs에 의존하는 애니메이션 엔진을 돌릴 때는, 마운트 직후 Refs의 존재 여부를 한 번 더 확인하는 '이중 체크(Double-Check)' 메커니즘이 필수적임.

---

## 5. 심화 분석: 전역 포인터 레이스 컨디션 (Race Condition Defense)

### 5.1 문제: 전역 Ref 오염
초기 설계에서는 클린업 함수에서 전역 Ref인 `masterTl.current.kill()`을 호출했습니다. 하지만 리사이즈나 페이지 이동이 빈번할 때, **"과거 세션의 클린업"**이 **"새로 생성된 세션의 엔진"**을 죽여버리는 레이스 컨디션이 발생했습니다.

### 5.2 해결: 로컬 캡처 (Local Capture)
각 렌더링 세션마다 `localTl`과 `localTrigger` 변수에 인스턴스를 즉시 박제합니다. 클린업 단계에서는 전역 Ref가 아닌 이 **로컬 변수**를 참조하여, 오직 자신이 생성한 인스턴스만 정확히 제거하도록 보장했습니다.

```tsx
// [V11.2] 로컬 캡처 로직 예시
let localTl = null;
const ctx = gsap.context(() => {
  localTl = gsap.timeline(...); // 현재 세션의 인스턴스 박제
});

return () => {
  if (localTl) localTl.kill(); // 내가 만든 놈만 정밀 타격
};
```

## 6. 전략적 상태 복원 (State Restoration Strategy)

### 6.1 isOn과 isScrollable의 분리
홈 복귀 시 `sessionStorage`를 통해 상태를 복구할 때, `isOn`은 `true`로 복구하지만 `isScrollable`은 의도적으로 복구 대상에서 제외했습니다.

### 6.2 UX 보존 이유 (Hero Intro Preservation)
- **isOn**: 배경 색상, 로고 위상 등 '공간의 테마'를 결정하므로 즉시 복구되어야 시각적 이질감이 없습니다.
- **isScrollable**: 이 값이 즉시 `true`가 되면 히어로 섹션의 "ON 모드 진입 애니메이션(인트로)"을 건너뛰고 바로 스크롤이 가능해집니다. 이는 사용자에게 인터랙션의 흐름을 강제로 생략하는 불쾌한 경험을 줍니다.
- **결론**: 배경은 복구하되, 스크롤 잠금 해제 제어권은 엔진의 기동 시퀀스에 다시 맡김으로써 **"복귀했음에도 불구하고 매끄러운 인트로"**를 유지하게 했습니다.
