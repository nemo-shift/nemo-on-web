import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    screens: {
      'tablet-p': '744px',      // Level 2: 태블릿 세로 (사이드메뉴 3/4 덮기 개시)
      'tablet': '992px',        // Level 3-A: 태블릿 가로 / 데스크탑 진입
      'desktop': '1280px',       // Level 3-B: 표준 PC
      'desktop-wide': '1440px',  // Level 3-C: 와이드 데스크탑
      'desktop-cap': '1920px',   // Level 3-D: 맥스 리미트
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
