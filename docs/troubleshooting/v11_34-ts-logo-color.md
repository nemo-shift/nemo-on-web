# [TS-V11.34] 헤더 로고 색상 투명화(Transparency) 버그 리포트

이 문서는 브라우저 리사이징 시 헤더 로고의 텍스트와 아이콘 색상이 일시적으로 투명해지는(`rgba(0,0,0,0)`) 현상에 대한 원인 분석과 그 해결 과정을 상세히 기록합니다.

---

## 0. 발생 경위 (Context)

V11.34 2단계 작업(리사이즈 동기화) 중 `invalidateOnRefresh: true`를 ScrollTrigger 옵션에 추가하면서 발생. 미세 리사이즈 좌표 교정을 위해 추가한 옵션이 오히려 `ScrollTrigger.refresh()` 시마다 `fromTo` 트윈을 재평가하여 투명값을 박는 부작용을 일으킴. 상세 내용은 `v11.34-resize-sync.md` 참조.

---

## 🔍 1. 현상 분석 (Symptoms)

리사이즈 직후, 타임라인이 재빌드되는 시점에 `GlobalInteractionStage`의 헤더 로고가 시각적으로 소실되는 현상이 발생했습니다.

- **관찰 데이터**: `:root` 엘리먼트의 인라인 스타일에 `--header-fg: rgba(0,0,0,0)`가 강제로 주입되어 있음.
- **영향 범위**: ON 모드에서 스크롤 활성화 시, 및 리사이즈 이벤트 시 발생.
- **결과**: 로고가 배경색에 묻혀 보이지 않거나, 비정상적으로 밝게 표시됨.

**콘솔 확인 결과:**
```
before buildLogo header-fg: #0d1a1f  ← 정상
after buildLogo header-fg: #0d1a1f   ← 정상
refresh 전 header-fg: rgba(0,0,0,0)  ← ScrollTrigger.refresh() 전에 이미 투명
```

---

## 🕵️ 2. 근본 원인 규명 (Root Cause)

### GSAP의 '성급한 시작값 캡처' (The Capturing Trap)

GSAP 엔진은 타임라인을 빌드하거나 트윈을 생성할 때, 대상의 스타일을 훑어서 **'애니메이션 시작점'**을 확정 짓습니다.

1. **경합 조건 (Race Condition)**: 리사이즈 직후, 브라우저는 레이아웃을 재계산(Reflow)하느라 바쁩니다.
2. **데이터 결함**: 이 찰나의 공백기에 GSAP이 `--header-fg`의 현재 값을 물으면, 브라우저는 명확한 답을 주지 못하고 기본 투명값(`rgba(0,0,0,0)`)을 던집니다.
3. **오답의 박제**: GSAP은 이 투명한 값을 **'절대 정답'**으로 믿고 `:root`에 인라인 스타일로 박아버려, 이후의 정상적인 CSS 전이를 차단합니다.

### 직접 원인

`invalidateOnRefresh: true` 옵션이 `ScrollTrigger.refresh()` 호출 시마다 타임라인 내 트윈들을 재평가하면서, `fromTo`의 `from` 값을 다시 캡처하는 과정에서 투명값이 박히는 것으로 확인됨.

---

## 📂 수정 대상 파일

| 파일 | 변경 내용 |
|------|-----------|
| `src/components/sections/home/builders/hero.ts` | `tl.to` → `tl.fromTo` + `lastEnv` 데이터 체이닝 |
| `src/components/sections/home/GlobalInteractionStage.tsx` | `invalidateOnRefresh` 제거, `initGlobalStyles` 가드 추가 |
| `src/components/sections/home/global-interaction-utils.ts` | `initGlobalStyles` 파라미터 확장 (`isMobile` 추가) |

---

## 🛠️ 3. 3중 레이어 무결성 가드 (Triple-Guard)

단순한 하드코딩이 아닌, **'데이터 중심의 동기화'**와 **'엔진 제어'**를 통해 문제를 종결했습니다.

### [Layer 1] 데이터 체이닝 (`fromTo` Strategy)

- **Before**: `tl.to(...)` — 브라우저의 현재 상태를 묻고(Query) 시작값을 결정. (불안정)
- **After**: `tl.fromTo(...)` — 브라우저에게 묻지 않고, `JOURNEY_MASTER_CONFIG`의 이전 섹션 값을 시작값으로 직접 주입. (무결성 확보)

```typescript
// hero.ts - lastEnv로 이전 섹션 색상 추적
let lastEnv = JOURNEY_MASTER_CONFIG[STAGES.HERO].env;

sections.forEach(({ label, stage }) => {
  tl.fromTo(document.documentElement,
    { '--header-fg': lastEnv.fg, '--bg': lastEnv.bg },
    { '--header-fg': cfg.env.fg, '--bg': cfg.env.bg, duration: t * r, ease: 'none' },
    time
  );
  lastEnv = { fg: cfg.env.fg, bg: cfg.env.bg };
});
```

### [Layer 2] 동기화 가드 (`initGlobalStyles`)

- **Action**: 타임라인 빌더 호출 직전에 `initGlobalStyles(isOn, isMobileView)`를 강제 호출.
- **Goal**: GSAP이 시작값을 캡처하기 전에 `:root`에 정답 색상을 먼저 주입하여 엔진의 자의적 해석 차단.

```typescript
// GlobalInteractionStage.tsx - buildLogoTimeline 직전
initGlobalStyles(isOn, isMobileView); // 동기화 가드
buildLogoTimeline(tl, logo, isMobileView, L);
```

### [Layer 3] 엔진 활성화 제어 (`invalidateOnRefresh` 제거)

- **Action**: `ScrollTrigger`의 `invalidateOnRefresh: true` 옵션 제거.
- **Goal**: 리사이즈 시마다 GSAP이 트윈을 재평가하여 투명값을 박는 통로를 원천 차단.

---

## 🏁 4. 회고 (Retrospective)

이번 트러블슈팅을 통해 확보한 원칙:

- **"브라우저의 불확실한 상태보다 명시적인 데이터를 믿을 것."**
- **"GSAP의 타임라인 빌드 사이클과 브라우저의 렌더링 사이클 사이에는 반드시 '동기화 가드'가 필요함."**
- **"`invalidateOnRefresh`는 GSAP이 CSS 변수를 애니메이션할 때 부작용을 일으킬 수 있으므로 신중하게 사용할 것."**
