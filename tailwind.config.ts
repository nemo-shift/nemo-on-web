import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    screens: {
      'tablet-p': '744px',  // 태블릿 세로 (Level 2)
      'tablet': '992px',    // 태블릿 가로/데스크탑 (Level 3-A: Mid)
      'desktop-wide': '1440px', // [v4.7] PC Wide (Level 3-B)
      'desktop-cap': '1920px',  // [v4.7] PC Max Cap (Level 3-C)
      'desktop': '1280px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
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
