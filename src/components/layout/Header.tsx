'use client';

import React from 'react';
import Link from 'next/link';
import { NemoIcon } from '@/components/ui';
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
        "fixed top-0 left-0 right-0 bg-transparent pointer-events-none flex items-center transition-all duration-500",
        "px-6 py-5",                          // Mobile (default)
        "tablet-p:px-8 tablet-p:py-6",        // Tablet-Portrait (744px)
        "tablet:px-10 tablet:py-7",           // Tablet (992px)
        "desktop-wide:px-12 desktop-wide:py-8", // Desktop-Wide (1440px)
        "desktop-cap:px-16 desktop-cap:py-10",  // Desktop-Cap (1920px)
        isHome ? 'justify-end' : 'justify-between'
      )}
      style={{ zIndex: INTERACTION_Z_INDEX.HEADER }}
    >
      {/* 좌측: 정적 로고 (홈이 아닐 때만 노출) */}
      {!isHome && (
        <Link
          href="/"
          className="pointer-events-auto no-underline flex items-baseline group gap-1.5 tablet-p:gap-2 tablet:gap-[0.6vw]"
        >
          <span className={cn(
            "font-esamanru font-light transition-all duration-500 text-[#0d1a1f] tracking-tight",
            "text-[20px] tablet-p:text-[24px] tablet:text-[28px] desktop-wide:text-[32px] desktop-cap:text-[36px]"
          )}>
            네모
          </span>
          <NemoIcon 
            className="opacity-90 transition-transform group-hover:scale-110"
            style={{ transform: 'translateY(-0.4vw)' }}
            triangleColor="#0891b2"
            circleColor="#0e7490"
            triangleClassName="animate-nemo-pulse border-l-[clamp(3px,0.25vw,4.5px)] border-r-[clamp(3px,0.25vw,4.5px)] border-b-[clamp(4.5px,0.4vw,6.5px)]"
            circleClassName="animate-nemo-pulse-delay w-[clamp(4.5px,0.4vw,6.5px)] h-[clamp(4.5px,0.4vw,6.5px)] border-[1.2px]"
            gapClassName="gap-[0.15vw]"
          />
          <span className={cn(
            "font-gmarket font-medium transition-all duration-500 text-[#0d1a1f] tracking-tighter",
            "text-[19px] tablet-p:text-[22px] tablet:text-[26px] desktop-wide:text-[30px] desktop-cap:text-[32px]"
          )}>
            ON
          </span>
        </Link>
      )}

      {/* 우측 여백 — 햄버거 버튼 위치는 MenuToggle(fixed)이 차지 */}
    </header>
  );
}
