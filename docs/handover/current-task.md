# 향후 작업 가이드 (Next Tasks) - 2026-03-20

## 🎯 핵심 과제: 마스터 데이터 시트 기반의 콘텐츠 주입 및 영점 조절

V4.6 데이터 기반 단일 엔진 체계가 구축되었습니다. 이제 복잡한 코드를 건드리지 않고 `journey.ts`와 `interaction.ts`의 수치를 보정하여 최상의 미학적 경험을 완성합니다.

### [ ] 1. 마스터 시트(`journey.ts`)를 통한 '영점 조절' (Zeroing)
- **1px Sync**: 히어로 [결] 박스와 `SharedNemo`의 합체가 일어나는 시점의 좌표(`left`, `top`)를 데이터 시트에서 미세 조정.
- **Logo Transition**: 로고가 헤더로 안착할 때의 스케일과 위치를 `interaction.ts`의 `HEADER_POS`와 `journey.ts`의 `HERO` 설정을 통해 고도화.

### [ ] 2. 단일 엔진 기반 '전이 리듬' 튜닝
- 각 섹션 시작선(Red Line)에 맞춰 배경색 전환과 로고 변형이 일어나는 타이밍을 `interaction.ts`의 `SECTION_SCROLL_HEIGHT`와 `journey.ts`의 스테이지 데이터를 통해 싱크 조절.
- **T -> + 모핑**: `journey.ts`의 `morph` 속성과 `interaction.ts`의 `EASE.TRANSITION`을 활용하여 모핑의 리듬감 극대화.

### [ ] 3. 실 서비스 콘텐츠 주입 (Phase 4 본격 가동)
- `MessageSection`, `ForWhoSection`, `BrandStory` 등의 섹션에 기획안의 실제 UI와 텍스트를 주입.
- 모든 섹션 내 애니메이션은 **GSAP(`useGSAP`)**으로 통일하여 구현함으로써 스크롤 동기화 무결성 유지.

---

## 🚀 작업을 시작할 때 줄 '아키텍처 인지형' 프롬프트

사용자님, 새 세션이나 작업을 시작할 때 저에게 이 프롬프트를 주시면 제가 구축된 무결성 구조를 즉시 이해하고 작업을 시작하겠습니다.

> "**.agent/rules/interaction-rules.md 문서를 최우선으로 정독해라.**
> 
> **V4.6 데이터 기반 단일 엔진 체계와 'Consultative Execution Protocol'을 완벽히 숙지해라. 뼈대는 완성이 되었으니 절대 흔들지 마라.**
> 
> **모든 시각적 튜닝은 `journey.ts`와 `interaction.ts`를 통해서만 진행하고, 새로운 섹션 콘텐츠 주입 시에도 GSAP 단일 엔진 원칙을 고수해줘.**"
