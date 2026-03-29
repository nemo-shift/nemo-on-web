# 네모:ON 최종 인터랙션 설계서 (Design Spec History)

---

## [최신] 🏛️ V11.21: Hero Component JIT Isolation Architecture

히어로 섹션의 컴포넌트 라이프사이클을 모드(OFF/ON)에 따라 **물리적으로 완전 격리**하는 설계 표준입니다.

### ⚓ 1. JIT(Just-in-Time) 마운트 전략
- **오프모드(OFF)**: `HeroPhraseLayer`, `ShapesStage`는 DOM에서 **완전 제거(Unmounted)**. 터치 간섭, SVG 연산, GSAP 바인딩 모두 0%.
- **전환 시작**: 토글 클릭 직후 `isTransitioning: true`가 되면 `{(isOn || isTransitioning) && ...}` 조건에 의해 마운트. `#hero-nemo-origin` 기준점이 DOM에 생성되어 `buildHeroSwapSequence`가 위치를 정확히 계산.
- **온모드(ON)**: 전환 완료 후 파티클 캔버스(`{!isOn && <canvas />}`)와 램프 이펙트는 DOM에서 제거. 크림 배경의 순수한 미니멀리즘 확보.

### 🍱 2. 히어로 컴포넌트 소유권 맵 (V11.21)
| 컴포넌트 | 모드 | 역할 |
| :--- | :--- | :--- |
| `HeroSloganOff.tsx` | OFF 전용 | 로테이팅 텍스트 ("흐릿한 [아이디어를...] 작동하는 브랜드로.") |
| `HeroSloganOn.tsx` | ON 전용 | 단어별 포커스 블러 ("불안을 끄고, 기준을 켭니다") |
| `HeroPhraseLayer.tsx` | ON + Transitioning | "감성 위에 구조를 더해 당신의 결로" + `#hero-nemo-origin` 앵커 |
| `ShapesStage.tsx` | ON + Transitioning | 원(감성), 세모(구조), 네모(결) SVG 도형 |
| `HeroToggle.tsx` | OFF 전용 | ON/OFF 토글 스위치 |
| `HeroOffCta.tsx` | OFF 전용 | "스위치를 켜고, 브랜드를 켜세요" CTA |
| `canvas` (파티클) | OFF 전용 | 배경 파티클 캔버스 |

### 🧩 3. 레거시 파일 (삭제 대상)
- `HeroOffSlogan.tsx`: v6 시절 유산, 프로젝트 어디에서도 미사용 (고아 파일)
- `HeroSlogan.tsx`: V11.21 이전의 하이브리드 통합 컴포넌트, 3개 뷰에서 더 이상 import하지 않음

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
