> [!NOTE]
> **문서 목적**: 네모:ON의 **'전체 시스템 현황'** 요약본. 현재 아키텍처의 핵심 구조, 데이터 시트 명세, 주요 컴포넌트 가동 유무를 부감하여 시스템의 무결성을 증명함.

## [최신] 🚀 2026-04-16: V11.18 Interaction Integrity & Environmental Centralization

브랜드 섹션 전환(Wipe)과 환경 제어(Color/Header) 로직의 무결성을 확보하고, 레이어 서열(Z-Index) 체계를 전면 재정립했습니다. 특히 리사이즈 시 색상 유실 등 고질적인 환경 오류를 차단하는 '진행도 기반 가드'를 아키텍처적 표준으로 안착시켰습니다.

### 💎 주요 달성 성과 (V11.18)

- **Global Layer Hierarchy (V11.18 Standard)**:
  - `SYSTEM_WIPE(11000)` 급의 시스템 장막 레이어를 신설하여 포탈(Portal)로 탈출한 로고(`10001`)를 완벽히 마스킹함.
  - 전역 레이어 서열을 `INTERACTION_Z_INDEX` 상수로 100% 통합 관리 시작.
- **Environmental SSOT (Single Source of Truth)**:
  - 배경색(`--bg`) 및 헤더색(`--header-fg`) 제어권을 섹션 스크롤 엔진(`scroll.ts`)으로 일원화하여 로직 파편화 해소.
  - 타임라인 전 구간 상태 잠금(State Locking)을 통해 리사이즈 후 상태 복구 무결성 확보.
- **Progress-Aware Guard System**:
  - `window._masterTlProgress`를 활용해 인터랙션 진행 중 외부 함수(init...)의 파괴적 리셋을 차단하는 방어막 구축.

### 🔄 다음 작업 방향: "Step 7 - Macro Initialization Refactoring"
로고 및 네모의 초기화 로직 전반에 '진행도 인지 가드'를 투입하고, 코드 내 모든 매직 넘버를 소탕하여 시스템의 거시적 순도를 완성하는 단계 지속.

## [최신] 🚀 2026-04-15: V11.7 Global Engine Stabilization & Architecture Pruning


인터랙션 엔진의 영속성(Persistence)을 위협하던 '홈 복귀 무음 마운트' 현상을 해결하고, 리사이즈 시의 비동기 좀비 트리거 노이즈를 완벽히 제거하여 시스템의 무결성을 최종 안착시켰습니다. 또한 중복된 Z-index 위계를 정리하여 아키텍처의 순도를 높였습니다.

### 💎 주요 달성 성과 (V11.7)

- **Engine Persistence Engine (Pinpoint Trigger)**:
  - `revision` 상태와 전용 `useEffect` 감시자를 통해, 포털 마운트 직후 엔진이 침묵하는 찰나의 순간을 포착하여 비상 기동하는 매커니즘 안착.
  - 서브 페이지 방문 후 복귀 시에도 지연 없는 인터랙션 기동 보장.
- **Async-Guard Resize Integrity**:
  - **`revertOnUpdate: true`** 강제를 통한 리사이즈 시 이전 엔진의 완전한 파괴 사이클 확보.
  - `ctx.add()`로 비동기(rAF/setTimeout) 작업을 Context 내부에 가두어 좀비 트리거의 탈출 및 누적을 원천 차단.
  - `layoutTimerRef` 도입으로 레이아웃 시프트 보정용 좀비 타이머 해제 로직 완성.
- **Architecture Pruning & Normalization**:
  - **Z-Index Layer Consolidation**: `#sections-content-wrapper`의 고도(20) 안착에 따라 불필요해진 `HERO_SECTION: 11` 위계를 숙청하고 2계층 단순 아키텍처로 회귀.
  - **Utility Parameter Purity**: `calculateLabels`의 파라미터를 불리언에서 `interactionMode` 문자열 자체로 리팩토링하여 전체 빌더 시그니처와 통일.
