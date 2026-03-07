/**
 * NEMO:ON 프로젝트 전역 색상 상수
 */

export const COLORS = {
  // 브랜드 포인트 컬러
  BRAND: {
    TEAL: '#0891b2',      // --accent (ON)
    DEEP_TEAL: '#0e7490', // --sub (ON)
    GOLD: '#e8d5b0',      // --accent (OFF)
    BROWN: '#c4a882',     // --sub (OFF)
  },
  
  // 배경색
  BG: {
    DARK: '#0a0a0a',      // --bg (OFF)
    CREAM: '#faf7f2',     // --bg (ON)
  },
  
  // 텍스트 색상
  TEXT: {
    LIGHT: '#f0ebe3',     // --fg (OFF)
    DARK: '#0d1a1f',      // --fg (ON)
    DIM_DARK: 'rgba(13, 26, 31, 0.25)',
    DIM_LIGHT: 'rgba(240, 235, 227, 0.2)',
  },

  // 특수 효과 색상
  EFFECTS: {
    SCRAMBLE_OFF: 'rgba(240, 235, 227, 0.45)',
    NEMO_HOVER_DIM: 'rgba(240, 235, 227, 0.18)',
    TRI_DIM: 'rgba(196, 168, 130, 0.3)',
  }
} as const;
