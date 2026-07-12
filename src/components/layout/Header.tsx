'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { INTERACTION_Z_INDEX } from '@/constants/interaction';
import { cn } from '@/lib/utils';

/**
 * Header 컴포넌트 [V13.0 MenuToggle 분리]
 *
 * - 홈(/): 로고 숨김 (JourneyLogo가 담당)
 * - 기타 페이지: 정적 로고(네모△/○ON) 노출
 * - 햄버거 버튼: MenuToggle(독립형)으로 분리 → 이 컴포넌트에서 완전 제거
 */
export default function Header(): React.ReactElement {
  const pathname = usePathname();
  const isHome = pathname === '/';

  return (
    <header 
      /* 
       * [V11.33] 5단계 전역 반응형 표준 패딩 적용 (5-Axis Responsive Standard)
       * - 모바일(px-6)부터 데스크탑 캡(px-16)까지 시각적 최적 비례에 맞춰 증분
       * - transition-all duration-500을 통해 브라우저 리사이징 시 부드러운 여백 전환 제공
       */
      className={cn(
        'fixed top-0 left-0 right-0 bg-transparent pointer-events-none flex items-center transition-all duration-500',
        'px-6 py-5',                          // Mobile (default)
        'tablet-p:px-8 tablet-p:py-6',        // Tablet-Portrait (744px)
        'tablet:px-10 tablet:py-7',           // Tablet (992px)
        'desktop-wide:px-12 desktop-wide:py-8', // Desktop-Wide (1440px)
        'desktop-cap:px-16 desktop-cap:py-10',  // Desktop-Cap (1920px)
        isHome ? 'justify-end' : 'justify-between'
      )}
      style={{ zIndex: INTERACTION_Z_INDEX.Z_HEADER }}
    >
      {/* 좌측: 정적 로고 (홈이 아닐 때만 노출) */}
      {!isHome && (
        <Link
          href="/"
          className="pointer-events-auto no-underline translate-y-[0px] tablet-p:translate-y-[2px] tablet:translate-y-[4px]"
        >
          <span className={cn(
            'font-syne transition-all duration-500 text-[#0d1a1f] tracking-normal font-[350] tablet-p:font-[450]',
            'text-[26px] tablet-p:text-[38px] tablet:text-[48px] desktop-wide:text-[50px] desktop-cap:text-[56px]'
          )}>
            nemo<span style={{ fontSize: '0.75em', display: 'inline-block', transform: 'translateY(-0.08em)' }}>:</span>on
          </span>
        </Link>
      )}

      {/* 우측 여백 — 햄버거 버튼 위치는 MenuToggle(fixed)이 차지 */}
    </header>
  );
}
