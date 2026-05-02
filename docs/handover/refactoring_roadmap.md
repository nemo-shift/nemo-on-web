> [!NOTE]
> **문서 목적**: 네모:ON의 **'기술적 진화 및 결정 기록'**. 과거의 수많은 리팩토링 여정과 아키텍처적 선언들을 추적하여, 왜 지금의 구조가 탄생했는지에 대한 '이유'를 보존함.

<!-- 실행 로드맵-->

# [IMPORTANT] Antigravity 전역 소통 및 실행 프로토콜 (v14.11)

본 문서는 프로젝트 수행 시 Antigravity가 반드시 준수해야 할 **'최상위 행동 지침'**입니다.

1.  **[지시 외 행동 금지]**: 지시받은 코드 수정 외의 그 어떤 명령어(git, npm, 파일 삭제 등)도 사용자님의 명확한 요청 없이는 절대 제안하거나 명령행에 포함하지 않는다. (v14.11 강화)
2.  **[질문 시 정지]**: "어떻게 생각해?", "어때?" 등의 의견 제시 요청은 '승인'이 아니다. 명시적인 "진행해" 명령이 있을 때만 구현에 착수한다.
3.  **[독단적 롤백 금지]**: 사용자님의 명시적 허락 없이는 단 1줄의 코드도 이전 상태로 되돌리지 않는다.
4.  **[블로커 존중]**: 사용자님이 특정 태스크에 대해 "지금 하지 말라"고 명시한 '블로커(Blocker)' 문구는 대화의 흐름과 상관없이 가장 강력한 금기 사항으로 유지한다.
5.  **[문서 스택 정책]**: `docs/handover` 내의 모든 문서는 덮어쓰기가 아닌 **'스택(Stack)'** 방식으로 관리한다. 최신 내용은 항상 상단에 추가하고 기존 히스토리는 지우지 않고 보존한다. (v16.34 추가)
6.  **[데이터 기반 디버깅]**: 모든 오류 수정 시 추측성 코딩을 배제하고, 반드시 `console.log` 혹은 디버깅 도구를 통해 데이터를 확인하는 **'증거 확보'** 단계를 선행한다.
7.  **[프로액티브 파트너십(V16.46)]**: AI는 단순히 지시를 따르는 '도구'에 머물지 않고, 전문가로서 하이엔드 퀄리티를 위한 **'제안의 의무'**를 갖는다. 기술적/기획적으로 더 나은 대안이 있다면 반드시 먼저 제안하고 논의한다.
8.  **[협업 프로토콜 V11 준수]**: 제안은 아낌없이 하되, 실제 구현(특히 뼈대나 핵심 로직 수정)은 반드시 사용자(Human)의 **'최종 승인 키워드'**가 확인된 후 가동한다. 독단적 판단에 의한 '자율 코딩'은 절대 지양한다.
9.  **[기록의 무결성 전파]**: 모든 주요 비즈니스/디자인 결정 및 고도화 아이디어는 반드시 `current-task.md` 혹은 본 문서에 기록하여, 다음 세션의 AI가 동일한 맥락에서 작업을 재개할 수 있도록 '지식의 연속성'을 확보한다.
10. **[디자인 토큰 중앙화]**: 모든 UI/애니메이션 상수는 `src/constants/interaction.ts`에서 관리하며, 코드 내 하드코딩을 금지한다. (v16.38 추가)
11. **[조건부 시각 보고]**: 주요 레이아웃의 첫 구현, 대규모 변경, 또는 사용자 요청 시에만 `browser` 도구를 통해 녹화/캡처 보고를 수행하여 효율을 높인다. (v16.39 추가)

---

### [x] [6A] V12.55 Cinematic Scroll Hint & Guide Layer Consolidation (2026-05-01 완료)

