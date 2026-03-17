import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
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
