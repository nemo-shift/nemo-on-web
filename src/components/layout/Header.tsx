'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { NemoIcon } from '@/components/ui';
import { usePathname } from 'next/navigation';
import { useHeroContext } from '@/context';
import { COLORS } from '@/constants/colors';
import { NAV_LINKS } from '@/data/nav';
import HeroToggle from '@/components/sections/home/hero/HeroToggle';
import { INTERACTION_Z_INDEX } from '@/constants/interaction';

/**
 * Header 컴포넌트 [V5.3 Path-aware Header]
 *
 * - 홈(/): 로고 숨김 (JourneyLogo가 담당), 햄버거만 노출
 * - 기타 페이지: 정적 로고(네모△/○ON) + 햄버거 노출
 */
export default function Header(): React.ReactElement {
  const { isOn, toggle, isTransitioning, isScrollable } = useHeroContext();
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === '/';

  // [v26.00] 적응형 컬러 시스템 연동 (--header-fg)
  const lineColor = isHome ? 'var(--header-fg)' : '#0d1a1f'; // 홈이 아니면 기본 다크 색상

  // 메뉴 오픈 시 스크롤 잠금
  React.useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  return (
    <>
      <header 
        className={`fixed top-0 left-0 right-0 bg-transparent pointer-events-none flex items-center px-6 py-5 md:px-12 md:py-8 ${isHome ? 'justify-end' : 'justify-between'}`}
        style={{ zIndex: INTERACTION_Z_INDEX.HEADER }}
      >
        {/* 1. 좌측: 정적 로고 (홈이 아닐 때만 노출) */}
        {!isHome && (
          <Link
            href="/"
            className="pointer-events-auto no-underline flex items-baseline gap-1.5 md:gap-2 group"
          >
            <span className="font-esamanru font-light text-[clamp(20px,2vw,26px)] md:text-[clamp(24px,1.8vw,32px)] tracking-tight text-[#0d1a1f]">
              네모
            </span>
            <NemoIcon 
              className="opacity-90 transition-transform group-hover:scale-110"
              style={{ transform: 'translateY(-0.4vw)' }}
              triangleClassName="border-l-[clamp(3px,0.25vw,4.5px)] border-r-[clamp(3px,0.25vw,4.5px)] border-b-[clamp(4.5px,0.4vw,6.5px)]"
              circleClassName="w-[clamp(4.5px,0.4vw,6.5px)] h-[clamp(4.5px,0.4vw,6.5px)] border-[1.2px]"
              gapClassName="gap-[0.15vw]"
            />
            <span className="font-gmarket font-medium text-[clamp(19px,1.8vw,24px)] md:text-[clamp(22px,1.6vw,30px)] tracking-tighter text-[#0d1a1f]">
              ON
            </span>
          </Link>
        )}

        <div className="flex items-center gap-6 md:gap-10">
          {/* [v26.20] ON 모드 전역 헤더 스위치 제거 (수동 온 전용 아키텍처) */}

          {/* 우측 햄버거 버튼 (홈페이지에서는 ON 모드일 때만 노출) */}
          {(!isHome || isOn) && (
            <button
              type="button"
              aria-label="메뉴 열기"
              onClick={() => setMenuOpen(true)}
              className="pointer-events-auto w-10 h-10 flex flex-col items-center justify-center gap-[6px] bg-transparent border-none cursor-pointer p-0 group"
            >
              <span 
                className="w-[22px] h-[1.5px] transition-all duration-500 group-hover:w-[28px]" 
                style={{ backgroundColor: lineColor }} 
              />
              <span 
                className="w-[18px] h-[1.5px] transition-all duration-500 group-hover:w-[24px]" 
                style={{ backgroundColor: lineColor }} 
              />
            </button>
          )}
        </div>
      </header>

      {/* 전체화면 메뉴 오버레이 */}
      {menuOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="메뉴"
          className="fixed inset-0 bg-[#0a0a0a] flex flex-col p-6 md:p-12 animate-[menuFadeIn_0.4s_ease-out_forwards]"
          style={{ zIndex: INTERACTION_Z_INDEX.MENU }}
        >
          <style>{`
            @keyframes menuFadeIn {
              from { opacity: 0; transform: translateY(-10px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}</style>

          {/* 상단: 로고 + X 버튼 */}
          <div className="flex justify-between items-center mb-16 px-2">
            <Link
              href="/"
              onClick={() => setMenuOpen(false)}
              className="no-underline flex items-baseline gap-2 text-white"
            >
              <span className="font-esamanru font-light text-[clamp(24px,4vw,36px)] md:text-[clamp(32px,3.5vw,48px)] tracking-tight">
                네모
              </span>
              <NemoIcon 
                style={{ transform: 'translateY(-0.8vw)' }}
                triangleClassName="border-l-[clamp(5px,0.4vw,7.5px)] border-r-[clamp(5px,0.4vw,7.5px)] border-b-[clamp(7.5px,0.6vw,11px)]"
                circleClassName="w-[clamp(8px,0.7vw,12px)] h-[clamp(8px,0.7vw,12px)] border-[1.8px]"
                gapClassName="gap-[0.25vw]"
              />
              <span className="font-gmarket font-medium text-[clamp(22px,3.5vw,32px)] md:text-[clamp(30px,3.2vw,44px)] tracking-tighter">
                ON
              </span>
            </Link>

            <button
              type="button"
              aria-label="메뉴 닫기"
              onClick={() => setMenuOpen(false)}
              className="w-12 h-12 flex items-center justify-center bg-transparent border-none cursor-pointer text-white/80 text-4xl font-light hover:text-white transition-colors"
            >
              ×
            </button>
          </div>

          {/* 네비게이션 링크 */}
          <nav className="flex-1 flex flex-col justify-center gap-10 md:gap-14 pl-4">
            {NAV_LINKS.map((link, i) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="group flex items-center gap-4 no-underline"
              >
                <span className="text-white/20 text-sm font-mono mt-2 group-hover:text-[#0891b2] transition-colors">0{i+1}</span>
                <span className="font-suit text-[28px] md:text-[48px] font-bold tracking-tight text-white/90 uppercase transition-all duration-300 group-hover:translate-x-4 group-hover:text-white">
                  {link.label}
                </span>
              </Link>
            ))}
          </nav>
        </div>
      )}
    </>
  );
}
