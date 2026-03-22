# 인터랙션 규칙 (Interaction) - V16.3

## ⏱️ 1. 타임라인 동기화 (Strict Whole-Pin)
- **Single Track**: 모든 전역 애니메이션은 `GlobalInteractionStage`의 단일 마스터 타임라인에 소속됨.
- **Total Pinning**: `#home-stage` 전체에 `pin: true`를 적용하고 타임라인으로 섹션 이동을 제어함.
- **Double-Lock**: 스크롤 해제 시 `requestAnimationFrame`과 `ScrollTrigger.refresh()` 지연 호출을 통해 레이아웃 좌표를 보정함.

## 🔡 2. 로고 여정 (Logo Journey)
- **Builders 관리**: 로고의 변형 및 궤적 로직은 `builders.ts`의 `buildLogoTimeline`에서 독점적으로 관리함.
- **T -> + Morph**: `RECTANGLE`의 'T'가 '+' 기호로 교차 페이드되며 변형되는 시각 언어 준수.

## ⬛ 3. 네모 모핑 (Nemo Morphing)
- **Shared Object**: 하나의 `SharedNemo`가 배경 확장, 테두리 박스, 이미지 마스크 등으로 연속 변형됨.
- **Builders 관리**: 네모의 모핑 로직은 `builders.ts`의 `buildNemoTimeline`에서 관리함.

## 🚀 4. 단일 엔진 원칙 (Single Engine Policy - GSAP)
- **Zero Framer Motion**: 프로젝트 내 모든 `framer-motion` 사용을 금지함. 모든 애니메이션은 **GSAP(`useGSAP`, `gsap`)**으로만 작성해야 함.
- **No Hybrid Animation**: 서로 다른 애니메이션 라이브러리를 혼용할 경우 스크롤 동기화 및 렌더링 성능에 치명적이므로 절대 금지함.
- **Stagger & Timeline**: 복합 애니메이션은 GSAP의 `stagger` 기능과 타임라인 체이닝을 활용하여 구현함.

## ⚙️ 5. 기술 스택
- **GSAP + ScrollTrigger**: 애니메이션 핵심 엔진
- **Lenis**: 스무스 스크롤 인프라
- **Matter.js**: 물리 효과 전용 (최소화하여 사용)