- **대상**: `GlobalScrollHint.tsx`, `ForWhoScrollHint.tsx`, `builders/scroll.ts`, `builders/forwho.ts`
- **내용**: 각 섹션에 산재된 힌트를 `GlobalScrollHint`로 통합 관리. 애니메이션 진행 상태와 연동된 '시네마틱 페이싱' 로직 도입.
- **성과**: 가이드 UI의 전역 관제 체계 확립 및 사용자 몰입도 방해 요소(시각적 노이즈) 제거. 기기별 3단계 반응형 수치 최적화 안착.

---

### [x] [5B] V11 Macro Final - 인터랙션 엔진 정규화 완결 (2026-04-17 완료)

- **대상**: `GlobalInteractionStage.tsx`, `global-interaction-utils.ts`, `interaction-registry.ts`, `builders/*.ts`
- **내용**: 레거시 전역 변수(`_masterTlProgress`) 숙청, **Registry SSOT** 기반의 의존성 주입(DI) 체계 도입, `#sections-content-wrapper`를 리액트 Ref 브릿지로 제어하는 **Pure-React Controller** 구현.
- **성과**: 엔진의 배관 공사와 관제탑 아키텍처가 100% 정규화되어 어떤 고밀도 콘텐츠도 즉시 도킹 가능한 무결성 확보. TSC 0 에러 달성.

### [x] [5A] V11.18 환경 제어 권한 통합 및 리사이즈 무결성 정복 (2026-04-16 완료)

- **대상**: `builders/hero.ts`, `builders/scroll.ts`, `global-interaction-utils.ts`
- **내용**: 파편화되어 있던 배경색(`--bg`) 및 헤더색(`--header-fg`) 제어권을 섹션 스크롤 엔진(`scroll.ts`)으로 일원화. `window._masterTlProgress`를 활용한 리사이즈 방어 가드 시스템 도입.
- **성과**: 리사이즈 시 배경색이 유실되거나 튀는 현상을 원천 차단하고, 인터랙션의 환경 SSOT(Single Source of Truth)를 확보함.

### [x] [4C] V11.40 Z-Index 정규화 및 안전 디버그 인프라 (2026-04-10 완료)


- **대상**: `src/constants/interaction.ts`, `GlobalInteractionStage.tsx`, `PainSection.tsx` 등 다수
- **내능**: 하드코딩된 `zIndex: 20` 등을 전수 소탕하여 `INTERACTION_Z_INDEX` 상수로 통합. 히어로 콘텐츠(11)와 전역 상호작용 레이어(10) 간의 위계 정립.
- **성과**: 레이어 간섭 문제 해결 및 시네마틱 레이어링의 기술적 무결성 확보.
- **디버그**: `debug.ts` 도입 및 `FORCE_ON` 하이재킹으로 개발 편의성 극대화 (Safe Guard 적용).

### [x] [4D] V11.20 거시적 인터랙션 무결성 및 인프라 정규화 (2026-04-17 완료)

- **대상**: `global-interaction-utils.ts`, `interaction.ts`, `GlobalInteractionStage.tsx`
- **내용**: 초기화 무결성 가드(`_masterTlProgress > 0.001`) 전방위 확대, `INTERACTION_Z_INDEX` V17 표준 레이아웃 정립.
- **성과**: 리사이즈 시 시각적 튐 현상 근절 및 상수를 통한 레이어 위계 중앙 통제 체계 구축.

### [x] [4E] V11.20 디버그 점프 엔진 복구 및 마킹 표준화 (2026-04-17 완료)

- **대상**: `InteractionDebugger.tsx`, 프로젝트 전역 태그 정규화
- **내용**: `isTimelineReady`와 동기화된 안전한 디버그 점프 엔진 구축. 기존 `[DEBUG-DELETE]` 태그를 `[DEPLOY-DELETE]` 규격으로 일괄 치환.
- **성과**: 개발 효율 극대화 및 배포 시 임시 코드 정화 가이드라인 확립.

---

### [x] [4B] V11.33 전역 반응형 규격화 및 인터랙션 정규화 (2026-04-04 완료) - v11.33-interaction-normalization.md

