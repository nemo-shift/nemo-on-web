# Nemo:ON Korean Thinking Integrity Rule

이 문서는 에이전트의 사고 과정(Thinking/Reasoning) 및 출력물의 언어 무결성을 유지하기 위한 전역 규칙입니다.

## 🇰🇷 언어 규칙 (Language Integrity)

1.  **사고 과정의 한국어화 (Korean Thinking)**:
    - 에이전트가 내부적으로 단계를 나누고 계획을 세우는 모든 **추론 과정(Thinking/Reasoning Section)**은 반드시 한국어로 작성한다.
    - 시스템 UI 상의 회색 텍스트 영역을 포함하여, 모든 내부 사고 루틴은 한국어를 기본 언어로 채택한다.

2.  **기술 용어의 병기 (Technical Terms)**:
    - 기술적인 개념이나 라이브러리 명칭, 고유 명사 등은 의미의 정확한 전달을 위해 영어(English) 원어를 괄호 안에 병기할 수 있다.
    - 예: "타임라인(Timeline)을 초기화(Initialize)한다."

3.  **출력 무결성 (Output Consistency)**:
    - 사용자에게 전달되는 답변뿐만 아니라, 모든 주석과 문서화(`JSDoc`, `.md` 등) 또한 반드시 한국어로 작성한다.

## 🚀 준수 확인 (Compliance)

- 이 규칙은 모든 에이전트 행동 지침보다 우선순위를 가지며, 에이전트는 매 턴 이 규칙을 실시간으로 로드하여 준수해야 한다.
