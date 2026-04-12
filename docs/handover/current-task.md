> [!NOTE]
> **문서 목적**: 네모:ON의 **'현재 진행 상황'** 실시간 기록소. 우리가 지금까지 완벽하게 완수한 성취(✅)와 오늘 당장 땀 흘려 처리 중인 작업들을 관리하여 프로젝트의 연속성을 보장함.
> **관련 문서**: [future-backlog-ideas.md](file:///d:/네모ON/네모ON Studio/네모ON/docs/handover/future-backlog-ideas.md) (미래 과제 및 보관소)

## [최신] ✅ 2026-04-12: V11.41 공명 및 페인 내러티브 정밀 고도화 성료

페인 섹션의 읽기 호흡을 '머무름(Hold)' 중심으로 재편하고, 공명 섹션의 하이브리드 내러티브(PC 마퀴/터치 슬라이드)를 하이엔드 수준으로 끌어올려 섹션 간 전이 무결성을 완성했습니다.

### 💎 주요 달성 성과 (V11.41 - Narrative Precision)

- **Hybrid Resonance Narrative**:
    - **Touch**: 4단계 글자별 부상(Float-up) 시퀀스 완비 및 '1스크롤 1문장' 쾌속 리듬 확보.
    - **PC**: 뷰포트(`vw`) 기반 오프스크린 진입 로직 도입으로 문장 시작 지점 무결성 해결.
- **Pain Narrative 'Ani-Hold' Ratio (30:70)**: 
    - 입차 애니메이션 기간을 30%로 압축하고 머무름(Hold) 구간을 70%로 확보하여 쾌적한 읽기 경험 선사.
- **Visual Transition Polish**:
    - **Morphing Continuity**: 네모 모핑 시작 시 5번 페인포인트 텍스트 및 스크롤 힌트 자동 소거 적용.
    - **Keyword Fade-out**: 메세지 섹션 진입 시 바닥의 감정 키워드들이 자연스럽게 페이드 아웃되는 전이 연출 구현.
- **MenuToggle Touch Integrity Guard**:
    - 터치 기기(`interactionMode: touch`)에서 마우스 기반 호버 이벤트(`mouseenter`)로 인해 아이콘이 삼각형으로 고착되는 버그 근본 해결.
- **System Stability**:
    - `SplitText` 컴포넌트의 Ref 타입 에러(Null 처리) 해결 및 역방향 스크롤 시 시각적 일관성 검증 완료.

### 🧩 V11.41 차기 핵심 고도화 과제 (Active)

- [ ] **[Resonance Easing Tuning]**: 흰색(수축)에서 크림색(확장)으로 변하는 2단계 전이의 이징을 물리적 무게감이 느껴지도록 시네마틱 보정.

## [최신] 🚀 2026-04-10: V11.40 공명 시퀀스 기초 오케스트레이션 및 레이어 정규화

페인(Pain) 섹션의 피날레인 공명 시퀀스의 기초 뼈대를 구축하고, 히어로와 네모 간의 레이어 충돌을 아키텍처적으로 해결했습니다. 특히 개발 효율을 극대화하면서도 배포 안정성을 담보하는 '안전 디버그 시스템'을 도입했습니다.

### 🧩 V11.40 차기 핵심 고도화 과제 (CRITICAL)

- [ ] **[Step 4: 기기별(PC/Mobile) 공명 시퀀스 디테일 튜닝]**: 
    - **미완료 상태**: 현재 `18vw`, `70vw` 등의 수치가 혼재되어 있어 PC와 모바일 각각에서 최적의 비율을 찾는 정밀 조정이 필요함.
    - **핵심 작업**: `debug.ts`와 `constants/interaction.ts`를 활용하여 기기별 최적 크기 및 색상 변이 임계값을 확정할 것.
- [ ] **[Resonance Easing Tuning]**: 흰색(수축)에서 크림색(확장)으로 변하는 2단계 전이의 이징과 타이밍을 시네마틱하게 보정.

### 💎 주요 달성 성과 (V11.40 - Infrastructure & Resonance Foundation)

- **Layer Architecture Normalization**:
    - `INTERACTION_Z_INDEX` 중앙 집중화로 히어로 콘텐츠(11)가 전역 스테이지(10) 및 네모(5) 위에 오도록 위계 정립.
    - 하드코딩된 `zIndex: 20` 등을 전수 소탕하여 상수 시스템으로 통합.
- **2-Stage Resonance Flow**:
    - 브릿지 메시지(상아색 수축) → 메인 메시지(크림색 확장)로 이어지는 2단계 배경 변이 및 동적 텍스트 색상 전환 로직 구현.
- **Safe Debug Infrastructure**:
    - `src/constants/debug.ts` 및 `HeroContext` 하이재킹 가드를 통해 버튼 조작 없이 특정 섹션으로 즉시 점프하는 개발 환경 구축.
    - 배포 전 삭제가 필요한 모든 위치에 `// 🔥 [DEBUG-DELETE]` 확성기 주석 인덱싱 완료.

## [최신] ✅ 2026-04-04: V11.33 인터랙션 정규화 및 아키텍처 정화 성료 (참조: v11.33-interaction-normalization.md)

네모:ON의 인터랙션 위계를 4단계로 정밀화하고, 전역 브레이크포인트를 `744px(tablet-p)`로 단일화하여 아키텍처적 무결성을 최종 확보했습니다. 또한 `hero.ts`의 데이터 시발점을 '진실(isOn)'에 기반하도록 재건했습니다.

### 💎 주요 달성 성과 (V11.33 - Normalization & Integrity)

- **MenuToggle 4-Step Interaction**: ☰ ▷ X ◁ 시퀀스 확립 및 모바일 사이즈(40px) 최적화로 조작성 개선.
- **Breakpoint SSOT (744px)**: 레거시 `md:(768px)`를 전수 소탕하고 모든 반응형 로직을 `tablet-p` 규격으로 통일(23개 파일 동기화).
- **Initial Data Integrity**: `hero.ts`의 `lastEnv` 초기화 시 `isOn` 상태를 선제 인식(Optional Chaining 적용)하여 데이터 시발점 불일치 해결.
- **System Restoration**: 인코딩 장애(UTF-8 파편) 극복 및 훼손된 모든 한국어 메타데이터/주석 정교한 수동 복원 완료.

---

## [최신] ✅ 2026-04-03: V11.34 리사이즈 무결성 엔진 및 색상 동기화 가드 정복 (참조: v11.34-resize-sync.md)

GSAP의 리사이즈 스크롤 튕김 현상과 로고 색상 유실(`rgba(0,0,0,0)`) 문제를 엔진 차원에서 해결하고, 어떤 환경에서도 시각적/기능적 무결성을 유지하는 **[V11.34 동기화 아키텍처]**를 완성했습니다.

### 💎 주요 달성 성과 (V11.34 - Resilience Engineering)

- **Pixel-Perfect Restoration**: `rawScrollYRef` 픽셀 스냅샷과 `window.scrollTo` 강제 주입을 통해 리사이즈 즉시 원래 위치로 찰나의 복구 성공.
- **Double-Lock Physics Guard**: `isRestoringRef` 플래그로 복원 중 물리 엔진 콜백을 잠궈 좀비 키워드 중복 생성 현상 100% 진압.
- **Triple-Layer Color Integrity**: `fromTo` 체이닝, `initGlobalStyles` 동기 가드, `invalidateOnRefresh` 제거를 통해 로고 색상 유실 원천 차단.
- **Engine Stability**: `Footer` 리사이즈 디바운스(200ms) 및 `builders/pain.ts` Pure TS 리팩토링으로 시스템 부하 경감 및 유지보수성 향상.

### 🧩 V11.34 차기 정밀 고도화 과제 (Active)

- [ ] **[Step 3: 초정밀 미세 좌표 보간]**: 브라우저 상단 바 이동 등 미세 리사이즈 시 발생하는 1~10px의 좌표 오차를 수동 갱신(`refresh`) 및 이징(`gsap.to`)으로 부드럽게 보정.
- [ ] **[System Cleanup]**: 성능 확인을 위해 심어둔 수많은 디버깅 로그(`before buildLogo` 등) 및 임시 주석 전수 제거.
- [ ] **[Pure TS Expansion]**: `hero.ts`, `message.ts` 등 타 섹션 빌더들로 `{ current: boolean }` 순수 타입 아키텍처 확산 적용.

## [최신] 🚀 2026-03-31: V11.32 반응형 아키텍처 3축 체계(3-Axis System) 정규화 도약

기존의 모호한 브레이크포인트 대응 방식에서 탈피하여, **Tailwind(공간), JS(레이아웃), interactionMode(동작)**라는 3개의 독립적인 축으로 반응형 시스템을 전면 재편했습니다.

### 💎 주요 달성 성과 (V11.32 - Responsive Revolution Finalized)

- **Legacy Purge Complete**: `isMidRange`, `isPC` 등 기획적/기술적 혼선을 주던 너비 기반 변수를 모든 UI 컴포넌트에서 전수 제거.
- **3-Axis Normalization**:
  - 시각적 수치: Tailwind 전담 (인라인 스타일 제거).
  - 컴포넌트 분기: `isMobileView`, `isTabletPortrait` 전담.
  - 동작 로직: `interactionMode === 'touch'` 전담.
- **Zero-Error Integrity**: 18개 핵심 파일 수술 후 `TSC 0 Errors` 달성으로 기술적 부채 완전 청산.

### 🧩 V11.32 향후 고도화 과제

- [x] **[표준 레이아웃 비례 고정]**: 3축 체계 기반의 황금 비례 검증 완료.
- [x] **[Ultra-Flat Viewport 한계 테스트]**: `min(vw, vh)`와 Tailwind의 조합으로 글자 겹침 방지 무결성 확보.
- [ ] **[Edge-Case Device Optimization]**: iPad Pro 등 특정 고사양 태블릿에서의 시각적 미세 조정.
- [ ] **[Pointer Mode Transition Polish]**: 모바일 환경에서 블루투스 마우스 연결 시 `interactionMode`의 실시간 전환 매끄러움 테스트.

## 🚀 2026-03-29 (3): V11.21 히어로 컴포넌트 JIT 격리 및 자원 최적화

히어로 섹션의 OFF/ON 컴포넌트를 물리적으로 완전 분리하고, 오프모드에서 불필요한 DOM 노드를 원천 제거하여 터치 간섭 0% 및 성능 최적화를 달성했습니다.

### 💎 주요 달성 성과 (V11.21 - JIT Isolation)

- **Slogan Physical Separation**: `HeroSlogan.tsx`(하이브리드)를 `HeroSloganOff.tsx`(OFF 전용)와 `HeroSloganOn.tsx`(ON 전용)으로 완전 분리하여 레이어 간섭 원천 차단.
- **JIT(Just-in-Time) Mount Strategy**: `HeroPhraseLayer`와 `ShapesStage`를 `{(isOn || isTransitioning) && ...}` 조건으로 감싸 오프모드에서는 DOM에서 완전 제거(Unmounted). 토글 클릭 직후에만 찰나의 차이로 마운트되어 `#hero-nemo-origin` 기준점 제공.
- **Canvas Cleanup**: 파티클 캔버스를 `{!isOn && <canvas />}` 조건으로 온모드 진입 시 DOM에서 완전 제거하여 GPU 부하 해소.
- **Legacy Identification**: `HeroOffSlogan.tsx`가 프로젝트 어디에서도 사용되지 않는 고아 파일(Orphan)임을 확인 — 삭제 대상.

### 🧩 V11.21 향후 정리 과제

- [ ] **레거시 파일 삭제**: `HeroOffSlogan.tsx`, `HeroSlogan.tsx` 제거 검토
- [ ] **ShapesStage 내부 방어 코드 제거**: JIT 마운트에 의해 오프모드 가드(`if (!isOn) return` 등)가 불필요해짐

## 🚀 2026-03-29 (2): ON 모드 슬로건 무결성 복구 및 히어로 레이어 위계(z-index) 정밀 튜닝

모드 전환 시 발생하던 슬로건 유실 문제를 근본적으로 해결하고, 다크모드의 시각적 깊이감을 완성했습니다.

### 💎 주요 달성 성과 (V11.3 - Visual Integrity Fix)

- **ON-Mode Phrase Restoration**: `!isOn` 가드 조건에 의해 유실되었던 '트루 포커스' 슬로건("불안을 끄고, 기준을 켭니다")을 독립 레이어로 분리하여 완벽히 복구.
- **Toggle Stack Refinement**: 토글 스위치가 배경 슬로건의 앞(z-20)으로 오도록 레이어 순서 조정 및 OFF 모드 전용 렌더링 가드 재설정.
- **Architectural Stabilization**: 각 모드별 슬로건이 서로의 코드를 간섭하거나 삭제하지 않도록 `HeroPCView.tsx`의 렌더링 구조를 모드별 독립 상주 방식으로 최적화.
- **Visual Depth (z-index)**: 토글 스위치(z-20)와 거대 영문 슬로건(z-10) 간의 전후 관계를 명확히 하여 한층 깊어진 입체감 구현.

## [최신] 🚀 2026-03-29: 이중축 제동(Dual-Axis Braking) 시스템 기반의 지능형 반응형 구조 확립

단순한 너비(vw) 대응을 넘어, 기기 종횡비(Aspect Ratio)를 스스로 인지하고 대응하는 **'납작한 화면(Short/Flat Viewport)' 대응 기술**을 완성했습니다. 이를 통해 어떤 PC 해상도에서도 컨텐츠의 무결성을 보장합니다.

### 💎 주요 달성 성과 (V11.2 - Responsive Revolution)

- **Dual-Axis Braking Engine**: 모든 핵심 요소(로고, 슬로건, 토글)에 `min(vw, vh)` 수식을 적용하여, 브라우저 창이 상하로 납작해질 때 컨텐츠가 함께 수축되는 이중 제동 기법 도입.
- **Flat-Viewport Integrity**: 윈도우 창을 극단적으로 낮게 조절하더라도 'Vertical Spine' 스택이 서로 겹치거나 잘리지 않고, 뷰포트 내 세이프 존(Safe Zone)에 정갈하게 안착됨을 보장.
- **Advanced Stretch Integration**: 사용자님이 정교하게 맞춘 `scaleX(0.6)`, `scaleY(2)` 등의 확장 타이포그래피가 `vh` 단위의 압축 상황에서도 시각적 균형을 잃지 않도록 동기화.
- **Structural Separation Strategy**: PC와 Mobile의 서사를 기술적으로 분리하면서도, 공통의 '지능형 스케일링 엔진'을 공유하여 유지보수성과 예술성을 동시에 확보.

## [최신] 🚀 2026-03-29: PC 히어로 섹션 '스위치 피벗(Switch Pivot)' 레이아웃 및 시네마틱 타이포그래피 정립

PC 환경의 히어로 섹션을 브랜드의 권위와 예술성이 공존하는 **'버티컬 스파인(Vertical Spine)'** 구조로 재편하고, 파격적인 타이포그래피 스케일링을 통해 독보적인 시네마틱 무드를 완성했습니다.

### 💎 주요 달성 성과 (V11.2)

- **Vertical Spine Architecture**: 중앙 로고 → 토글 스위치 → 이중 슬로건으로 이어지는 수직축을 확립하여 시각적 안정감과 권위 부여.
- **Switch Pivot Typography**: 'Turn on the Switch,'와 'Switch on the Brand.'를 지그재그로 배치하고 `EB Garamond Regular` 서체를 적용하여 지적이고 정갈한 에디토리얼 감성 구현.
- **Extreme Scaling & Depth**: `scaleX(0.6)`, `scaleY(2)`의 파격적인 장평 조절과 음수 마진(-5vh), 낮은 투명도(0.32~0.5)를 결합하여 슬로건을 거대한 '시각적 지층(Backdrop)'으로 격상.
- **Responsive Integrity**: PC 환경의 고도화된 연출을 구현하면서도, 모바일의 기존 '브랜드를 켜다' 레이아웃을 무결하게 보존하는 분기 로직(isMobile) 강화.

### [/] 3. 브랜드 스토리 및 진단 섹션 데이터 주입 (진행 중)

- **Visual Rhythm**: 전이 구간의 이징(Easing) 및 리듬감 튜닝 지속.
- **Data Sync**: Home Completion (브랜드 스토리, 브랜드 진단 섹션 데이터 추가 중).

> [!TIP]
> 먼 미래의 연출 고도화 아이디어나 보류된 계획들은 [V11-Backlog-Ideas.md](file:///d:/네모ON/네모ON Studio/네모ON/docs/strategy/V11-Backlog-Ideas.md)에서 안전하게 관리되고 있습니다.

---

> **작업 시작 프롬프트 (V11.40)**:
> "V11 프로토콜과 GSAP 단일 엔진 원칙을 사수하라. 특히 오류 수정 시 **'추측 금지, 증거(Log) 우선'** 원칙을 절대 준수하여 데이터 기반으로 디버깅하라. `.agent/rules`와 홈 스크롤 가드 로직을 존중하라."