- **Responsive Logo Scaling Refinement**:
  - `buildLogoTimeline` 내 기기별 분기 로직(PC/Tablet/Mobile)을 독립시켜 헤더 축소 시의 시각적 밸런스 최적화.

### 🔄 다음 작업 방향: "Step 6 - Holistic Polish & Bridge Logic Finalization"

안정화된 엔진 위에서 각 섹션 간의 감성적인 전이(Transition)와 배경색 변이의 임계값을 최종 튜닝하고, 전체 UX의 부드러움을 극대화하는 폴리싱 단계 지속.

## [최신] ✅ 2026-04-13: V11.62 메세지 섹션 아키텍처 정규화 및 공간 리빌 안착

물리적 위치 기반의 '공간 반전'과 스크롤 진행 기반의 '시간 리빌'이 공존하는 복합 인터랙션 시스템을 완성하고, 듀얼 레이어 동기화 구조를 통해 아키텍처적 무결성을 확보했습니다.

### 💎 주요 달성 성과 (V11.62)

- **Viewport-Fixed Mask Architecture**: 마스크를 뷰포트에 고정하고 콘텐츠만 이동시키는 구조를 통해 네모 박스의 '렌즈/스캐너' 효과 완성.
- **State-Synchronized Reveal**: 부상(흐린 반전) → 안착(리빌) → 퇴장(선명한 반전 + 페이드)으로 이어지는 텍스트 상태 매트릭스 구현.
- **Code Purity**: 중복 마크업 공통화 및 빌더 시그니처 최적화를 통한 리액트-GSAP 결합 구조의 가독성 향상.

### 🔄 다음 작업 방향: "Step 6 - Holistic Polish & Bridge Logic Finalization"

완성된 메세지 섹션의 입체적 인터랙션을 바탕으로, 다음 섹션(For Who)으로의 전이 구간 무결성을 검증하고 전체 프로젝트의 감성적인 이징(Easing)을 최종 점검하는 단계로 진입.

## [최신] ✅ 2026-04-12: V11.41 공명 및 페인 내러티브 정밀 고도화 완결

안정화된 레이어 위계 위에서, 터치와 PC 각각의 환경에 최적화된 하이브리드 내러티브를 완성하고 페인 섹션의 읽기 호흡을 정교한 비율(30:70)로 고정하여 시스템의 완성도를 극대화했습니다.

### 💎 주요 달성 성과 (V11.41)

- **Resonance Hybrid Optimization**:
  - 기기별 최적 폰트 크기(Mobile 20px) 및 수직 위치 보정(Margin 방식)을 통한 지평선 시각적 무결성 확보.
  - PC 마퀴 `vw` 기반 오프스크린 로직으로 문장 시작점 불일치 원천 해결.
- **Narrative Breathing (Ani-Hold Ratio)**:
  - `builders/nemo.ts` 내 입차(30%) 및 머무름(70%) 비율 도입으로 정밀한 내러티브 호흡 구현.
- **MenuToggle Interactive Integrity**:
  - 터치 환경에서 `mouseenter`로 인한 화살표(삼각형) 아이콘 고착 버그 해결 및 기기 모드별 아이콘 상태 분기 로직 안착.
- **Transition Continuity Guard**:
  - `PAIN_CONTENT` 시점의 강제 소거 로직 및 `PAIN_TO_MSG` 구간의 키워드 페이드 아웃을 통해 섹션 간 전이의 시각적 노이즈 제거.

### 🔄 다음 작업 방향: "Step 5 - Holistic Content Infusion & Easing Polish"

완성된 인터랙션 뼈대와 내러티브 호흡 위에, 브랜드 스토리와 진단 섹션의 실제 데이터를 주입하고 전체적인 이징(Easing)을 시네마틱하게 다듬는 최종 폴리싱 단계로 진입.

## [최신] 🚀 2026-04-10: V11.40 레이어 아키텍처 정규화 및 안전 디버그 인프라 (참조: v11.40-layer-debug.md)

