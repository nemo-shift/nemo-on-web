# GlobalInteractionStage 구조 이해 문서

> GlobalInteractionStage 관련 작업 전 nemoon-global-interaction-stage.md 반드시 읽을 것.
> 이 문서를 읽지 않고 리팩토링을 제안하지 마라.
> 이 구조는 이론적으로 예쁜 것보다 실제로 작동하는 것을 선택한 결과다.
> "더 깔끔하게 할 수 있지 않을까?"라는 생각이 든다면 이 문서를 먼저 읽어라.
---

## 1. 이 구조가 만들어진 배경

### 설계 의도

네모:ON 홈페이지는 히어로에서 CTA까지 **JourneyLogo와 SharedNemo가 끊김 없이 하나의 타임라인으로 연결**되어야 한다. 로고가 빅타이포에서 헤더 크기로 줄어들고, 네모 박스가 Pain 배경으로 확장되고, Message에서 틸 박스로 변형되는 모든 과정이 **단 하나의 마스터 타임라인(`masterTl`)** 안에서 동기화되어야 한다.

이 요구사항 때문에 `GlobalInteractionStage` 하나가 그 타임라인을 소유하는 구조가 됐다.

### 왜 컴포넌트를 분리하지 못했나

`masterTl`은 모든 섹션의 타이밍을 **하나의 레이블 시스템**으로 관리한다:

```
HERO → START_TO_PAIN → TO_PAIN → PAIN_CONTENT →
RESONANCE → PAIN_TO_MSG → TO_MESSAGE → MSG_CONTENT →
MSG_TO_FW → TO_FORWHO → FW_CONTENT →
FW_TO_STORY → TO_STORY → STORY_CONTENT → TO_CTA → TO_FOOTER
```

이 레이블들은 `calculateLabels()`의 **가중치 기반 계산**으로 나온다. 가중치가 바뀌면 모든 섹션의 타이밍이 동시에 바뀐다. 이게 설계 의도다.

컴포넌트를 쪼개면:
- 타임라인을 어느 컴포넌트가 소유하는지 불명확해진다
- 컴포넌트 간 타임라인 레이블 참조가 복잡해진다
- 섹션 간 동기화가 깨질 위험이 생긴다

결론: **컴포넌트는 하나로 유지, 함수만 분리**하는 방향으로 결정됐다.

---

## 2. 현재 파일 구조 (v2 기준)

```
components/sections/home/
├── GlobalInteractionStage.tsx  — 컴포넌트 본체 + useGSAP 훅
├── builders/                   — [v1 대비 변경] 단일 파일 → 폴더로 분리 완료
│   ├── hero.ts     — buildLogoTimeline, buildHeroSwapSequence
│   ├── pain.ts     — buildNemoTimeline
│   ├── scroll.ts   — buildSectionScrollTimeline
│   ├── message.ts  — buildMessageTimeline
│   └── index.ts    — 전체 re-export
├── utils.ts        — calculateLabels, initGlobalStyles, initLogoState, initNemoState
├── journey-data.ts — LOGO_JOURNEY_SECTIONS, NEMO_JOURNEY_SECTIONS
└── types.ts        — GlobalInteractionStageProps, JourneySectionConfig
```

### 왜 utils.ts와 builders/가 lib/가 아닌 섹션 폴더에 있나

**`calculateLabels()`** — `JOURNEY_MASTER_CONFIG`, `TIMING_CFG`, `STAGES` 상수를 참조해서 레이블 오프셋을 계산하는 함수다. 이 프로젝트, 이 섹션에만 쓰이는 함수를 `src/lib/`에 올리는 건 과도한 추상화다.

**`initLogoState()`, `initNemoState()`** — `JourneyLogoHandle`, `SharedNemoHandle`이라는 컴포넌트 DOM 핸들을 직접 파라미터로 받는다. 이걸 `src/lib/`으로 올리면 컴포넌트 타입에 의존하는 함수가 글로벌 lib에 있는 구조가 돼서 **순환 참조 위험**이 생긴다.

