# 인터랙션 규칙 (Interaction)

## ⏱️ 1. 타임라인 동기화 (Strict Whole-Pin)
- **Single Track**: 모든 전역 애니메이션은 `GlobalInteractionStage`의 단일 마스터 타임라인에 소속됨.
- **Total Pinning**: 핸드오버 무결성을 위해 `#home-stage` 전체에 `pin: true`를 적용하고 타임라인으로 섹션 이동을 제어함.
- **Double-Lock**: 스크롤 해제 시 `requestAnimationFrame`과 `ScrollTrigger.refresh()` 지연 호출을 통해 레이아웃 좌표를 보정함.

## 🔡 2. 로고 여정 (Logo Journey)
- **8단계 변형**: OFF -> ON -> 네모 -> RECTANGLE (T->+ 모핑) -> 네모△/○ON 로 복합 변형.
- **T -> + Morph**: `RECTANGLE`의 'T'가 '+' 기호로 교차 페이드되며 변형되는 시각 언어 준수.

## ⬛ 3. 네모 모핑 (Nemo Morphing)
- **Shared Object**: 하나의 `SharedNemo`가 배경 확장, 테두리 박스, 이미지 마스크 등으로 연속 변형됨.
- **Transition**: 섹션 전환 시 `document.documentElement`의 `--bg` 변수 업데이트를 통한 배경색 인터폴레이션 레이어와 연동.

## ⚙️ 4. 기술 스택
- **GSAP + ScrollTrigger**: 애니메이션 핵심 엔진
- **Lenis**: 스무스 스크롤 인프라 (현재 GSAP 핀과 조화롭게 연동됨)
- **Matter.js**: `FallingKeywords` 등 물리 효과 전용
3. 컴포넌트 소유권 (Ownership)
- **GlobalInteractionStage**: Master Timeline, ScrollTrigger 및 Pin 제어권 소유.
- **JourneyLogo / SharedNemo**: 순수 시각(Visual) 렌더링 담당.
- **HomeStage**: 정적 섹션 레이어링 및 DOM 구조 유지 담당.