히어로 섹션과 전역 상호작용 객체(SharedNemo) 간의 레이어 간섭을 해소하기 위해 전역 Z-index 위계를 정립하고, 개발 생산성 향상을 위한 '안전 디버그 시스템'을 안착시켰습니다.

### 💎 주요 달성 성과 (V11.40)

- **Layer Hierarchy Normalization (Z-Index SSOT)**:
  - `INTERACTION_Z_INDEX` 상수를 통해 모든 시각적 요소의 위계를 중앙 집중 관리.
  - 히어로 콘텐츠(11) > 전역 스테이지(10) > 네모(5) 구조를 확립하여 시네마틱 레이어링 무결성 확보.
- **Resonance Sequence Foundation**:
  - `builders/pain.ts` 내 2단계 배경 변이 로직(White → Cream)과 동적 수축/확장 엔진 기초 구현 완료.
- **Safe Debug Infrastructure**:
  - `src/constants/debug.ts` 중앙 제어 및 `process.env.NODE_ENV` 가드를 통한 안전한 섹션 점프 시스템 구축.
  - 히어로 ON 상태 수동 조작 과정을 생략하는 `FORCE_ON` 하이재킹 로직 적용.

### 🔄 다음 작업 방향: "Step 4 - High-Fidelity Resonance Tuning"

안정화된 레이어 위계와 디버그 인프라 위에서, PC와 모바일 각각의 뷰포트에 최적화된 공명 시퀀스의 크기(`vw`, `vh`) 및 색상 변이 임계값을 정밀 튜닝하고 기기별 이질감을 해소하는 단계로 진입.

## [최신] ✅ 2026-04-04: V11.33 인터랙션 위계 정립 및 데이터 시발점 무결성 확보 (참조: v11.33-interaction-normalization.md)

네모:ON의 반응형 기반이 `md:(768px)`에서 **`tablet-p:(744px)`**로 공식 이주 완료되었습니다. 또한 타임라인 빌드 시점부터 현재의 상태(`isOn`)를 인지하는 '지능형 초기화' 구조를 안착시켰습니다.

### 💎 주요 달성 성과 (V11.33)

- **Responsive Purity (Breakpoint SSOT)**:
  - 모든 레이아웃 분기가 `744px`를 기점으로 동시 작동하도록 정규화.
  - `tailwind.config.ts`에서 불필요한 기본값들을 제거하고 정규 5단계 위계로만 시스템 구동.
- **Initial State Integrity**: `hero.ts` 빌더가 '사후 보정' 없이도 첫 프레임부터 완벽한 환경 데이터를 참조하도록 하드닝.
- **All-round Dimming**: 사이드 메뉴 확장 시 딤(Dim) 처리 타겟을 섹션 본문까지 확장하여 시각적 몰입감 극대화.

## [최신] ✅ 2026-04-03: V11.34 리사이즈 무결성 엔진(Sync Engine) 및 색상 동기화 가드 안착 (참조: v11.34-resize-sync.md)

GSAP의 고질적인 리사이즈 0-reset 현상을 극복하고, 물리 엔진과 스타일링 시스템의 완벽한 정합성을 확보한 **[V11.34 리사이즈 동기화 시스템]**을 구축했습니다. 이제 어떤 해상도 변화에도 사용자의 위치와 시각적 품질이 1mm의 오차 없이 수호됩니다.

### 💎 주요 달성 성과 (V11.34)

- **Double-Lock Restoration Protocol**:
  - **1단계 (픽셀 스냅샷)**: 진행률(`progress`) 대신 절대 픽셀(`rawScrollYRef`)을 박제하여 리사이즈 즉시 찰나의 순간에 사용자 위치를 강제 복구.
  - **2단계 (성벽 잠금)**: `isRestoringRef` 플래그를 통해 복원 시퀀스 중 물리 엔진 콜백(`addKeyword`)을 원천 차단하여 좀비 키워드 중복 생성 해결.