---

## 3. 실제로 겪었던 버그들과 그 흔적

지금 코드에 있는 "이상해 보이는" 로직들은 전부 이유가 있다.

### 3-1. requestAnimationFrame 안에서 타임라인 빌드

```typescript
rafId.current = requestAnimationFrame(() => {
  masterTl.current = gsap.timeline({ scrollTrigger: { ... } });
  ...
});
```

**왜**: rAF 없이 빌드하면 브라우저 레이아웃이 확정되기 전에 pin 좌표가 잡혀서 엉망이 된다. 특히 모바일에서 기기 판정이 확정되기 전에 타임라인이 빌드되면 스케일이 PC 기준으로 잡혀서 로고가 뷰포트를 벗어난다.

**건드리면 안 되는 이유**: rAF를 제거하거나 타이밍을 바꾸면 pin 좌표가 틀어져서 모바일에서 섹션이 `28,815px` 아래로 밀리는 버그가 재현된다.

### 3-2. 전역 포인터의 위험성과 로컬 캡처 (Local Capture)

기존에는 `masterTl.current.kill()`을 호출했으나, 이는 리사이즈나 페이지 이동 시 **"과거의 클린업"이 "미래의 엔진"을 죽이는 레이스 컨디션**을 유발했습니다.

**해결 (V11.7)**:
- 렌더링 세션마다 `let localTl = null;` 변수를 선언하고 `ctx.add()` 내부에서 할당.
- 클린업 함수는 오직 이 **로컬 변수**만 참조하여 자신이 만든 인스턴스만 정확히 제거.

### 3-3. 비동기 테두리 탈출 방지 (Async Guard)

`requestAnimationFrame`이나 `setTimeout`은 GSAP Context 바깥으로 '탈출'하여 클린업 이후에도 좀비 트리거를 생성할 수 있습니다.

**해결 (V11.7)**:
- 모든 비동기 로직을 **`ctx.add(() => { ... })`**로 감싸서 GSAP의 관리 영역에 강제 귀속.
- `layoutTimerRef` 등을 통해 타이머 ID를 관리하고 클린업 시 명시적으로 `clearTimeout`.

### 3-4. 홈 복귀 시 무음 마운트 해결 (Pinpoint Trigger)

포탈(`createPortal`)이 마운트되는 시점과 `useGSAP`이 실행되는 시점의 미세한 어긋남으로 인해, 복귀 시 엔진이 기동하지 않는 문제가 있었습니다.

**해결 (V11.7)**:
- `revision` 상태값을 도입하여 포탈 마운트 직후 엔진이 침묵할 경우 이를 강제로 재기동(Double-Lock useEffect)하는 메커니즘 구축.

---

## 4. 클린업(Cleanup) 시퀀스 명세 (V11.7 정규화)

클린업은 다음 순서를 엄격히 준수해야 시각적 유령(Ghost) 및 좀비 트리거가 남지 않는다.

```typescript
return () => {
  // 1. 비동기 타이머 및 rAF 즉시 중단 (중요: 가장 먼저 수행)
  if (rafId.current) cancelAnimationFrame(rafId.current);
  if (layoutTimerRef.current) clearTimeout(layoutTimerRef.current);

  // 2. 섹션 래퍼 스타일 강제 초기화
  const wrapper = document.getElementById('sections-content-wrapper');
  if (wrapper) {
    wrapper.style.position = '';
    wrapper.style.top = '';
    wrapper.style.transform = '';
  }

  // 3. 로컬 캡처 인스턴스 정밀 제거
  // 전역 Ref가 아닌 이 스코프의 localTl만 소거하여 레이스 컨디션 방지
  if (localTl) {
    localTl.scrollTrigger?.kill();
    localTl.kill();
  }

  // 4. GSAP Context 전체 리셋
  ctx.revert();

  // 5. 핀 스테이지 잔여 스타일 소거
  gsap.set('#home-stage', { clearProps: 'transform,position' });
};
```

---

## 5. 아키텍처 정규화 가이드 (V11.7)

