/**
 * 네모:ON 프로젝트 전역 색상 시스템 (기획서 5-1 반영)
 */

export const COLORS = {
  // 브랜드 포인트 컬러
  BRAND: '#0891b2',      // --brand (틸)
  ACCENT: '#E8734A',     // --accent (오렌지)

  // 배경색
  BG: {
    DARK_HERO: '#0a0a0a',   // --bg-dark (히어로 OFF)
    DARK_SECTION: '#0D1A1F', // 섹션 다크 배경
    CREAM: '#f7f1e9',        // --bg-cream (라이트 배경)
  },

  // 텍스트 색상
  TEXT: {
    LIGHT: '#f0ebe3', // --text-light (크림색 텍스트)
    DARK: '#0d1a1f',  // --text-dark (다크 텍스트)
  },

  // 히어로 전용 (OFF/ON 동적 컬러)
  HERO: {
    OFF: {
      BG: '#0a0a0a',
      TEXT: '#f0ebe3',
      ACCENT: '#e8d5b0',
      SUB_ACCENT: '#c4a882',
      PARTICLE: 'rgba(240, 235, 227, 0.1)',
      SCRAMBLE: 'rgba(240, 235, 227, 0.45)',
    },
    ON: {
      BG: '#faf7f2', // 기획서상 히어로 ON 배경은 라이트 배경보다 약간 더 밝은 크림일 수 있음
      TEXT: '#0d1a1f',
      ACCENT: '#0891b2',
      SUB_ACCENT: '#0e7490',
      PARTICLE: 'rgba(13, 26, 31, 0.1)',
      SCRAMBLE: 'rgba(13, 26, 31, 0.25)',
    }
  }
} as const;