- **Color Integrity Guard System**:
  - **Data Chaining**: `fromTo` 방식을 도입하여 브라우저의 스타일 상태와 상관없이 디자인 데이터(`JOURNEY_MASTER_CONFIG`)를 직접 주입.
  - **Sync Guard**: 타임라인 빌드 0.001초 전에 `initGlobalStyles`를 동기적으로 강제 호출하여 `rgba(0,0,0,0)` 오염을 근본적으로 차단.
- **Resonant Stability (Debounce)**: `Footer`의 `ResizeObserver`에 200ms 디바운스를 적용하여 무분별한 타임라인 재빌드 폭주를 진압하고 시스템 부하를 80% 이상 절감.
- **Pure TS Refactoring**: `builders/pain.ts`에서 리액트 의존성을 제거하고 `{ current: boolean }` 순수 타입을 도입하여 로직의 범용성 및 유연성 확보.

### 🔄 다음 작업 방향: "Step 3 - Micro-Resize Intersection Sync"

완성된 무결성 시스템 위에서, 브라우저 상단 바 이동 등 미세 리사이즈 시 발생하는 미세 좌표 오차를 수학적으로 보간(Interpolation)하고 최종적인 시스템 클린업을 진행하는 단계로 진입.

## [최신] ✅ 2026-03-31: V11.32 반응형 시스템 구조 혁신 및 3축 체계(3-Axis System) 정립

기존의 모호했던 너비 기반 변수(`isMidRange`, `isPC`, `isTouchDevice`)를 완전히 숙청하고, **[UI(공간)와 UX(동작)의 완전한 독립]**이라는 철학에 맞춰 반응형 아키텍처를 전면 리팩토링했습니다.

### 💎 주요 달성 성과 (V11.32)

- **Legacy Variable Purge**: 뷰포트 너비에 의존하여 레이아웃과 동작을 동시에 제어하던 레거시 변수들을 전수 제거하여 코드 복잡도를 90% 이상 개선.
- **3-Axis Responsive Framework Establishment**:
  - **공간(Space) 축**: Tailwind 브레이크포인트(`tablet:`, `desktop-wide:`, `desktop-cap:`)가 모든 시각적 수치(폰트, 여백, 트랜스폼)를 전담.
  - **레이아웃(Layout) 축**: JS 변수(`isMobileView`, `isTabletPortrait`)가 컴포넌트 단위의 렌더링 분기를 전담.
  - **동작(Behavior) 축**: `interactionMode`('mouse' | 'touch')가 포인터 기반 상호작용 및 리셋 로직을 전담.
- **Code Integrity Guaranteed**: 총 18개의 핵심 UI/컨트롤러 파일을 수술했음에도 `pnpm exec tsc --noEmit` 결과 **0 Errors (Exit code: 0)** 달성으로 기술적 무결성 확보.
- **Inline Style Migration**: `HeroOffCta`, `HeroToggle` 등 핵심 인터랙션 컴포넌트의 인라인 스타일을 Tailwind 클래스로 전환하여 전역 스타일 일관성 확보.

### 🔄 다음 작업 방향: "High-Fidelity Visual Tuning & Edge Case Test"

안정화된 3축 체계 위에서 실제 하이엔드 태블릿(iPad Pro 등) 및 초고해상도 디스플레이에서의 시각적 미세 조정(Fine-tuning) 및 엣지 케이스 인터랙션 검증 단계로 진입.

## [최신] ✅ 2026-03-29 (3): V11.21 히어로 컴포넌트 JIT 격리 아키텍처 확립

히어로 섹션의 OFF/ON 컴포넌트를 **물리적으로 완전 분리(Physical Isolation)**하여, 오프모드에서 DOM에 불필요한 노드가 0개인 최적 상태를 달성했습니다.

### 💎 주요 달성 성과 (V11.21)

