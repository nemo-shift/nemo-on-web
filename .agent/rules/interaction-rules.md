# Nemo:ON Interaction Integrity Rules

이 문서는 프로젝트의 핵심 인터랙션 뼈대를 보호하기 위한 에이전트 전용 전역 규칙입니다. 모든 작업 시 이 원칙을 최우선으로 준수해야 합니다.

## 🚀 영원히 건드리지 않는 것 (System Integrity)
다음 항목들은 단순히 '코드'가 아니라, 수많은 시행착오 끝에 안정화된 **시스템의 근간**입니다. 기능 고도화나 리팩토링의 대상이 아니며, 절대 변경해서는 안 됩니다.

1.  **#home-stage ScrollTrigger 핀 구조**: 
    - `trigger`, `pin: true`, `pinSpacing: false` 설정 변경 금지.
    - 절대 수정 금지 ID: `#home-stage`, `#section-pain`, `#sections-content-wrapper`, `#hero-nemo-origin`.
    - 전체 프로젝트의 스크롤 동기화가 이 구조에 의존합니다.
2.  **타임라인 아키텍처**: 
    - `masterTl` 생성 방식 및 `_calculateLabels()`의 가중치 기반 라벨 계산 엔진 구조 변경 금지.
3.  **Double-Lock 안정화 로직**: 
    - `requestAnimationFrame` + `ScrollTrigger.refresh()`를 통한 핀 좌표 무결성 확보 로직 변경 금지.
4.  **섹션 콘텐츠 래퍼**: 
    - `#sections-content-wrapper`의 구조 및 이를 활용한 `buildSectionScrollTimeline`의 누적 VH 이동 방식 보존.

## 📈 고도화 가능한 항목 (Future-Proof)
다음 항목들은 '마스터 시트' 시스템이 안착됨에 따라 점진적으로 최적화할 수 있는 대상입니다.

1.  **`_calculateLabels()` 자동화**: 현재는 가중치 기반 수동 연산이나, 향후 섹션 높이 데이터와 완전 연동 가능.
2.  **다이내믹 VH 계산**: `buildSectionScrollTimeline`의 이동폭을 뷰포트 변화에 따라 실시간 동적으로 계산하도록 발전 가능.

## 🛡️ 데이터 기반 관리 원칙 (Data-Driven)
- 모든 시각적 수치(색상, 가시성, 크기, 좌표)는 `src/data/home/journey.ts`와 `src/constants/interaction.ts`에서만 관리한다.
- 로직 파일(`GlobalInteractionStage.tsx`)에는 인라인 수치를 직접 작성하지 않는다.

## 🤝 3. 커뮤니케이션 및 실행 프로토콜 (V11 Precision Protocol)

이 프로젝트는 기술적 난도가 높고 뼈대 보호가 중요하므로, 에이전트의 자의적 판단에 의한 '능동적 코드 수정'을 엄격히 제한하며 다음 **V11 3단계 명령 필터링**을 최우선으로 준수한다.

### 🚦 3-1. V11 명령 필터링 논리 게이트 (Logic Gate)
모든 도구(Tool) 호출 전, 사용자 메시지를 다음 기준에 따라 판정한다.

| 항목 | 구분 키워드 | 세부 판정 (Logic) |
| :--- | :--- | :--- |
| **Trigger (실행)** | "진행해", "반영해", "수행해", "구현해" | 메시지에 포함 시 '실행 가능성' 확보 |
| **Blocker (차단)** | "대답해", "설명해", "알려줘", "어때?" | 메시지에 포함 시 즉시 모든 도구 호출 중단 |

### 🛠️ 3-2. 최종 행동 결정 Matrix
- **Trigger(YES) + Blocker(YES)**: **실행 불가.** 질문에 대한 분석 및 답변 후 대기.
- **Trigger(YES) + Blocker(NO)**: **즉시 실행.** 계획된 도구 호출 수행.
- **Trigger(NO)**: **실행 불가.** 답변 및 추가 가이드 후 승인 대기.

### 🏛️ 3-3. 뼈대 보존 및 수동 엔진 경외심
1. **선 기획 후 승인 (Plan-First)**: 모든 코드 수정 작업 전에는 반드시 계획을 먼저 설명하고 사용자에게 알린다.
2. **수동 엔진에 대한 존중**: `#home-stage` 핀 구조, 타임라인 가중치 엔진 등 '안정화된 시스템 근간'은 리팩토링의 대상이 아닌 '존중'의 대상임을 명심한다. (변경 시 극도의 주의 필요)
