/**
 * 히어로 섹션 관련 설정값 (기획서 13항 반영)
 */

export const HERO_TIMERS = {
  SCROLL_LOCK_DURATION: 4000, // 스크롤 트리거 잠금 (4초)
  AUTO_ON_DELAY: 7000,        // 자동 ON 전환 (7초)
} as const;

export const HERO_SCRAMBLE_CHARS = '!<>-_\\/[]{}—=+*^?#_~';

export const HERO_TIMING = {
  SEQUENCE_INITIAL_DELAY: 800,
  SEQUENCE_STEP_1_DELAY: 800,
  SEQUENCE_STEP_DEFAULT_DELAY: 800,
  SCRAMBLE_START_DELAY: 0,
  SCRAMBLE_INTERVAL: 35,
  WIPE_TRANSITION_DELAY: 1200,
  MOBILE_INTERACTION_RESET: 1500,
};