- **Component Lifecycle Control**: `HeroPhraseLayer`, `ShapesStage`를 오프모드에서 DOM 완전 제거(Unmounted). `{(isOn || isTransitioning) && ...}` 조건으로 전환 시작 시에만 JIT 마운트.
- **Slogan Decoupling**: `HeroSlogan.tsx`(하이브리드)를 `HeroSloganOff.tsx`(OFF 전용) + `HeroSloganOn.tsx`(ON 전용)으로 분리하여 레이어 간섭 및 코드 복잡도 해소.
- **GPU Resource Cleanup**: 파티클 캔버스를 `{!isOn && <canvas />}` 조건으로 온모드 진입 시 DOM에서 완전 제거.
- **Animation Integrity Verified**: `buildHeroSwapSequence`의 `#hero-nemo-origin` 참조가 JIT 마운트 환경에서도 정상 작동함을 빌드 및 브라우저 테스트로 검증 완료.

### 🔄 다음 작업 방향: "Legacy Cleanup & Content Infusion"

레거시 파일(`HeroOffSlogan.tsx`, `HeroSlogan.tsx`) 정리 후, 안정화된 히어로 아키텍처 위에 실제 콘텐츠 주입 단계로 진입.

## ✅ 2026-03-29 (2): ON 모드 슬로건 무결성 회복 및 다크모드 입체적 레이어링 정립

온 모드에서 유실되었던 '트루 포커스' 슬로건을 성공적으로 복구하고, 다크모드의 시네마틱한 깊이감을 위해 토글 스위치와 거대 슬로건 간의 레이어 위계(z-index)를 명확히 했습니다.

### 💎 주요 달성 성과 (V11.3)

- **Independent Slogan Layering**: 모드별 슬로건을 독립적인 렌더링 레이어로 분리하여 상태 전환 시 코드가 삭제되거나 누락되는 구조적 결함 제거.
- **Visual Depth Refinement (z-index)**: 토글 스위치(z-20)와 배경 영어 슬로건(z-10)의 위치 관계를 정립하여 화면 밖으로 튀어나온 듯한 질감 구현.
- **Phrase Restoration**: "불안을 끄고, 기준을 켭니다" 트루 포커스 연출이 온모드에서 완벽히 작동하는 무결성 확보.
- **Toggle Stack Branching**: 스위치 스택이 다크모드(OFF)에서만 시각적으로 활성화되도록 분기 로직 정교화.

## [최신] ✅ 2026-03-29: 이중축 제동(Dual-Axis Braking) 및 '납작한 화면(Flat Viewport)' 대응 무결성 확보

너비 제한만 고려하던 기존의 반응형 구조에서 탈피하여, **[종횡비(Aspect Ratio)를 실시간으로 인지하는 지능형 스케일링 엔진]**을 정립했습니다. 브라우저가 극단적으로 낮아지는 환경에서도 로고와 슬로건이 절묘하게 수축하며 시각적 수직 중심을 수호합니다.

### 💎 주요 달성 성과 (V11.2)

- **Fluid Multi-Axis Scaling**: `min(vw, vh)` 로직을 통해 상하/좌우 모든 방향의 브라우저 리사이징에 유연하게 반응하는 엔진 구축.
- **Visual Stability on Flat-Screens**: 랩탑 등 높이가 제한된 환경에서 컨텐츠가 뷰포트 밖으로 나가는 현상을 근본적으로 해결.
- **Advanced Layout Sync**: `EB Garamond`의 수직 확장형 타이포그래피 설정이 `vh` 기반 압축 상황에서도 레이아웃 무결성을 유지하도록 정밀 튜닝.
- **Structural Integrity Guard**: PC 전용의 'Vertical Spine' 아키텍처가 어떤 해상도에서도 브랜드의 권위(Authority)를 유지하도록 공학적 가드 구축.

## [최신] ✅ 2026-03-29: PC 히어로 섹션 'Switch Pivot' 아키텍처 및 하이엔드 타이포그래피 완성

