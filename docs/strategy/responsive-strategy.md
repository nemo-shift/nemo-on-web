# 반응형 레이아웃 공식 사양서 (Responsive Strategy & Standard)

## 1. 개요 (Objective)

네모:ON 웹사이트의 반응형 전략은 **'모바일의 절대적 안정성'**과 **'PC의 파격적인 유동성'**을 동시에 확보하는 것을 목표로 합니다. 특히 브라우저 주소창(Address Bar) 변화에 대응하며 시각적 무결성을 유지하는 것을 최우선으로 합니다.

---

## 2. 기기별 대응 매트릭스 (Breakpoint Matrix)

| 구분                   | 범위 (Width)      | 레이아웃 전략          | 주요 단위 및 특징                           |
| :--------------------- | :---------------- | :--------------------- | :------------------------------------------ |
| **Mobile (Portrait)**  | `< 768px`         | **Fixed-Proportional** | `px`, `vw` 조합 / 브라우저 UI 보호          |
| **Tablet (Portrait)**  | `768px ~ 1023px`  | **Stable-Mobile**      | 모바일 레이아웃의 확장형 / 안정성 위주      |
| **Tablet (Landscape)** | `1024px ~ 1279px` | **Touch-Premium**      | PC 레이아웃 기반 / 터치 최적화(Hover 제거)  |
| **PC (High-res)**      | `≥ 1280px`        | **High-Fluid**         | `clamp()`, `dvh` / 파격적인 유동형 스케일링 |

---

## 3. 핵심 기술 규격 (Technical Specs)

### 3.1. 높이 안정화 (Height Stability)

모바일 브라우저의 주소창 출렁임(Address Bar Jolt)을 방지하기 위해 다음 단위를 표준으로 사용합니다.

- **`dvh` (Dynamic Viewport Height)**: 현재 실제로 보이는 영역에 맞게 실시간 대응.
- **`svh` (Small Viewport Height)**: 주소창이 확장되어 가장 좁아진 상태를 기준으로 하여 컨텐츠 잘림 방지.

### 3.2. 유동형 타이포그래피 (Fluid Typography)

PC 환경에서는 화면 너비에 따라 폰트와 로고 사이즈가 유동적으로 변하는 `clamp` 공식을 적용합니다.

- **표준 공식**: `text-[clamp(min, preferred, max)]`
- **예시**: `text-[clamp(1.2rem, 2vw+0.5rem, 2rem)]`

### 3.3. 시스템 세이프 에어리어 (Safe Area Protection)

OS의 컨트롤 바(Home Indicator 등)와 컨텐츠가 겹치지 않도록 여백을 강제 확보합니다.

- `padding-bottom: env(safe-area-inset-bottom)`
- `padding-top: env(safe-area-inset-top)`

---

## 4. 로고 및 브랜드 요소 가이드 (Branding Assets)

- **NemoIcon 표준**: 모든 기기에서 `NemoIcon` 컴포넌트를 사용하여 형태의 일관성을 유지합니다.
- **중앙 정렬 로직**: 모바일과 태블릿 세로 모드에서는 로고를 **화면 정중앙(Fixed Center)**에 배치하여 시각적 안정감을 극대화합니다.
- **PC 유동형 로고**: PC에서는 헤더 좌측 상단에 위치하되, 너비에 따라 비례적으로 크기가 최적화됩니다.

---

## 5. 단계별 적용 로드맵

1. **Step 2-1 (완료)**: `useDeviceDetection` 훅에 `isInitialized` 및 `dvh` 대응 로직 안정화.
2. **Step 2-2**: 전역 하드코딩된 `window.innerWidth` 체크를 위 규격에 맞게 훅으로 일괄 치환.
3. **Step 3-1**: 로고 및 주요 텍스트에 `clamp()` 기반 유동형 수치 도입.
4. **Step 3-2**: 기기별 레이아웃 전역 검수 및 최종 무결성 확보.

v4.5 최종 자동 동기화. 뼈대는 완벽히 보존되었습니다.
