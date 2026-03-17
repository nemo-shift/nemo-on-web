# AI 가이드라인 (AI Guidelines)

## 🔄 1. 세션 인수인계 (Handover)
- 매 세션 종료 시 `project-state.md`와 `current-task.md`를 업데이트하여 연속성을 유지한다.
- 새로운 세션 시작 시 AI는 `docs/rules/` 폴더를 최우선으로 정독해야 함을 명시한다.

## 🧩 2. 컴포넌트 구현 전략
- **Atomic → Composite**: 작은 시각 컴포넌트(`JourneyLogo`, `SharedNemo`)를 독립적으로 완성하고, 이를 큰 타임라인(`GlobalInteractionStage`)에 조립하는 분리 구현 방식을 필수로 한다.
- **Ref 기반 제어**: 성능 최적화를 위해 GSAP 애니메이션은 React State가 아닌 Ref를 통한 직접적인 DOM 조작을 선호한다.

## ⚠️ 3. 주의사항
- **Single Source**: 로고와 네모의 위치/크기 제어권은 `GlobalInteractionStage`가 독점하며, 자식 컴포넌트는 렌더링에만 집중한다.
