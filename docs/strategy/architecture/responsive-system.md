# 전역 반응형 아키텍처 가이드 (Global 3-Axis Responsive System)

## 1. 개요 (Architecture Overview)

본 문서는 네모:ON 프로젝트의 전역 반응형 구현을 위한 기술 표준을 정의합니다. V11.32 리팩토링을 통해 확립된 **3축 체계(3-Axis System)**를 기반으로 하며, 개발 시 모든 반응형 로직은 아래의 기준에 따라 기술되어야 합니다.

---

## 2. 반응형 3대 축 정의 (The 3-Axis Definition)

모든 반응형 구현은 구현 대상(무엇을 바꾸는가)에 따라 다음의 전담 영역을 엄격히 준수합니다.

### ① 공간 축 (Space Axis)

- **대상**: 폰트 사이즈, 여백(Margin/Padding), 가로/세로 크기, 트랜스폼(XY) 수치.
- **수단**: **Tailwind 브레이크포인트 클래스**.
- **규칙**: JS 인라인 스타일 내의 삼항연산자 분기(`isMobile ? 20 : 40`)를 금지하며, 반드시 클래스(`h-20 tablet:h-40`)로 제어합니다.

### ② 레이아웃 축 (Layout Axis)

- **대상**: 컴포넌트의 존재 여부(Mount/Unmount), 페이지 단위의 대규모 뷰 전환.
- **수단**: **`DeviceContext` 기반 JS 변수**.
- **규칙**: `isMobileView` (744px 미만), `isTabletPortrait` (744~991px) 신호를 사용하여 리액트 컴포넌트 레벨에서 분기합니다.

### ③ 동작 축 (Behavior Axis)

- **대상**: 고스트 커서 노출 여부, 터치 기기용 인터랙션 리셋 로직.
- **수단**: **`interactionMode`** ('mouse' | 'touch').
- **규칙**: 기기의 너비가 아닌, 실제 유저의 포인터 입력 방식에 따라 UX 로직을 분기합니다.

---

## 3. 기술 표준 클래스 (Standard Breakpoints)

Tailwind `tailwind.config.ts`에 정의된 다음 표준 명칭을 사용합니다.

- `tablet:`: iPad Air/Pro (Portrait) 기준 (744px 이상)
- `desktop-wide:`: 고해상도 노트북/모니터 기준 (1440px 이상)
- `desktop-cap:`: 4K 및 울트라 와이드 모니터 상한선 (1920px 이상)

---

## 4. 로직 작성 가이드 (Implementation Guide)

> [!CAUTION]
> **변수 사용 금지**: `isMidRange`, `isPC`, `isTouchDevice`는 더 이상 존재하지 않는 레거시입니다. 코드 작성 시 이 변수들을 참조하면 빌드 에러가 발생합니다.

```tsx
// [BAD] 너비 기반 수치 분기
<div style={{ fontSize: isMobile ? '12px' : '18px' }} />

// [GOOD] Tailwind 기반 공간 제어
<div className="text-[12px] tablet:text-[18px]" />

// [GOOD] 동작 기반 UX 제어
if (interactionMode === 'touch') {
  // 터치 기기 전용 리셋 로직
}
```

---

## 5. 아키텍처 무결성 (Integrity)

- **TSC 0 Errors**: 모든 컴포넌트는 위 3축 체계 내에서 정규화된 타입만 사용합니다.
- **SSR Safety**: `isInitialized` 상태를 통해 서버와 클라이언트 간의 렌더링 불일치를 방지합니다.

---

V11.32 "Clean Slate" Architecture Standard.
