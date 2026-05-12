import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    screens: {
      'mobile': '480px',        // Level 1: 스마트폰 일반 (높이 제어 등 대응)
      'tablet-p': '744px',      // Level 2: 태블릿 세로 (Full-frame 유지)
      'tablet': '992px',        // Level 3: 태블릿 가로 / 데스크탑 진입 (Peeking 시작)
      'desktop-wide': '1440px',  // Level 4: 와이드 데스크탑 (에디토리얼 그리드 최적화)
      'desktop-cap': '1920px',   // Level 5: 맥스 리미트 (콘텐츠 폭 제한)
    },
    extend: {
      colors: {
        brand: {
          DEFAULT: '#0891b2',
          accent: '#E8734A',
        },
        bg: {
          dark: '#0a0a0a',
          section: '#0D1A1F',
          cream: '#f7f1e9',
        },
        text: {
          light: '#f0ebe3',
          dark: '#0d1a1f',
        },
      },
      fontFamily: {
        suit: ['var(--font-suit)', 'sans-serif'],
        dm: ['var(--font-dm-sans)', 'sans-serif'],
        bebas: ['var(--font-bebas)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
        esamanru: ['var(--font-esamanru)', 'sans-serif'],
        gmarket: ['var(--font-gmarket)', 'sans-serif'],
      },
      zIndex: {
        'bg-box': '1',
        'border-box': '10',
        'logo-text': '100',
        'header': '1000',
      },
    },
  },
  plugins: [],
};

export default config;