시스템의 복잡도를 낮추기 위해 다음 원칙을 준수한다.

1. **Z-Index Layer**: `#sections-content-wrapper`가 `z-index: 20`을 소유하므로, 내부 섹션은 별도의 zIndex를 가지지 않는 것을 원칙으로 한다.
2. **Parameter Purity**: `calculateLabels` 등 전역 유틸리티는 `isTouch` 등의 불리언 대신 `interactionMode` 문자열 자체를 넘겨받아 내부에서 분기한다.
3. **Responsive Logo**: 헤더 로고 스케일은 빌더(`buildLogoTimeline`) 내부에서 기기별 상수를 참조하여 결정한다.

  // 6. keywordsTrigger kill (독립형 트리거 — v2 추가)
  if (keywordsTrigger.current) {
    keywordsTrigger.current.kill();
    keywordsTrigger.current = null;
  }

  // 7. setIsTimelineReady(false)
  setIsTimelineReady(false);
};
```

**왜**: `ctx.revert()`가 rAF 안에서 생성된 ScrollTrigger를 포착하지 못한다. 그래서 `masterTl.current`를 통해 직접 추적해서 명시적으로 kill해야 한다.

순서가 중요한 이유:
- `cancelAnimationFrame` 먼저 안 하면 클린업 중에 rAF가 실행돼서 새 인스턴스가 생긴다
- wrapper 스타일 초기화를 `ctx.revert()` 전에 해야 레이아웃 무결성이 확보된다
- `clearProps`를 `ctx.revert()` 후에 해야 GSAP이 복구한 값을 다시 지울 수 있다

**건드리면 안 되는 이유**: 순서를 바꾸면 좀비 ScrollTrigger 인스턴스가 생겨서 다른 페이지 다녀온 후 홈으로 돌아왔을 때 `home-stage transform: translate(0px, 28815px)` 버그가 재현된다.

### 3-3. footerHeight === 0 가드

```typescript
if (footerHeight === 0) return;
```

**왜**: 푸터 높이가 측정되기 전에 타임라인이 빌드되면 `finalY` 계산이 틀어진다. `footerHeight: 0`이면 스크롤 끝 지점이 짧아져서 CTA 섹션까지 도달하기 전에 스크롤이 끝나버린다.

**건드리면 안 되는 이유**: 이 가드를 제거하면 모바일에서 타임라인 좌표가 틀어진다.

### 3-4. [v1 대비 변경] isMobile 타이밍 문제 해결 방식

**v1 문서의 상황**: `useDeviceDetection`이 초기값 `false`에서 시작해서 마운트 후 실제값으로 업데이트되는 타이밍 문제가 있었다. 그래서 `window.innerWidth`를 직접 체크하는 방어 로직이 `initLogoState` 안에 있었다.

**현재 상황**: 이원화 반응형 아키텍처(DeviceProvider)가 도입되면서 `isMobileView`가 안정적으로 주입된다. `window.innerWidth` 직접 체크 방어 로직은 제거됐다. 타이밍 문제는 DeviceProvider의 초기화 순서로 해결됐다.

### 3-5. [v1 대비 변경] isScrollable 리셋 조건

**v1 문서의 상황**: 모바일에서 다른 페이지 다녀오면 `isScrollable`이 `true`로 유지된 채로 복귀하는 문제가 있었다. `isMobile && isOn` 조건으로 모바일에서만 리셋했다.

**현재 상황**: `isMobile` 조건이 제거됐다. `pathname === '/' && isOn` 조건만 남아있다. 리사이즈 시 스크롤 잠김 방지를 위해 isMobile 의존성을 제거한 것.

### 3-6. useHeroSequence에서 sequenceStep 의존성 제거

```typescript
useEffect(() => {
  if (isOn) {
    if (sequenceStep > 0) return;
    ...
  }
}, [isOn]); // sequenceStep이 의존성 배열에 없는 것은 의도적
```

**왜**: `sequenceStep`을 의존성 배열에 추가하면 `sequenceStep`이 업데이트될 때마다 타이머가 재실행되어 무한루프가 발생한다. ESLint exhaustive-deps 경고가 뜨지만 의도적으로 제거한 것이다. 절대 다시 추가하지 마라.

---

## 4. 판단 기준표

### ❌ 절대 금지

| 항목 | 이유 |
|------|------|
| `#home-stage` ScrollTrigger 설정 변경 (trigger, pin, pinSpacing, end, scrub) | 전체 인터랙션 뼈대. 건드리면 SharedNemo 위치, 로고 여정, 푸터 reveal 전부 붕괴 |
| masterTl 생성 방식 변경 (rAF 제거/타이밍 변경) | 모바일 28,815px 버그 재현 |
| 클린업 순서 변경 | 좀비 ScrollTrigger 인스턴스 → 다른 페이지 복귀 시 섹션 붕괴 |
| DOM id 변경 (`#home-stage`, `#sections-content-wrapper`, `hero-nemo-origin`, `hero-logo-anchor`) | GlobalInteractionStage가 getElementById로 직접 참조 |
| GlobalInteractionStage를 여러 컴포넌트로 쪼개기 | masterTl 소유권 문제 + 동기화 깨짐 |
| `useGSAP` 의존성 배열 변경 | 재실행 트리거 타이밍 전체가 어긋남 |
| `calculateLabels()` 구조 변경 | 모든 섹션 타이밍이 이 함수에 의존 |
| `footerHeight === 0` 가드 제거 | 모바일 타임라인 좌표 틀어짐 |
| `utils.ts` → `src/lib/` 이동 | 순환 참조 위험 |
| `useHeroSequence` isOn useEffect에 sequenceStep 추가 | 무한루프 발생 |
| Double-Lock ScrollTrigger.refresh() 타이밍 변경 | 빌드 직후 + 100ms 후 두 번 호출이 의도적 설계 |

