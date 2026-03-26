import React from 'react';
import type { Metadata } from 'next';
import {
  Noto_Sans_KR,
  DM_Sans,
  DM_Mono,
  Bebas_Neue,
  IBM_Plex_Sans_KR,
} from 'next/font/google';
import localFont from 'next/font/local';
import './globals.css';
import {
  Header,
  Footer,
  LenisScrollRestoration,
  GlobalScrollTriggerCleanup,
  SmoothScroll,
  MenuSystem,
  GlobalElements,
} from '@/components/layout';
import { PointRingCursor } from '@/components/ui';
import { HeroProvider, DeviceProvider } from '@/context';

const notoSansKR = Noto_Sans_KR({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400'],
  variable: '--font-noto-sans-kr',
});

const ibmPlex = IBM_Plex_Sans_KR({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-ibm-plex',
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

const suit = localFont({
  src: '../../public/fonts/SUIT-Variable.woff2',
  variable: '--font-suit',
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
      className={`${notoSansKR.variable} ${ibmPlex.variable} ${dmSans.variable} ${dmMono.variable} ${bebasNeue.variable} ${suit.variable}`}
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
          <DeviceProvider>
            <HeroProvider>
              <GlobalElements />
              <Header />
              {/* MenuSystem: MenuToggle(모핑 버튼) + SideMenu(패널) 전역 관리 */}
              <MenuSystem />
              <main className="flex-1">{children}</main>
              <Footer />
            </HeroProvider>
          </DeviceProvider>
        </SmoothScroll>
      </body>
    </html>
  );
}
