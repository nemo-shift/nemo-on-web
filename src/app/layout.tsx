import React from 'react';
import type { Metadata } from 'next';
import {
  Noto_Sans_KR,
  DM_Sans,
  DM_Mono,
  Bebas_Neue,
} from 'next/font/google';
import './globals.css';
import {
  Header,
  LenisScrollRestoration,
  GlobalScrollTriggerCleanup,
  SmoothScroll,
} from '@/components/layout';
import { HeroProvider } from '@/context';

const notoSansKR = Noto_Sans_KR({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400'],
  variable: '--font-noto-sans-kr',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['200', '300', '400'],
  variable: '--font-dm-sans',
});

const dmMono = DM_Mono({
  subsets: ['latin'],
  weight: ['300', '400'],
  variable: '--font-dm-mono',
});

const bebasNeue = Bebas_Neue({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-bebas',
});

export const metadata: Metadata = {
  title: '네모ON',
  description: '불안을 끄고, 기준을 켭니다 — 네모:ON 공식 웹사이트',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.ReactElement {
  return (
    <html
      lang="ko"
      className={`${notoSansKR.variable} ${dmSans.variable} ${dmMono.variable} ${bebasNeue.variable}`}
    >
      <body className="antialiased min-h-screen flex flex-col font-sans">
        <LenisScrollRestoration />
        <GlobalScrollTriggerCleanup />
        <SmoothScroll
          duration={1.2}
          touchMultiplier={2}
          smoothWheel={true}
          smoothTouch={true}
          integrateGSAP={true}
          className="flex-1 flex flex-col"
        >
          <HeroProvider>
            <Header />
            <main className="flex-1">{children}</main>
          </HeroProvider>
        </SmoothScroll>
      </body>
    </html>
  );
}
