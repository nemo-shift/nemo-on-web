> 최종 업데이트: 2026.03.23

# 사이드메뉴 구현 — 프롬프트

기획서의 사이드메뉴에서 지금 상황에 맞춰서 다시 기획함. (nemoon-homepage-spec의 내용과 다름)

### 레퍼런스

- [https://www.easymedia.net/kr/main](https://www.easymedia.net/kr/main) (전체 레이아웃/방식)
- [https://reactbits.dev/components/staggered-menu](https://reactbits.dev/components/staggered-menu) (슬라이드 레이어 + stagger 등장 방식)

### 방식

- **PC/태블릿**: 오른쪽 패널 슬라이드인 + 딤 처리
- **모바일**: 전체화면 패널 슬라이드인 (딤 처리 없음)

### **딤 처리 (PC/태블릿만)**
`position: fixed` 때문에 일반 딤 오버레이로는 헤더/로고/네모가 어두워지지 않음. 대신 GSAP으로 opacity를 직접 낮추는 방식으로 처리:

- 섹션 콘텐츠: 딤 오버레이
- `GlobalInteractionStage`: opacity 낮춤 (GSAP) — 홈에서만 존재, 서브페이지는 처리 대상 없음
- Header: opacity 낮춤 (GSAP)
- 푸터: fixed라 딤 안 되지만 메뉴 패널이 위에 올라오므로 상관없음
- 메뉴 닫힐 때 전부 원복

### 슬라이드 레이어 순서 (StaggeredMenu 방식)

```
1레이어: #E8734A (브랜드 오렌지)
2레이어: #0891b2 (브랜드 틸)
메인 패널: #f7f1e9 (크림)
```

### 패널 너비

- PC: ~35vw (구현 후 시각적으로 조정)
- 태블릿: ~55vw (구현 후 시각적으로 조정)
- 모바일: 100vw

### **메뉴 항목**

- 01 About / 02 Offerings / 03 Diagnosis / 04 Contact
- 클릭 시: 닫힘 애니메이션 완료 후 `router.push()` — GSAP `onComplete` 콜백 안에서 실행

### 햄버거 버튼 모핑 (GSAP)

- 기본: 3줄
- 호버: ◀ 테두리 (세 줄이 삼각형 윤곽선 형성, 안쪽 투명, 배경색 보임)
- 메뉴 열림: ▶ 테두리

### 메뉴 텍스트 등장

아래에서 위로 stagger 등장

### 닫힘 조건

- 햄버거(▶) 클릭
- 메뉴 항목 클릭 → 닫히면서 해당 페이지 이동

### 스크롤 잠금

- 메뉴 열릴 때: `window.lenis?.stop()`
- 메뉴 닫힐 때: `window.lenis?.start()`
- 메뉴 패널 내부는 스크롤 허용: `data-lenis-prevent` 속성 적용
- 푸터가 보이는 상태에서 메뉴 열려있을 때 콘텐츠 스크롤 방지

### **메뉴 열기 조건**

- 홈: `isOn && isScrollable` 둘 다 true일 때만 허용
- 서브페이지: 조건 없이 허용

### **z-index**

- `INTERACTION_Z_INDEX.MENU (10002)`

### **반드시 처리해야 하는 엣지케이스**

1. **라우팅 타이밍**: 메뉴 항목 클릭 시 `router.push()`를 GSAP 닫힘 애니메이션 `onComplete` 콜백 안에서 실행. 먼저 실행하면 애니메이션 끊김.
2. **isScrollable 체크**: 히어로 시퀀스 진행 중(`isOn && !isScrollable`) 메뉴 열리면 안 됨. 햄버거 노출 조건에 `isScrollable` 추가 필요.
3. **ScrollTrigger.refresh()**: 메뉴 닫힘 애니메이션 `onComplete` 후 호출. Lenis 멈춰있는 동안 레이아웃 틀어짐 방지.
4. **페이지 이동 시 opacity 원복**: 페이지 이동 시에는 원복 없이 그냥 이동해도 됨. 새 페이지 마운트 시 컴포넌트 초기화되므로 상관없음.
5. **브라우저 뒤로가기** — 메뉴 열린 채로 뒤로가기 누르면 Lenis가 멈춘 상태로 남을 수 있음. `popstate` 이벤트 감지해서 메뉴 강제 닫음 처리. `lenis.start()` 원복 포함.
6. **리사이즈** — 메뉴 열린 채로 브라우저 창 크기 변경 시 패널 너비 안 맞아짐. 리사이즈 시 메뉴 강제 닫음 처리. `lenis.start()` 원복 포함.
7. **서브페이지 조건 분기** — `GlobalInteractionStage`가 홈에서만 렌더링됨. 서브페이지에서 메뉴 열릴 때 `GlobalInteractionStage`가 없으므로 opacity 처리 대상에서 제외. pathname 기반으로 조건 분기.

### 현재 임시 구현 교체 필요 
- Header.tsx의 기존 메뉴 구현(menuFadeIn 오버레이 방식) 완전 교체 
- 기존 메뉴 관련 state, animation, JSX 전부 새로 구현할 것

### **건드리지 않는 것**

- `GlobalInteractionStage.tsx` 타임라인 로직 변경 금지
- `#home-stage` ScrollTrigger 핀 구조 변경 금지
- `masterTl`, `_calculateLabels()` 구조 변경 금지
- `INTERACTION_Z_INDEX` 기존 값 변경 금지 — MENU(10002) 추가만 허용
- Header.tsx에서 딱 한 줄만 수정: (!isHome || isOn) → (!isHome || (isOn && isScrollable)) 이 외 헤더 구조 일절 변경 금지.

### **구현 완료 후 확인**

1. PC/모바일/태블릿 각각 메뉴 열기/닫기 정상 동작
2. 메뉴 열린 상태에서 뒤로가기 — 메뉴 닫힘 + lenis 원복
3. 메뉴 열린 상태에서 리사이즈 — 메뉴 강제 닫힘
4. 서브페이지에서 메뉴 열기/닫기 정상 동작
5. 홈 Pain 섹션에서 메뉴 열릴 때 딤 처리 확인
6. 메뉴 닫힌 후 ScrollTrigger 타이밍 정상 유지