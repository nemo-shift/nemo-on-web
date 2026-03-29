# [V11.21] 히어로 컴포넌트 JIT(Just-in-Time) 격리 및 최적화 계획

사용자님의 정밀한 기술적 피드백을 반영하여, 컴포넌트의 단순 '미노출'을 넘어선 **'생명주기(Lifecycle) 완전 제어'**를 통해 터치 간섭을 0%로 만들고 전환 무결성을 확보합니다.

## 🚦 핵심 변경 사항 (User Review Required)

> [!IMPORTANT]
> **JIT(Just-in-Time) 마운트 전략 적용**: 
> `#hero-nemo-origin`이 포함된 `HeroPhraseLayer`는 오프모드 정지 상태에서 **[DOM에서 완전히 제거(Unmounted)]** 상태를 유지합니다. 
> 오직 사용자가 토글을 누르는 순간(`isTransitioning: true`)에만 찰나의 차이로 생겨나, 전환 엔진(`builders/hero.ts`)이 위치 기준점을 계산할 수 있도록 지원합니다.

## 🛠️ 주요 수정 내역

### 1. [생명주기 제어] PhraseLayer JIT 렌더링
- **[REFACTOR] `HeroPCView` / `HeroTabletView` / `HeroMobileView`**:
    - `HeroPhraseLayer` 렌더링 조건을 `isOn || isTransitioning`으로 변경.
    - 이를 통해 오프모드 스위치 조작 중에는 물리적 박스 충돌이 원천 불가능하도록 격리합니다.

### 2. [컴포넌트 물리적 격리] Slogan 구조 재편
- **[NEW] `HeroSloganOff.tsx` / `HeroSloganOn.tsx`**: `HeroSlogan.tsx` 내부의 하이브리드 로직을 제거하고, 각 모드에 최적화된 독립 컴포넌트로 분리합니다.
- **[CLEANUP]**: 온모드(ON) 진입이 완료되는 즉시 오프모드 전용 슬로건과 스위치(`HeroToggle`)를 DOM에서 언마운트합니다.

### 3. [자원 극한 최적화] 온모드 클린업
- **[MODIFY] HeroSection.tsx**: 
    - 온모드 전환 완료 시 `canvas` 파티클 레이어를 아예 제거하여 GPU 점유율을 0으로 만듭니다.
    - 시네마틱 와이프(Wipe) 뒤에서 벌어지는 컴포넌트 교체 타이밍을 `sequenceStep` 기반으로 정밀 동기화합니다.

---

## ❓ 열린 질문 (Open Questions)

- **렌더링 딜레이**: React의 배치 업데이트(Batching) 특성상 `isTransitioning` 변경과 DOM 반영 사이에 미세한 갭이 있을 수 있으나, GSAP의 `requestAnimationFrame` 단위를 활용하여 위치 계산 시점에 앵커가 확실히 존재하도록 보정할 예정입니다.

## ✅ 검증 계획

### 자동화 테스트
- 오프모드에서 DOM 검사 시 `HeroPhraseLayer`가 실제로 존재하지 않는지 확인.
- 전환 시점에 `getElementById('hero-nemo-origin')`가 유효한 값을 반환하는지 로그 확인.

### 수동 검증
- 모바일/태블릿 터치 시 텍스트 박스에 의한 클릭 가로채기가 완전히 사라졌는지 확인.
- 전환 연출이 끊김 없이 매끄럽게(Smooth) 시작되는지 확인.
