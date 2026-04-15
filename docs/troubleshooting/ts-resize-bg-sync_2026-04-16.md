# Troubleshooting: 리사이즈 시 배경색 유실 및 진행도 가드를 통한 해결 (V11.19)

- **날짜**: 2026-04-16
- **상태**: 해결 완료 (Resolved)
- **관련 파일**: `GlobalInteractionStage.tsx`, `global-interaction-utils.ts`, `scroll.ts`

---

## 1. 현상 (Symptom)
다크 배경이 적용된 섹션(Pain, CTA 등)에서 브라우저 창 크기를 조절(Resize)할 때, 배경색이 찰나의 순간에 크림색(Hero 섹션 기본값)으로 튀었다가 고정되는 현상 발생. 스크롤을 1px이라도 움직이면 정상화되지만, 정지 상태에서의 리사이즈는 시각적 무결성을 해침.

## 2. 원인 분석 (Root Cause)
인터랙션의 '초기화(Initialization)'와 '진행(Timeline)' 상태 간의 비동기적 충돌임.

1. **파괴적 초기화**: 리사이즈 시 `useGSAP`이 재실행되면서 `initGlobalStyles`가 호출됨. 이 함수는 현재 스크롤 위치를 모른 채, 무조건 히어로 섹션의 기본 배경색(Cream)을 `:root`에 주입하여 기존 상태를 파괴함.
2. **상태 복구의 지연**: GSAP 타임라인이 리셋 후 자신의 `progress`를 복구하여 배경색을 다시 다크로 돌려놓으려 할 때, 타임라인 내에 배경색 애니메이션이 없거나 '전이 구간'에만 존재하여 '정지 구간'의 상태를 지키지 못함.
3. **진행도 인지 누락**: 시스템 전체가 "지금 인터랙션이 진행 중인가?"라는 공통의 합의를 가지고 있지 않음.

## 3. 해결 (Resolution)
상태 중심의 **이중 잠금(Double-Lock)** 메커니즘을 도입함.

1. **전역 진행도 공유 (Progress Sharing)**:
    - `GlobalInteractionStage`의 `onUpdate` 콜백에서 현재 진행도를 `window._masterTlProgress`에 실시간으로 기록함.
2. **진행도 기반 가드 (Progress Guard)**:
    - `initGlobalStyles` 상단에 `_masterTlProgress > 0.001` 일 때 리셋 로직을 건너뛰는 가드를 설치함. "이미 여행을 시작했다면 초기화 명령을 거부하라"는 논리임.
3. **타임라인 상태 잠금 (Timeline Locking)**:
    - 배경색 제어를 로고 빌더에서 분리하여 섹션 빌더(`scroll.ts`)로 이관.
    - 타임라인 전 구간(0~1)에 걸쳐 배경색 상태를 Tween으로 정의하여, 리사이즈 후 타임라인 복구 시 해당 위치의 색상이 물리적으로 강제 복원되도록 설계함.

## 4. 교훈 및 예방 (Lesson & Prevention)
- **초기화의 지능화**: 모든 초기화 함수는 항상 현재의 인터랙션 진행 상태를 확인(Progress-Aware)해야 함.
- **데이터 일원화**: 배경색 같은 전역 환경 변수는 파편화된 빌더가 아닌, 인터랙션의 중심축(Scroll Builder)에서 관리되어야 함.

---
> [!TIP]
> **Refactoring Insight**: 땜질(Patch) 방식의 가드도 중요하지만, 타임라인 자체가 '상태'를 소유(Owner)하게 만드는 것이 가장 근본적인 해결책입니다.
