/**
 * [Constants] 서브페이지 전용 스크롤 인터랙션 가중치 상수
 *
 * [설명]
 * - 어바웃 페이지의 오버레이 배율 및 오퍼링스 페이지의 스크롤 범위 등을 한곳에 모아 관리합니다.
 * - 이 상수를 조율하면 각 로직 파일을 수정하지 않고도 페이지 전체 감도를 튜닝할 수 있습니다.
 */

/**
 * About 페이지 스태킹 오버레이 가중치 배율 (scrollMultiplier)
 */
export const ABOUT_SCROLL_MULTIPLIERS = {
  PHILOSOPHY: 3.5,
  MEANING: 3.5,
  PROMISE: 1.8, // 스크롤 낭비 방지를 위해 1.4배로 축소 조정된 값
} as const;

/**
 * Offerings 페이지 스크롤 및 전환 가중치 배율
 */
export const OFFERINGS_SCROLL_MULTIPLIERS = {
  INTRO_TRANSITION_DURATION: 0.8,
  HORIZONTAL_SCROLL_END: 2.5, // 횡이동 가로 스크롤 범위 (window.innerWidth * 2.5)
} as const;
