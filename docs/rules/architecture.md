# 아키텍처 규칙 (Architecture) - V12.0+

## 🧩 1. 초정밀 모듈화 (Modular Interaction Heart)
`GlobalInteractionStage`의 비대화를 방지하고 유지보수성을 높이기 위해 관심사를 엄격히 분리함.

- **Heart (`GlobalInteractionStage.tsx`)**: 
    - 스크롤 트리거 설정, 프로젝트 라이프사이클 관리, 타임라인 조립(Assembly) 역할만 수행.
    - 실제 애니메이션 세부 수치나 로딩 로직을 포함하지 않음.
- **Builders (`builders.ts`)**: 
    - 로고(`LogoTl`), 네모(`NemoTl`), 스크롤(`/ScrollTl`) 등 실제 GSAP 타임라인을 구축하는 팩토리 함수들의 집합.
    - 애니메이션의 시퀀스와 이징, 타이밍을 결정하는 핵심 로직부.
- **Utils (`utils.ts`)**: 
    - 기기 감지(`isMobile`), 수치 정규화, 로컬 상수 등 인프라 성격의 헬퍼 함수 집합.
    - `ScrollTrigger.refresh()`와 같은 저수준 API 제어 로직 포함.

## 🛡️ 2. 데이터 시트 우선 (Data-Driven Priority)
- 모든 시각적 인자(좌표, 크기, 색상)는 컴포넌트 내부가 아닌 `journey-data.ts`와 `interaction.ts`에서만 보정함.
- 컴포넌트는 오직 전달받은 `ref`와 데이터를 시각적으로 표현하는 역할에 충실함.

## 🔒 3. 컴포넌트 소유권 (Ownership)
- **Global Stage**: 전체 마스터 타임라인 및 핀(Pin) 제어권 독점.
- **Internal Components**: `useGSAP`을 사용하여 개별 컴포넌트 내의 애니메이션을 작성하되, 전역 스크롤과 연동되는 경우 반드시 마스터 타임라인의 `labelling` 시스템과 동기화해야 함.

## ⚠️ 4. 수정 금지 구역 (Safe-Guard)
- `layout.tsx`의 전역 스크롤 컨테이너 구조 및 `id="home-stage"`의 스위칭 로직은 절대 변경 금지.
- 스크롤 가중치 계산 수식(`ScrollTrigger`의 `end` 설정)은 아키텍처의 근간이므로 임의 수정 금지.
