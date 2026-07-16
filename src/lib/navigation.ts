/**
 * [V78] markPushNav() 제거됨.
 *
 * 기존: PUSH_NAV sessionStorage 플래그로 "명시적 이동" 표시 → LenisScrollRestoration이 감지
 * 변경: popstate 기반으로 전환 — "뒤로가기/앞으로가기일 때만 복원, 그 외 모든 이동은 top:0"
 *
 * 이 파일은 다른 곳에서 import 경로로 참조될 수 있으므로 삭제하지 않고 빈 모듈로 유지.
 */
