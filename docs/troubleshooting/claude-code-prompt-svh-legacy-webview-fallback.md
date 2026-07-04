# [작업 지시] svh 미지원 구형 인앱 WebView(카카오톡 등) 폴백 안전망 추가

## 배경 및 문제 정의

V67.ViewportFix에서 홈 스크롤 기하학을 `vh` → `svh`로 전면 전환했다. 이는
일반 모바일 브라우저(Safari/Chrome)에서는 정상 동작하지만, **카카오톡 인앱
브라우저 등 구형 WebView에서는 레이아웃이 깨지는 회귀**가 발견됐다.

원인: 카톡 인앱 브라우저는 자체 번들 WebView를 쓰며, 이 버전이 사용자
기기의 시스템 브라우저보다 뒤처져 `svh`/`lvh` 단위(2022년 말 표준화)를
아예 모르는 경우가 있다. **CSS는 이해하지 못하는 단위의 선언을 통째로
무시**하므로, `height: 100svh`가 무시되면 해당 요소는 높이 미지정 상태로
붕괴하고, 그 안의 `translate-y-[Nsvh]` 등도 `transform: none`으로 무시되어
콘텐츠가 화면 밖으로 밀려나 보이지 않게 된다.

**해결 전략:** JS 리팩토링 없이, CSS `@supports` 기능 감지로 "svh를 이해
못 하는 환경에서만" 예전 `vh` 값으로 자동 폴백시킨다. svh 지원 환경은
이 블록이 완전히 무시되어 기존 동작 그대로 유지된다. 이건 신규 기능에
대한 반대가 아니라 순수 방어 코드이며, 카톡 증상 유무와 무관하게 넣어야
하는 항목이다 (다른 구형 인앱 브라우저에도 동일 취약점이 있음).

---

## ⚠️ 작업 범위 제한