- **대상**: `src/app` 전역, `hero.ts`, `MenuToggle.tsx`, `SideMenu.tsx`
- **내용**: 레거시 `md:(768px)` 전수 소탕 및 `744px` 단일화, `MenuToggle` 4단계 상태 머신 고도화, 빌더 `lastEnv` 무결성 가드 이식.
- **성과**: 아키텍처 결집력(Cohesion) 강화 및 데이터 시발점 정합성 확보.

### [x] [4A] V11.34 리사이즈 무결성 엔진 및 색상 동기화 가드 (2026-04-03 완료) - v11.34-resize-sync.md

- **대상**: `GlobalInteractionStage.tsx`, `builders/hero.ts`, `builders/pain.ts`, `Footer.tsx`
- **내능**: 리사이즈 0-reset 대응 스냅샷 복원, 물리 엔진 이중 잠금(Double-Lock), 데이터 체이닝 기반 색상 무결성 확보.
- **성과**: 리사이즈 시 스크롤 튕김, 키워드 중복, 로고 투명화(`rgba(0,0,0,0)`) 현상 완전 진압.
- **아키텍처**: `invalidateOnRefresh`를 제거하고 '데이터 무결성' 중심으로 엔진 체질 개선.

### [x] [3B] V11.21 히어로 컴포넌트 JIT 격리 패턴 표준화 (2026-03-29 완료)

- **대상**: `HeroPCView.tsx`, `HeroTabletView.tsx`, `HeroMobileView.tsx`, `HeroSection.tsx`
- **내용**: 오프모드에서 불필요한 컴포넌트(`HeroPhraseLayer`, `ShapesStage`, `canvas`)를 DOM에서 완전 제거하는 JIT(Just-in-Time) 마운트 패턴을 표준화.
- **성과**: 터치 간섭 0%, GPU 부하 해소, 코드 복잡도 감소.
- **검증**: `pnpm build` 성공 + 브라우저 테스트로 네모 박스 모핑 애니메이션 무결성 확인.

### [ ] [3C] 레거시 파일 정리 (Legacy Cleanup)

- **대상**: `HeroOffSlogan.tsx`, `HeroSlogan.tsx`
- **내용**: V11.21 이후 프로젝트에서 더 이상 사용되지 않는 파일 삭제.
- **주의**: 삭제 전 `grep` 검색으로 사용처가 없음을 재확인.

### [ ] [3D] ShapesStage 내부 오프모드 방어 코드 제거

- **대상**: `ShapesStage.tsx`
- **내용**: JIT 마운트에 의해 오프모드에서는 컴포넌트 자체가 존재하지 않으므로, 내부의 `if (!isOn) return`, `visibility: isOn ? 'visible' : 'hidden'`, `display: isOn ? 'block' : 'none'` 등의 중복 방어 코드 제거 가능.
- **목적**: 코드 단순화 및 의도 명확화.

---

### [3A] 물리 엔진 안정성 표준화 (Physics Stability Pattern)

- **대상**: `src/components/sections/home/FallingKeywordsStage.tsx` 및 향후 물리 효과 컴포넌트
- **내용**: `setStatic(true/false)` 토글 방식 지양 및 **`Constraint (Pin)` 패턴** 공식화.
- **분석**: Matter.js의 `setStatic`은 내부 상태(`positionPrev`) 동기화 이슈로 인해 `NaN` 폭주 위험이 큼.
- **권장**: 모든 물리 바디는 `isStatic: false`로 생성하되, `Constraint`로 월드 좌표에 고정하고 필요 시 핀만 제거하는 방식을 표준화.

---

# [Roadmap] 프로젝트 품질 고도화 및 품질 연마 가이드

본 문서는 현재 구조적 안정성 확보 이후, 콘텐츠 작업 및 최종 품질 강화 단계에서 수행해야 할 기술적 개선 사항을 기록합니다.

