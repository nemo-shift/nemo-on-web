# AI 가이드라인 (AI Guidelines) - V16.3

## 🔄 1. 세션 인수인계 (Handover)
- 매 세션 종료 시 `docs/handover/` 폴더 내의 **히스토리 스태킹(Stack)** 방식에 따라 문서를 업데이트한다.
- 새로운 세션 시작 시 AI는 `docs/rules/` 폴더를 최우선으로 정독하여 현재의 무결성 아키텍처를 숙지해야 함.

## 🛠️ 2. 모듈 기반 리팩토링 및 확장 가이드
- **Modular Sync**: 새로운 애니메이션 섹션을 추가할 경우, `GlobalInteractionStage.tsx` 본체를 수정하지 말고 `builders.ts`에 새로운 타임라인 빌더 함수를 추가하여 조립하는 방식을 취한다.
- **Util Centralization**: 기기 감지나 수치 보정 로직이 중복될 경우 반드시 `utils.ts`로 통합하여 일원화된 라이프사이클을 유지한다.

## 🚀 3. 애니메이션 구현 전략
- **GSAP Single Engine**: 프로젝트 내에서 `framer-motion` 사용을 엄격히 금지함. 모든 애니메이션은 GSAP `useGSAP` 훅을 사용해 구현한다.
- **Atomic → Composite**: 시각적 결과물(`JourneyLogo`, `SharedNemo`)을 독립적으로 완성한 뒤, `builders.ts`를 통해 마스터 타임라인에 정밀하게 편입시킨다.

## ⚠️ 4. 주의사항 (Integrity)
- **Single Source**: 인터랙션 좌표(`left`, `top`), 크기(`width`, `height`), 색상(`bg`)의 제어권은 컴포넌트 내부가 아닌 `journey-data.ts`가 독점한다. AI는 데이터를 통한 튜닝을 최우선으로 한다. 
