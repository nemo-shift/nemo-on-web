import React from 'react';
import type { Metadata, Viewport } from 'next';
import {
  Noto_Sans_KR,
  DM_Sans,
  DM_Mono,
  Bebas_Neue,
  IBM_Plex_Sans_KR,
  EB_Garamond,
} from 'next/font/google';
import localFont from 'next/font/local';
import './globals.css';

const ebGaramond = EB_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-eb-garamond',
});

import {
  Header,
  Footer,
  FooterRevealSpacer,
  LenisScrollRestoration,
  GlobalScrollTriggerCleanup,
  SmoothScroll,
  MenuSystem,
  GlobalElements,
  KakaoTalkBanner,
} from '@/components/layout';
import { PointRingCursor } from '@/components/ui';
import { HeroProvider, DeviceProvider } from '@/context';

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

// [V69.LaunchReady] STEP 4 — SEO 메타데이터 / OG / sitemap / robots
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://nemo-on.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: '네모:ON — 브랜드를 켜다',
    template: '%s | 네모:ON',
  },
  description: '감성 위에 구조를 더해 당신의 브랜드를 단단하게 만드는 스튜디오',
  openGraph: {
    siteName: '네모:ON',
    locale: 'ko_KR',
    type: 'website',
    images: [
      {
        url: '/nemoon_og.png',
        width: 1200,
        height: 630,
        alt: '네모:ON — 브랜드를 켜다',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
  },
  icons: {
    icon: [
      { url: '/favicon/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/favicon/apple-touch-icon.png',
    other: [
      { rel: 'android-chrome-192x192', url: '/favicon/android-chrome-192x192.png' },
      { rel: 'android-chrome-512x512', url: '/favicon/android-chrome-512x512.png' },
    ],
  },
};

export const viewport: Viewport = {
  colorScheme: 'only light',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.ReactElement {
  return (
    <html
      lang="ko"
      style={{ colorScheme: 'only light' }}
      className={`${ibmPlex.variable} ${dmSans.variable} ${dmMono.variable} ${bebasNeue.variable} ${suit.variable} ${ebGaramond.variable}`}
    >
      <head>
        <link rel="preload" href="/fonts/ESAMANRU%20OTF%20LIGHT.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/GmarketSansMedium.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      </head>
      <body className="antialiased min-h-screen flex flex-col font-suit">
        {/* 폰트 프리워밍 — 로컬 폰트 첫 렌더 지연(FOUT) 방지 */}
        <span
          aria-hidden="true"
          style={{
            position: 'absolute',
            width: 1,
            height: 1,
            overflow: 'hidden',
            opacity: 0,
            pointerEvents: 'none',
          }}
        >
          <span style={{ fontFamily: 'var(--font-esamanru)' }}>가</span>
          <span style={{ fontFamily: 'var(--font-gmarket)' }}>a</span>
        </span>
        {/* [V68.KakaoBanner] 카카오톡 인앱 WebView svh 미지원 대응 — KakaoTalkBanner.tsx 참고 */}
        <KakaoTalkBanner />
        <LenisScrollRestoration />
        <GlobalScrollTriggerCleanup />
        <SmoothScroll
          duration={1.2}
          touchMultiplier={1.3}
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
              <main>{children}</main>
              <FooterRevealSpacer />
              <Footer />
            </HeroProvider>
          </DeviceProvider>
        </SmoothScroll>
      </body>
    </html>
  );
}
