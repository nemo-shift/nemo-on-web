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
          primary: '#0891b2',
          accent: '#E8734A',
          dark: '#0B0F12',
        },
        surface: {
          cream: '#f7f1e9',
          dark: '#0a0a0a',
          light: '#faf7f2',
        },
        text: {
          primary: '#0d1a1f',
          muted: 'rgba(10,10,10,0.45)',
          dim: 'rgba(10,10,10,0.2)',
        },
      },
      fontFamily: {
        sans: ['var(--font-noto-sans-kr)', 'sans-serif'],
        mono: ['var(--font-dm-mono)', 'monospace'],
        display: ['var(--font-dm-sans)', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
