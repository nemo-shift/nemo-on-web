# SideMenu 내비게이션 전환 버그 진단·수정 이력

> **브랜치**: `fix/kakao-vh-fix`
> **기간**: 2026-07-17
> **상태**: 🔄 수정 완료, 실기기 검증 대기

---

## 증상 (2가지)

### 증상 1: 페이지 이동 후 메뉴 열림 애니메이션 재생 + 잔상
- 사이드메뉴에서 About/Offerings로 이동 시, 새 페이지에서 사이드메뉴 3중 레이어와 메뉴 항목이 잠깐 다시 보임
- 레이어가 슬라이드아웃되는 과정에서 페이지 전환이 동시에 발생하여 교체 중인 화면이 레이어 사이로 노출

### 증상 2: 히어로 섹션 건너뜀 (두 번째 섹션부터 표시)
- 홈에서 스크롤을 내린 상태에서 사이드메뉴로 About/Offerings 이동 시, 간헐적으로 히어로가 아닌 두 번째 섹션부터 표시
- 홈의 GSAP pin-spacer가 만드는 높은 scrollY(20000px+)가 새 페이지에 잔류하여 ScrollTrigger onLeave가 즉시 발동

---

## 근본 원인 분석

### 원인 1: useEffect 콜백 정체성에 의한 animateOpen 재발사
```tsx
// 문제 코드
useEffect(() => {
  if (isOpen) {
    animateOpen();  // ← 콜백 정체성 변경만으로도 재실행
  }
}, [isOpen, animateOpen, animateClose]);
```
- `animateClose`의 `useCallback` 의존성에 `router`가 포함
- pathname 변경 → router 객체 변경 → animateClose 재생성 → useEffect 재실행
- 이 시점에 `isOpen`이 아직 true → `animateOpen()` 재발사 → 새 페이지에서 메뉴가 다시 열리는 것처럼 보임

### 원인 2: navigateTo와 animateClose의 타이밍 경합
```tsx
// 문제 코드 — 두 함수가 병렬 실행
navigateTo(href);     // setTimeout(150ms) 후 router.push
animateClose();       // 즉시 레이어 슬라이드아웃 시작
```
- `animateClose()`가 targetHref 없이 호출되어 즉시 레이어를 걷어냄
- 레이어가 걷혀나가는 도중 `router.push`로 페이지 교체 → 교체 과정이 노출
- `window.scrollTo(0, 0)`도 레이어가 걷히는 중에 실행 → 홈 페이지 점프 가시화

### 원인 3: 홈의 높은 scrollY 잔류
- 홈 페이지의 `#home-stage` whole-pin이 scrollY를 20000px+까지 확장
- `router.push` 직후 새 페이지에서도 이 scrollY가 잔류
- AboutHero/OfferingsHero의 ScrollTrigger onLeave가 즉시 트리거 → 두 번째 섹션으로 점프

---

## 해결: 5항목 일괄 수정

### Fix 1: prevIsOpenRef 전환 가드
```tsx
const prevIsOpenRef = useRef(false);

useEffect(() => {
  const prev = prevIsOpenRef.current;
  if (isOpen && !prev) {
    prevIsOpenRef.current = true;   // 즉시 갱신
    animateOpen();
  } else if (!isOpen && prev) {
    prevIsOpenRef.current = false;  // 즉시 갱신
    animateClose();
  }
  // 콜백 정체성만 바뀐 경우 → 아무것도 하지 않음
}, [isOpen, animateOpen, animateClose]);
```

### Fix 2: 폴링 제거 → pathname 기반 React 신호
- `pendingNavHrefRef`에 목적지 저장
- `useEffect([pathname])`에서 도착 감지 → `revealAndReset()` 호출
- React가 새 페이지를 실제로 커밋한 이후에만 레이어를 걷어냄
- 2.5초 fallback 타이머 유지 (느린 네트워크 대비)

### Fix 3: revealAndReset 타임라인을 tlRef에 저장
- `tlRef.current = tl`로 단일 소유권 유지
- 다른 애니메이션의 kill 로직이 이 타임라인도 제어 가능

### Fix 4: ScrollTrigger 전역 kill을 홈 이탈 시로 한정
```tsx
if (isHome) {
  ScrollTrigger.getAll().forEach(st => st.kill());
}
```
- 홈(`/`)에서만 20000px+ pin-spacer의 되감기 리페인트 문제가 발생
- 서브페이지 간 이동은 `GlobalScrollTriggerCleanup`이 전담
- 역할 중복 및 불필요한 side effect 방지

### Fix 5: animateClose(targetHref) 통합
- 기존 `navigateTo` + `animateClose()` 병렬 호출 → `animateClose(href)` 단일 호출로 통합
- targetHref가 있으면: 메뉴 텍스트만 페이드아웃 → 레이어 불투명 유지 → scrollTo 리셋 → router.push → pathname 도착 감지 → 레이어 슬라이드아웃
- `navigateTo` 함수 및 `NAV_PUSH_DELAY` 상수 제거

---

## 수정 파일

| 파일 | 변경 내용 |
|------|-----------|
| `src/components/layout/SideMenu.tsx` | 5항목 전체 적용 |
| `src/components/layout/LenisScrollRestoration.tsx` | popstate 기반 스크롤 복원으로 전환 (이전 세션) |
| `src/lib/navigation.ts` | markPushNav 제거, 빈 모듈 유지 |
| `src/lib/index.ts` | markPushNav export 제거 |
| `src/components/sections/home/cta/CTASection.tsx` | markPushNav 호출 제거 |
| `src/components/layout/Footer.tsx` | PUSH_NAV sessionStorage 제거 |

---

## 검증 항목

- [ ] (a) 홈→About/Offerings 사이드메뉴 이동 10회 반복 — 메뉴 열림 재생/잔상 없음, 항상 히어로부터 시작
- [ ] (b) 서브페이지 간 이동 (About→Offerings 등) 정상
- [ ] (c) 서브페이지 히어로 배경 커버리지 — 별도 이슈로 조사 예정
- [ ] (d) 같은 페이지 재클릭(scrollToTop), Escape/딤 클릭 닫기, 뒤로가기 시 메뉴 강제 닫힘
- [ ] (e) Lenis stop/start 순서 — 어떤 경로에서도 start로 종료되는지

---

## 관련 문서
- `docs/troubleshooting/kakao-inapp-viewport-fix_2026-07.md` — 카카오 인앱 뷰포트 버그
- `docs/troubleshooting/ios-safari-offmode-scroll-fix_2026-07.md` — iOS Safari 오프모드 스크롤 차단
