// Lenis 전역 타입 선언 (단일 소스)
// 순수 전역 스크립트로 작성하여 덮어쓰기 우선순위를 높입니다.

interface Window {
  /** 프로젝트 전역 Lenis 인스턴스 (라이브러리 충돌 방지를 위해 any 허용) */
  lenis: any;
}