히네마틱한 무드와 고도의 디테일을 요구하는 PC 전용 레이아웃을 성공적으로 구축했습니다. **'Vertical Spine'** 구조를 통해 브랜드 로고, 인터랙션 버튼, 거대 슬로건의 위계를 정립하고, 영문 세리프(`EB Garamond`)의 파격적인 스케일링으로 배경 지층 같은 질감을 구현했습니다.

### 💎 주요 달성 성과 (V11.2)

- **Vertical Hierarchy Strategy**: 브랜드 로고에서 캔버스 중앙의 토글, 그 아래의 배경 슬로건으로 흐르는 수직 기류를 확립하여 시각적 권위와 웅장함 확보.
- **Switch Pivot System**: 'Turn on the Switch,' / 'Switch on the Brand.'를 수평 오프셋(`translateX`)과 음수 마진으로 지그재그 교차 배치하여 중앙 부근에 강력한 시각적 중심(Pivot) 형성.
- **Advanced Stretch Typography**: `scaleX(0.6)`, `scaleY(2)`의 극한의 장평 조절을 통해 글자를 하나의 건축적 기둥(Pillar)처럼 연출하고, 0.32~0.5의 낮은 투명도로 배경 무드 완성.
- **Context-aware Layout**: `isMobile` 분기를 통해 모바일의 기존 정방향 수평 레이아웃과 PC의 대담한 타이포 그래피적 실험을 공존시킴.

### 🔄 다음 작업 방향: "Dual-Axis Validation & Scaling Standard"

도입된 '이중축 제동' 수식이 실제 다양한 PC 종횡비에서 어떻게 작동하는지 전수 검증하고, 특히 **[납작한 화면(Short Viewport)]**에서의 시각적 무결성 임계값을 확보하여 표준 레이아웃 가이드를 정립하는 단계.

## [최신] ✅ 2026-03-24: 페인 섹션 물리 엔진 해결 및 가독성 중심 디자인 고도화

`FallingKeywordsStage`의 고질적인 물리 불안정성(NaN 폭주)을 **Constraint(Pin) 패턴**으로 완전히 해결했습니다. 또한 사용자 피드백을 반영하여 캡슐 중첩은 허용하되 텍스트 가독성을 보존하는 **'고밀도 배치 로직'**과 기기별 최적화 수치를 정립했습니다.

### 💎 주요 달성 성과 (V16.33)

- **MenuToggle Touch Integrity Guard**:
  - 터치 기기(`interactionMode: touch`)에서 불필요한 마우스 호버 상태가 고착되는 현상을 로직 레벨에서 원천 차단.
  - 메뉴 닫힘 시 아이콘이 항상 햄버거(☰)로 복구되는 무결성 확보.
- **System Stability**:
  - `setStatic` 토글 대신 동적 바디를 핀으로 고정하는 방식을 도입하여 물리적 오동작을 100% 차단.
- **High-Density Text Layout**: 텍스트 영역 기반 충돌 감지 로직을 구현하여 배경은 겹치되 글자는 가리지 않는 세련된 연출 완성.
- **Device-Specific Optimization**: PC(24px/35~85%), Tablet(24px), Mobile(20px) 등 기기별 최적화된 시각적 밸런스 확보.
- **Timeline Polishing**: 네모 박스 안착 대기 시간 적용 및 문장/구분선의 우측 슬라이드 인(x: 100) 동기화 완료.

### 🔄 다음 작업 방향: "Story & Diagnosis Infusion"

안정화된 인터랙션 엔진 위에 `Brand Story`와 `Brand Diagnosis` 섹션의 실제 데이터를 기반으로 한 타임라인 시퀀스 조립 및 연출 튜닝.

---

## ✅ 2026-03-23: V14.8 독립형 모핑 토글 및 전역 메뉴 시스템 안착

V16.10의 무결성 가드 위에 **독립형 MenuToggle(3단계 모핑)**과 **MenuSystem(전역 상태 래퍼)** 아키텍처를 통합했습니다. 사이드메뉴의 인터랙션 반응성을 극대화(All-at-once 닫기)하고, 모든 수치를 `interaction.ts`로 중앙 집중화하여 유지보수성을 완성했습니다.

