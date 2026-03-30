<!-- [DOCUMENTATION POLICY] 본 문서는 스택(Stack) 방식으로 관리됩니다. 최신 성과는 항상 상단에 배치하며, 과거 히스토리는 지우지 않고 하단으로 밀어내어 프로젝트의 발전 과정을 보존합니다.

현재 상태 요약 문서-->

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

- **Physics Stability**: `setStatic` 토글 대신 동적 바디를 핀으로 고정하는 방식을 도입하여 물리적 오동작을 100% 차단.
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
