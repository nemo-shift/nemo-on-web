# 💎 네모:ON 전역 수호 목록 (Sacred List) - V1.0

본 문서는 네모:ON 프로젝트의 **'시스템 무결성(Integrity)'**을 유지하기 위해 어떠한 경우에도 임의로 변경하거나 삭제해서는 안 되는 **최상위 금기 사항**을 기록합니다. 이 목록은 수많은 시행착오와 롤백 끝에 얻어낸 '안정화된 뼈대'이므로, 수정이 필요할 경우 반드시 사용자(Human)와의 심층 논의와 승인을 거쳐야 합니다.

---

## 🔒 절대 건드리면 안 되는 13가지 성역 (Sacred Gems)

1.  **#home-stage ScrollTrigger 설정**: 
    - `trigger`, `pin: true`, `pinSpacing: false` 설정은 전체 스크롤 동기화의 근간입니다. 절대 변경하지 않습니다.
2.  **masterTl 생성 방식**:
    - 반드시 `requestAnimationFrame` 내부에서 생성하여 브라우저의 전역 렌더링 주기와 동기화해야 합니다.
3.  **Double-Lock ScrollTrigger.refresh() 구조**:
    - 리사이즈 및 스크롤 해제 시 좌표 정합성을 확보하기 위한 이중 잠금 로직을 보존합니다.
4.  **useGSAP 의존성 배열**:
    - `[isScrollable, isOn, isMobileView, isTabletPortrait, footerHeight]` 5가지 필수 의존성을 임의로 축소하거나 변경하지 않습니다.
5.  **시스템 핵심 DOM ID**:
    - `hero-nemo-origin`, `hero-logo-anchor`, `#home-stage`, `#sections-content-wrapper` 등 애니메이션과 물리 엔진의 기준점 ID를 사수합니다.
6.  **ImperativeHandle Ref 구조**:
    - `JourneyLogo`, `SharedNemo`의 `useImperativeHandle`을 통한 외부 인터페이스 구조를 유지합니다.
7.  **useHeroSequence 의존성 의도적 누락**:
    - `isOn` `useEffect`에서 `sequenceStep`을 제외한 것은 무한 루프를 방지하기 위한 정교한 설계이므로 그대로 유지합니다.
8.  **LenisScrollRestoration 조건**:
    - `pathname !== '/'` 조건을 통해 홈 페이지와 서브 페이지의 스크롤 엔진 동작을 분리한 로직을 보존합니다.
9.  **GlobalInteractionStage 클린업 순서**:
    - 세션 종료 시 리소스를 정리하는 순서는 메모리 누수 방지를 위해 최적화되어 있으므로 임의로 바꾸지 않습니다.
10. **calculateLabels() 가중치 엔진**:
    - `global-interaction-utils.ts`의 라벨 계산 수식은 타임라인의 리듬감을 결정하는 핵심이므로 존중합니다.
11. **builders/hero.ts 데이터 체이닝**:
    - `fromTo` + `lastEnv` 구조는 헤더 로고의 투명화 버그(`rgba(0,0,0,0)`)를 막기 위한 최종 방어선입니다.
12. **invalidateOnRefresh 추가 금지**:
    - 이 설정은 `ScrollTrigger.refresh()` 시 스타일을 재평가하여 로고 색상을 오염시키므로 절대 다시 추가하지 않습니다.
13. **지연 렌더링 뼈대 (setTimeout)**:
    - `GlobalInteractionStage.tsx`의 `setTimeout`은 브라우저 스크롤바 렌더링 정착을 기다리는 핵심 장치입니다. **수치(현재 100ms)는 상황에 따라 조율 가능하나, 이 지연 메커니즘 자체는 절대 제거하지 않습니다.**

---

> **Antigravity 행동 지침**:
> "이 목록에 위배되는 작업을 지시받거나 필요하다고 판단될 경우, 반드시 즉시 중단하고 위험성을 보고한 후 대안을 논의하라. 무결성 사수가 성능보다 우선한다."