## 1. 콘텐츠 작업 및 시스템 고도화 단계 (Phase: Optimization & Content)

### [x] [5B] 거시적 초기화 무결성 정비 (Progress-Aware Init) (2026-04-16 완료)

### [x] [3E] 3단계 초정밀 미세 리사이즈 보간 (Micro-sync) (2026-04-16 완료)


- **대상**: `GlobalInteractionStage.tsx`의 리사이즈 복원 시퀀스
- **내용**: `invalidateOnRefresh: true` 제거 이후 발생하는 브라우저 상단 바 이동 등 1~10px의 미세 오차를 수학적으로 보간.
- **핵심**: 리사이즈 완료 시점의 수동 갱신(`ScrollTrigger.refresh()`)과 부드러운 위치 재조정(`gsap.to(window, ...)`) 로직 구현.

### [x] [2B] V11 Macro Final - Pure TS 아키텍처 확산 및 정규화 (2026-04-17 완료)

- **대상**: `builders/*.ts`, `global-interaction-utils.ts`
- **내용**: `builders/pain.ts`에서 검증된 `{ current: boolean }` 및 레지스트리 기반 주입 방식을 로고, 네모, 메인 관제탑 등 전체 엔진으로 확산 적용.
- **성과**: 엔진 로직과 리액트 컴포넌트 간의 결합도를 낮추고 엔진의 순수성(Purity) 확보.

### [x] [2A] 애니메이션 타이밍 및 수치 상수화 (Magic Number Refactoring) (2026-04-16 완료)

- **대상**: `src/components/sections/home/builders.ts` 및 관련 애니메이션 빌더
- **내용**: 코드 내에 산재한 애니메이션 지속 시간(`0.2`, `0.4` 등), 트랜지션 가중치 등을 `src/constants/hero.ts` 등의 중앙 관리 파일로 추출.
- **목적**: 디자이너와의 협업 시 수치 조절 용이성 확보 및 비즈니스 로직 보호.

매직 넘버(Magic Numbers)의 중앙 집중화
분석: builders.ts 내부의 t _ r, 0.2, 0.4 _ r 같은 애니메이션 지속 시간 수치들이 코드 곳곳에 산재해 있습니다.
제안: constants/hero.ts 등에 STAGED_ANIMATION_TIMINGS 객체를 만들어 관리하면, 전체 애니메이션 '호흡'을 조절할 때 비즈니스 로직을 건드리지 않고 수치만 수정하여 반영할 수 있습니다.

## 2. 최종 품질 강화 단계 (Phase: Polishing & QA)

### [1A] 브라우저 스크롤 영점 확증 로직 (Zero-point Confirmation)

- **대상**: `src/components/sections/home/GlobalInteractionStage.tsx`
- **내용**: 인트로 종료 및 히어로 섹션 활성화(`isScrollable: true`) 직적에 브라우저의 실제 `scrollY`가 `0`임을 재검증하는 보조 로직 검토.
- **목적**: 기기 성능 차이에 따른 1프레임 튐 현상을 물리적으로 완전 차단.

Scroll Restoration & GSAP Race Condition (스크롤 복구 레이스 컨디션)
분석: 모바일에서 window.scrollTo(0, 0)을 강제하고 있지만, 브라우저의 전역 스크롤 엔진과 리액트의 useEffect 사이에는 미세한 실행 순서 차이가 존재합니다.
위험: masterTl이 생성되는 찰나에 브라우저가 이전 스크롤 위치를 아주 잠시라도 참조하면, 애니메이션 영점이 틀어져서 '로고가 위치를 못 잡고 튀는' 현상이 간헐적으로 발생할 수 있습니다.
대안: 고성능 환경을 위해 isScrollable이 true가 되기 전, 브라우저의 스크롤 위치가 실제 0임을 확인하는 '영점 확증(Zero-point Confirmation)' 단계가 추가되면 더욱 완벽해집니다.
