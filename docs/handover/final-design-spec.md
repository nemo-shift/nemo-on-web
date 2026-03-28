# 네모:ON 최종 인터랙션 설계서 (Design Spec History)

---

## [최신] 🏛️ V11.2: PC Hero 'Switch Pivot' Architecture

PC 환경의 압도적인 첫인상을 위한 **'버티컬 스파인(Vertical Spine)'** 및 **'피벗 타이포그래피(Pivot Typography)'** 설계 표준입니다.

### ⚓ 1. 버티컬 스파인 (Vertical Spine) 구조
- **Central Axis**: 브랜드 로고(Top) → 토글 스위치(Center) → 이중 슬로건(Bottom)이 하나의 수직축에 정렬되어 시각적 위계 확립.
- **Visual Depth**: 슬로건을 단순 텍스트가 아닌 낮은 투명도의 '시각적 지층(Backdrop)'으로 취급하여 토글 스위치가 그 위에 떠 있는 듯한 입체감 형성.

### 🍱 2. 스위치 피벗 (Switch Pivot) 타이포그래피
- **Dual Layer Stagger**: 'Turn on the Switch,'와 'Switch on the Brand.'를 각기 다른 방향으로 오프셋(`translateX`)하여 중앙의 'Switch' 단어를 축으로 한 지그재그 균형미 구현.
- **High-Stretch Scaling**: `scaleX(0.6)`, `scaleY(2)`의 극한 조절을 통해 정교한 세리프(`EB Garamond`)를 건축적 기둥으로 변모시키는 하이엔드 기법 적용.

### 🧩 3. 반응형 분기 전략 (PC vs Mobile)
- **Hybrid Hero Layer**: `isMobile` 플래그를 통해 모바일(수평/간결)과 PC(수직/웅장)의 레이아웃을 완전히 독립적으로 렌더링하면서도 동일한 브랜드 정체성을 유지.

---


## [최신] 🏛️ V14.8: Menu System & Interaction Standards

V13.0~V14.8 고도화를 통해 정립된 메뉴 인터랙션 및 스타일 캡슐화 표준입니다.

### ⚓ 1. 메뉴 시스템 아키텍처
- **`MenuSystem.tsx` (Wrapper)**: `isOpen` 상태를 중앙 관리하며 `MenuToggle`과 `SideMenu`를 조율.
- **`MenuToggle.tsx` (Controller)**: 3단계 SVG 모핑을 통한 직관적 상태 피드백 (☰ ↔ ◀ ↔ ▶).
- **`SideMenu.tsx` (Panel)**: 3중 레이어 슬라이드 및 All-at-once 닫기 로직 적용.

### 🍱 2. 상수 기반 스타일 및 캡슐화 (Scoped Style)
- **`interaction.ts`**: `MENU_WIDTH`, `INTERACTION_Z_INDEX.MENU_TOGGLE` 등 모든 수치를 중앙 집중화.
- **Zero Globals**: `:root` 대신 특정 클래스(`.side-menu-container`)에 CSS 변수를 가두어 스타일 충돌 방지.

### 🧩 3. 아키텍처 원칙: 관심사 분리
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
