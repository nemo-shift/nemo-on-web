'use client';

import React from 'react';
import Link from 'next/link';
import { NemoIcon } from '@/components/ui';
import { usePathname } from 'next/navigation';
import { INTERACTION_Z_INDEX } from '@/constants/interaction';

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
      className={`fixed top-0 left-0 right-0 bg-transparent pointer-events-none flex items-center px-6 py-5 tablet:px-[clamp(32px,3.3vw,56px)] tablet:py-[clamp(24px,2.5vw,40px)] ${isHome ? 'justify-end' : 'justify-between'}`}
      style={{ zIndex: INTERACTION_Z_INDEX.HEADER }}
    >
      {/* 좌측: 정적 로고 (홈이 아닐 때만 노출) */}
      {!isHome && (
        <Link
          href="/"
          className="pointer-events-auto no-underline flex items-baseline gap-1.5 tablet:gap-[0.6vw] group"
        >
          <span className="font-esamanru font-light text-[clamp(20px,2vw,26px)] tablet:text-[clamp(24px,2.2vw,36px)] tracking-tight text-[#0d1a1f]">
            네모
          </span>
          <NemoIcon 
            className="opacity-90 transition-transform group-hover:scale-110"
            style={{ transform: 'translateY(-0.4vw)' }}
            triangleClassName="border-l-[clamp(3px,0.25vw,4.5px)] border-r-[clamp(3px,0.25vw,4.5px)] border-b-[clamp(4.5px,0.4vw,6.5px)]"
            circleClassName="w-[clamp(4.5px,0.4vw,6.5px)] h-[clamp(4.5px,0.4vw,6.5px)] border-[1.2px]"
            gapClassName="gap-[0.15vw]"
          />
          <span className="font-gmarket font-medium text-[clamp(19px,1.8vw,24px)] tablet:text-[clamp(22px,2vw,32px)] tracking-tighter text-[#0d1a1f]">
            ON
          </span>
        </Link>
      )}

      {/* 우측 여백 — 햄버거 버튼 위치는 MenuToggle(fixed)이 차지 */}
    </header>
  );
}