### ✅ 이미 완료된 것

| 항목 | 상태 |
|------|------|
| `builders.ts` → `builders/` 폴더 분리 | 완료 (hero / pain / scroll / message / index) |
| `isMobile` → `isMobileView` 이원화 | 완료 |
| `window.innerWidth` 직접 체크 방어 로직 제거 | DeviceProvider 도입으로 불필요해짐 |
| FallingKeywords pause/resume 독립 ScrollTrigger | 완료 (`keywordsTrigger.current`) |

### ⚠️ 조건부 가능

| 항목 | 조건 |
|------|------|
| `TIMING_CFG` 가중치 수치 조정 | 타이밍 튜닝 목적만. 구조 변경 금지 |
| `JOURNEY_MASTER_CONFIG` 데이터 수정 | 로고/네모 상태값만. 타임라인 로직 변경 금지 |
| 각 섹션 콘텐츠 추가 | 섹션 컴포넌트 수정만. GlobalInteractionStage 건드리지 말 것 |
| `builders/`에 새 함수 추가 | masterTl 구조 변경 없이 추가만. 기존 함수 수정 금지 |
| `SECTION_SCROLL_HEIGHT` 수치 조정 | 섹션 높이 변경 시 반드시 함께 수정. 단독 수정 금지 |

---

## 5. useGSAP 의존성 배열 (현행 기준)

```javascript
{ dependencies: [isScrollable, isOn, isMobileView, isTablet, footerHeight] }
```

**v1 문서와 달라진 점**: `isMobile` → `isMobileView`, `isTablet` 추가됨.
이원화 반응형 아키텍처 도입 시 의도적으로 변경됐다. 현재 상태가 정답이다. 다시 바꾸지 마라.

---

## 6. 이 구조를 이해하는 핵심 한 줄

**"이 코드의 복잡함은 무지의 산물이 아니라 실제 버그를 잡은 흔적이다."**

각 방어 로직을 단순화하거나 제거하고 싶다면 — 그 로직이 왜 생겼는지 이 문서에서 먼저 확인해라. 이유 없이 생긴 코드가 없다.

