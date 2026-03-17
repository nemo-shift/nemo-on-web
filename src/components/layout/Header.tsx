'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useHeroContext } from '@/context';
import { COLORS } from '@/constants/colors';
import { NAV_LINKS } from '@/data/nav';
import HeroToggle from '@/components/sections/home/hero/HeroToggle';

/**
 * Header 컴포넌트
 *
 * position: fixed, 투명 배경
 * - 우측: 햄버거 버튼만 담당
 * - 좌측 로고는 GlobalInteractionStage에서 Single Source로 관리됩니다.
 */
export default function Header(): React.ReactElement {
  const { isOn, toggle, isTransitioning } = useHeroContext();
  const [menuOpen, setMenuOpen] = useState(false);

  // [v26.00] 적응형 컬러 시스템 연동 (--header-fg)
  // GlobalInteractionStage에서 배경색에 맞춰 이 변수를 업데이트함
  const lineColor = 'var(--header-fg)';

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
      <header className="fixed top-0 left-0 right-0 z-[10000] bg-transparent pointer-events-none flex items-center justify-end px-6 py-5 md:px-12 md:py-8 gap-6 md:gap-10">
        {/* [v26.20] ON 모드 전용 헤더 스위치 */}
        {isOn && !menuOpen && (
          <div className="pointer-events-auto mt-[-20px] scale-[0.85] md:scale-100 origin-right">
            <HeroToggle 
              isOn={isOn} 
              onToggle={toggle} 
              isTransitioning={isTransitioning} 
            />
          </div>
        )}

        {/* 우측 햄버거 버튼 */}
        <button
          type="button"
          aria-label="메뉴 열기"
          onClick={() => setMenuOpen(true)}
          className="pointer-events-auto w-10 h-10 flex flex-col items-center justify-center gap-[6px] bg-transparent border-none cursor-pointer p-0"
        >
          <span className="w-[22px] h-[1.5px] transition-colors duration-700" style={{ backgroundColor: lineColor }} />
          <span className="w-[22px] h-[1.5px] transition-colors duration-700" style={{ backgroundColor: lineColor }} />
        </button>
      </header>

      {/* 전체화면 메뉴 오버레이 */}
      {menuOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="메뉴"
          className="fixed inset-0 z-[9100] bg-bg-dark flex flex-col p-6 md:p-12 animate-[menuFadeIn_0.3s_ease_forwards]"
        >
          <style>{`
            @keyframes menuFadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
          `}</style>

          {/* 상단: 로고 + X 버튼 */}
          <div className="flex justify-between items-center mb-16">
            <Link
              href="/"
              onClick={() => setMenuOpen(false)}
              className="no-underline flex items-center text-text-light"
            >
              <span className="font-esamanru text-[18px] md:text-[28px] tracking-[0.14em]">
                네모
              </span>
              <span className="relative inline-flex flex-col items-center gap-[3px] mx-[5px]">
                <span
                  className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-b-[9px]"
                  style={{ borderBottomColor: COLORS.BRAND }}
                />
                <span className="w-2 h-2 rounded-full border border-hero-off-sub transition-colors bg-transparent" />
              </span>
              <span className="font-gmarket text-[18px] md:text-[28px] tracking-[0.14em]">
                ON
              </span>
            </Link>

            <button
              type="button"
              aria-label="메뉴 닫기"
              onClick={() => setMenuOpen(false)}
              className="w-10 h-10 flex items-center justify-center bg-transparent border-none cursor-pointer text-text-light text-3xl font-light"
            >
              ×
            </button>
          </div>

          {/* 네비게이션 링크 */}
          <nav className="flex-1 flex flex-col gap-8 pl-2">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="font-suit text-[22px] md:text-[32px] font-bold tracking-[0.05em] text-text-light no-underline uppercase transition-all duration-300 hover:pl-4 hover:text-brand"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </>
  );
}
