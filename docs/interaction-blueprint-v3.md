# 📜 네모:ON 전역 인터랙션 설계 청사진 (Blueprint History)

---

## [최신] 🏛️ V16.3: Modular & Unified Engine (2026-03-22)

V4.5의 데이터 기반 철학을 계승하되, 코드의 무결성과 관리 효율성을 위해 **초정밀 모듈화**와 **GSAP 단일화**를 완료한 최종 청사진입니다.

### 🧩 1. 엔진 모듈화 (Modular Heart)
- **`GlobalInteractionStage.tsx`**: 스크롤 라이프사이클 및 타임라인 조립(Orchestration) 전담.
- **`builders.ts`**: 로고, 네모, 스크롤 등 모든 시각적 타임라인의 **'설계도(Blueprint)'**를 함수형 빌더로 분리 관리.
- **`utils.ts`**: 기기 감지, 수치 보정, 좌표 정규화 등 **'기반 인프라'** 로직 집계.

### 🛡️ 2. 애니메이션 일원화 (Single Engine Policy)
- **Zero Framer Motion**: 프로젝트의 모든 애니메이션은 GSAP으로 통일됨. 모든 하위 컴포넌트(`RotatingText`, `HeroSlogan` 등)는 GSAP `useGSAP`을 통해 메인 엔진과 완벽한 싱크를 이룸.

---

# 📜 네모:ON 전역 인터랙션 설계 청사진 (v4.5)

> **최종 업데이트**: 2026-03-20
> **핵심 원칙**: "V4.5 Data-Driven Engine, 마스터 여정 시트, 정량적 상수화, 뼈대 무결성 보존"

---

## 🏗️ 1. 인터랙션 아키텍처 (Interaction Architecture)

### 1-1. 데이터 기반 엔진 (Data-Driven Engine)
- **Master Journey Sheet (`journey.ts`)**: 배경색, 로고 상태, 네모 상자 수치를 중앙에서 제어하여 로직과 데이터를 분리함.
- **Single Object Entity**: `SharedNemo`와 `JourneyLogo`의 물리적 연속성을 데이터 시트를 통해 정밀하게 관리함.

### 1-2. 무결성 뼈대 (System Skeleton)
- **Whole-Pin & Manual Scroll**: `#home-stage` 전체 핀 고정 및 Y축 직접 이동 방식을 절대 보존함.
- **Double-Lock Stabilizer**: 고정 좌표의 오차를 방지하기 위한 리프레시 로직을 고수함.

---

## ⏱️ 2. 정밀 타이밍 및 시각적 균형 (Timing & Visual Balance)

### 2-1. 선제적 완성 (ABC 90% Rule)
- 모든 전이 애니메이션은 섹션 이동 거리의 **90% 지점에서 선제적으로 완결**하여 정돈된 상태를 유지함.

### 2-2. 정량적 상수 관리
- **`interaction.ts`**: 헤더 좌표, 이징, 섹션 높이 등을 상수로 관리하여 1px 단위의 정밀한 영점 조절을 가능케 함.

---

## 🗺️ 3. 전역 인터랙션 여정 (The Journey Map - V4.5)

| 구간 (LABEL) | 로고 (JourneyLogo) | 상자 (SharedNemo) | 배경 (Env) |
| :--- | :--- | :--- | :--- |
| **HERO** | 네모:ON (빅타이포) | 초기 56px 투명 | **ON:Cream / OFF:Dark** |
| **START_TO_PAIN** | 헤더 안착 (네모) | 100vw/100vh 확장 | Dark Section |
| **TO_PAIN** | 헤더 안착 (네모) | 테두리 상자 수축 | Dark Section |
| **RESONANCE** | RECTANGLE 등장 (T) | 중앙 채워진 상자 | Dark Section |
| **TO_MSG** | **[REC+ANGLE] (+)** | 틸(Teal) 세로 박스 | **Cream (f7f1e9)** |
| **FORWHO** | 네모:ON 복구 | 가로 이미지 프레임 | Cream (f7f1e9) |
| **CTA** | 헤더 유지 | 뷰포트 다크 확장 | Dark Section |

---

## 🛠️ 4. 기술 구현 및 유지보수 지침

### 4-1. 전역 스타일 제어
- `CSS Variable`: `--bg`, `--header-fg`를 엔진에서 일괄 제어함.
- 데이터 수정 시 `GlobalInteractionStage.tsx`가 아닌 `journey.ts`를 수정함.

### 4-2. 에이전트 준수 규칙 (`.agent/rules`)
- 핀 구조, 타임라인 아키텍처, 더블 락 로직은 유지보수 시에도 절대 변경을 금지함.

---

## 🚀 5. 향후 고도화 로드맵

1.  **Phase 4 (Current)**: 최종 섹션 콘텐츠 주입 및 전 구간 영점 조절.
2.  **Phase 5**: `_calculateLabels()`의 완전 데이터 연동 및 반응형 동적 VH 계산 도입.
