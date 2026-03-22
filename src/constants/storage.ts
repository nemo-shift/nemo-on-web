/**
 * [System] 브라우저 스토리지 키 및 스크롤 복원 타이밍 상수
 */

export const STORAGE_KEYS = {
  /** Lenis 네비게이션 타입 저장 키 (SessionStorage) */
  NAV_TYPE: 'lenis-nav-type',
  /** 페이지별 스크롤 위치 저장 접두사 (SessionStorage) */
  SCROLL_PREFIX: 'scroll-',
  /** 브랜드 진단 섹션 복귀 시나리오 타겟 키 */
  RETURN_TARGET: 'return_target',
};

export const RESTORE_TIMING = {
  /** 일반 뒤로가기 시 복원 지연 시간 (ms) */
  NORMAL: 150,
  /** 직접 페이지 이동 시 영점 조절 지연 시간 (ms) */
  DIRECT: 50,
};