- 이 작업은 **CSS 폴백 추가 + 최소한의 JSX 조건부 값 계산**만 다룬다.
  기존 svh 전환 로직(GlobalInteractionStage, builders/*)의 JS 계산 방식은
  이미 `getStableVH()`의 `return h || window.innerHeight` 폴백으로
  안전하므로 **건드리지 않는다.**
- 서브페이지, 홈 외 다른 영역은 범위 밖이다.
- `!important`는 이 작업의 폴백 블록 안에서만 사용하고 다른 곳엔 추가하지 않는다.

---

## STEP 1 — className(Tailwind arbitrary value) svh 폴백

대상: `grep -rhoE "[a-z-]+-\[-?[0-9.]+svh\]" --include="*.tsx" --include="*.ts" components/sections/home | sort -u` 로 확인된 6개 클래스.
(작업 시작 전 이 grep을 다시 실행해 새로 추가된 svh 클래스가 없는지 재확인할 것.)

`app/globals.css` 최하단에 추가:

```css
/* [V68.LegacyWebViewFallback] svh 미지원 구형 WebView(카카오톡 인앱 등) 안전망.
   신규 기능과 무관 — svh 지원 브라우저는 이 블록이 평가되지 않고 원래
   Tailwind 클래스(100svh 등)가 그대로 적용된다. 카톡 증상 유무와 무관하게
   상시 방어 코드로 유지한다. */
@supports not (height: 100svh) {
  .h-\[100svh\]      { height: 100vh !important; }
  .h-\[1000svh\]     { height: 1000vh !important; }
  .min-h-\[100svh\]  { min-height: 100vh !important; }
  .gap-\[1svh\]      { gap: 1vh !important; }
  .gap-\[4svh\]      { gap: 4vh !important; }
  .gap-\[6svh\]      { gap: 6vh !important; }
}
```

주의: 위 6개는 대화 시점 기준 목록이다. 이 STEP 실행 직전에 반드시 grep을
다시 돌려 목록이 달라지지 않았는지 확인하고, 새 클래스가 있으면 같은
패턴으로 추가한다. **grep 결과를 절대 자르지 말 것 (head 등 사용 금지) —
과거 이 실수로 일부 항목이 누락된 전례가 있다.**

## STEP 2 — 인라인 style={{ }} svh 값 → CSS 변수 방식 전환

문제: 인라인 스타일은 CSS 셀렉터로 접근 불가능해 STEP 1의 `@supports`
블록으로 처리할 수 없다. 대신 JS가 참조하는 CSS 커스텀 프로퍼티 하나를
`@supports`로 분기해, 인라인 스타일 값 계산식을 전부 그 변수 기반으로
바꾼다.

### 2-1. CSS 변수 선언 (`app/globals.css`)

```css
/* [V68.LegacyWebViewFallback] 인라인 스타일에서 참조하는 1svh 상당 값.
   지원 환경: 1svh. 미지원 환경: 1vh로 자동 대체. */
:root {
  --unit-svh: 1svh;
}
@supports not (height: 100svh) {
  :root {
    --unit-svh: 1vh;
  }
}
```

### 2-2. JSX 인라인 값 교체 (대상 13곳, 파일별)

각 값을 `'Nsvh'` → `'calc(var(--unit-svh) * N)'` 형태로 교체한다.
(음수는 `* -N`, 소수는 그대로 곱하기)

**`hero/HeroSection.tsx`**
- 211행: `height: '100svh'` → `height: 'calc(var(--unit-svh) * 100)'`
- 243행: `height: isMobileView ? '60svh' : '90svh'` →
  `height: isMobileView ? 'calc(var(--unit-svh) * 60)' : 'calc(var(--unit-svh) * 90)'`

**`hero/views/HeroOffPCView.tsx`**
- 73행: `height: '80svh'` → `height: 'calc(var(--unit-svh) * 80)'`
- 114행: `bottom: '-20svh'` → `bottom: 'calc(var(--unit-svh) * -20)'`

**`hero/views/HeroOffMobileView.tsx`**
- 76행: `marginTop: '-7svh'` → `marginTop: 'calc(var(--unit-svh) * -7)'`
- 91행: `bottom: '-28svh'` → `bottom: 'calc(var(--unit-svh) * -28)'`

**`hero/views/HeroOffTabletView.tsx`**
- 76행: `marginTop: '-1svh'` → `marginTop: 'calc(var(--unit-svh) * -1)'`
- 91행: `bottom: '-30svh'` → `bottom: 'calc(var(--unit-svh) * -30)'`

**`hero/views/HeroOnMobileView.tsx`**
- 52행: `bottom: '16svh'` → `bottom: 'calc(var(--unit-svh) * 16)'`

**`hero/views/HeroOnTabletView.tsx`**
- 52행: `bottom: '15svh'` → `bottom: 'calc(var(--unit-svh) * 15)'`

**`hero/views/HeroTabletView.tsx`**
- 49행: `minHeight: isOn ? '15svh' : '10svh'` →
  `minHeight: isOn ? 'calc(var(--unit-svh) * 15)' : 'calc(var(--unit-svh) * 10)'`
- 79행: `minHeight: '40svh'` → `minHeight: 'calc(var(--unit-svh) * 40)'`
- 114행: `minHeight: '5svh'` → `minHeight: 'calc(var(--unit-svh) * 5)'`

작업 전 `grep -rn "svh'" --include="*.tsx" components/sections/home | grep -v "className"`
를 다시 실행해 13곳 목록이 그대로인지 확인하고 시작할 것. 목록이 다르면
새로 나온 지점도 동일 패턴으로 변환한다.

## STEP 3 — Footer의 calc(lvh/svh) 폴백

문제: `Footer.tsx`의 `paddingBottom: 'calc(100lvh - 100svh + env(safe-area-inset-bottom, 0px))'`는
`lvh`/`svh` 둘 다 이해 못 하면 calc 전체가 무효화될 수 있다.

`app/globals.css`에 추가 (STEP 1 블록과 통합 가능):

```css
/* [V68.LegacyWebViewFallback] Footer 크롬 보정 패딩 폴백.
   svh/lvh 미지원 환경에서는 V67 이전의 고정 80px 안전 여백으로 복귀. */
@supports not (height: 100svh) {
  #site-footer {
    padding-bottom: 80px !important;
  }
}
```

`Footer.tsx`의 최상위 엘리먼트에 `id="site-footer"`가 없다면 부여하고,
없는 이유가 있다면(이미 다른 id/역할 있음) 기존 className에 대응하는
셀렉터로 대체한다. (예: 모바일 전용 클래스가 있다면 그 클래스로 셀렉터 지정)

## STEP 4 — 검증

1. `grep -rn "svh" --include="*.tsx" --include="*.ts" components/sections/home app/globals.css`
   전체 출력을 보고, 다음 세 그룹으로 전부 설명 가능한지 확인:
   - Tailwind className (STEP 1 폴백 대상)
   - 인라인 style (STEP 2로 `var(--unit-svh)`로 치환된 것)
   - `getStableVH`/`svhPx` 등 JS 계산 로직 (이미 안전 — 변경 없음)
   빠진 svh가 있으면 안 된다.
2. `npx tsc --noEmit` / `next build` 통과 확인.
3. 브라우저 개발자 도구에서 `CSS.supports('height', '100svh')`를
   콘솔에 강제로 false를 리턴하도록 임시 스텁하거나, 실제 구형 WebView
   에뮬레이션이 가능하면 그걸로 폴백이 발동하는지 확인.
   (임시 확인 코드를 커밋에 남기지 말 것 — 확인 후 제거)
4. 실제 카카오톡 인앱 브라우저로 홈페이지 접속 → 정방향 스크롤 완주
   → 메시지/포후/브랜드스토리 섹션의 텍스트·카드·배경 분할이 전부
   보이는지 확인.
5. 일반 모바일 브라우저(Safari/Chrome)에서 회귀가 없는지 재확인 —
   폴백 블록이 활성화되지 않아야 하며(즉 이전과 동일한 화면), 만약
   svh 지원 브라우저에서도 레이아웃이 달라졌다면 `@supports` 조건이나
   셀렉터가 잘못된 것이다.

## 하지 말 것

- JS 기반 `getStableVH`/`svhPx`/`stableVH` 관련 코드는 이미 안전하므로 수정 금지.
- 카톡 안내 팝업/외부 브라우저 유도 UI는 이 작업 범위에 포함하지 않는다.
- `!important`를 이 폴백 블록 밖에서 사용하지 않는다.
- grep 결과를 head 등으로 잘라서 부분 목록만 처리하지 않는다 (전량 확인 필수).
