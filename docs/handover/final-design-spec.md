# 네모:ON 최종 인터랙션 설계서 (Design Spec History)

---

## [최신] 🏛️ V16.3: Modularized Data-Driven Spec

V12.0~V16.3 고도화를 통해 정립된 모듈형 설계 표준입니다.

### 🧩 1. 아키텍처 원칙: 관심사 분리
- **`GlobalInteractionStage.tsx` (Heart)**: 스크롤 핸들링 및 타임라인 조립.
- **`builders.ts` (Logic)**: 실제 타임라인 시퀀스 구축 (로고, 네모, 스크롤 빌더).
- **`utils.ts` (Core Helpers)**: 기기 감지, 수치 정규화, 로컬 상수 허브.

### 🛡️ 2. 단일 엔진 원칙 (GSAP Only)
- 모든 `framer-motion` 제거. 스크롤 동기화 무결성을 위해 GSAP 단체 체계 사수.

### ⚠️ **DANGER ZONE**
- `builders.ts` 분리 원칙 준수: 타임라인 수정 시 엔진 본체가 아닌 개별 빌더 함수를 수정할 것.

---

## 🏛️ V4.5: Data-Driven Interaction Spec (2026-03-20)

`master-prompt.md`의 기획을 실제 코드로 구현한 초기 데이터 기반 아키텍처 설계도입니다.

### ⏱️ 데이터 기반 구동 (Data-Driven Engine)
- **마스터 여정 시트 (`journey.ts`)**: 모든 섹션의 상태를 중앙 관리.
- **전역 상수화 (`interaction.ts`)**: 정량적 수치를 상수로 관리.

### 🏗️ 아키텍처 원칙 (V4.5 무결성 표준)
- **절대 변경 금지**: #home-stage 핀 구조, 타임라인 가중치 계산 방식 보존.
- **Double-Lock**: 좌표 무결성 확보 로직 보존.

---

## 🔡 로고 여정 및 네모 모핑 히스토리

- **V4.5**: DOM 기반 로고 렌더링, T-Morphing, Fixed Proxy 전략 수립.
- **V16.3**: 로고 및 네모 타임라인 로직을 `builders.ts`로 격리하여 안전성 강화.

---

| Stage | Nemo Shape | Logo State | Background |
| :--- | :--- | :--- | :--- |
| **HERO** | 초기 56px (투명) | 빅 타이틀 (네모:ON) | **ON:Cream / OFF:Dark** |
| **START_TO_PAIN** | **100vw/100vh (배경화)** | 헤더 안착 (네모) | #0D1A1F (Dark) |
... (이후 데이터 시트와 동일)