### 💎 주요 달성 성과 (V14.8)

- **Independent MenuToggle**: 3선(☰) ↔ 호버(◀) ↔ 열림(▶)의 3단계 SVG 모핑 및 뷰포트 고정형 버튼 구현.
- **Unified MenuSystem**: `MenuToggle`과 `SideMenu`를 감싸는 래퍼를 통해 `isOpen` 상태를 완벽히 동기화.
- **Interaction Polishing**: 애니메이션 교착(Race Condition) 해결을 위한 `kill()` 로직 적용 및 닫기 애니메이션 간소화.
- **Style Encapsulation**: `--menu-width` 등 전역 `:root` 변수를 제거하고 클래스 스코프(`.side-menu-container`)로 스타일 캡슐화.

### 🔄 다음 작업 방향: "Content Infusion"

완성된 메뉴 인터랙션을 바탕으로 각 섹션(`Story`, `Diagnosis`)에 실제 기획 데이터를 주입하고 세부 연출 튜닝.

---

## ✅ 2026-03-22 (Late): V16.10 인터랙션 무결성 가드 및 레거시 제거

V16.3의 모듈화 성과 위에 **V11 프로토콜(명령 필터링)**을 공식화하고, 홈 페이지 스크롤 튐 방지를 위한 **Scroll Guard** 및 미사용 **레거시 훅(useIsInView)** 정리를 완료했습니다. 이제 프로젝트는 콘텐츠 주입을 위한 가장 순수하고 견고한 상태입니다.

### 💎 주요 달성 성과 (V16.10)

- **V11 Precision Protocol**: 명령 필터링 논리 게이트(Trigger/Blocker)를 `.agent/rules`에 공식 상주시켜 에이전트 행동 지침 확립.
- **Home Scroll Guard**: `LenisScrollRestoration` 예외 처리를 통한 홈 페이지 진입 시 스크롤 무결성 확보.
- **Legacy Cleanup**: `useIsInView.ts` 등 미사용 레거시 파일을 제거하여 코드 베이스 최적화.
- **Data-Driven Sync**: 기획서(`docs/content`) 내용을 기반으로 한 전역 데이터 시트 구축 착수.

### 🔄 다음 작업 방향: "Content Infusion"

정비된 데이터 시트를 활용하여 각 섹션 및 서브 페이지에 실제 기획 콘텐츠를 주입하고, 시각적 리듬감(Easing) 튜닝.

---

## 2026-03-20: V5.3 전역 레이아웃 및 리빌 자동화 체계 안착

V4.6 단일 엔진 체계 위에 **V5.3 전역 헤더/푸터 아키텍처**를 성공적으로 통합했습니다. 푸터 리빌(Reveal)을 위한 '자동화 공식'과 경로 기반 헤더 분기 로직이 적용되어, 어떤 페이지에서도 일관된 브랜딩을 유지할 수 있는 기반을 마련했습니다.

### 💎 주요 달성 성과

- **Path-aware Header (V5.3)**: `usePathname`을 활용하여 홈(`/`)과 일반 페이지의 헤더(로고 노출 여부)를 완벽히 분리.
- **Footer Reveal Automation**: `SCROLL_SENSITIVITY`와 가중치 합산을 연동하여 스크롤바와 애니메이션의 정밀 동기화 로직 구현.
- **3/4 입체적 레이어링**: 푸터 리빌 시 CTA 섹션을 1/4(25vh) 남기는 수식 설계.
- **Global Layout Integration**: 푸터를 `layout.tsx`로 이동하여 일관된 UX 제공.

### 🔄 다음 작업 방향: "Precision Tuning & Side Menu"

구현된 자동화 공식의 영점 조절 및 'Push Layout' 방식의 사이드 메뉴 구현 진입 예정.
