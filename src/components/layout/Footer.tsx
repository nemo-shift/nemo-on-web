'use client';

import React, { useRef, useEffect } from 'react';
import { useHeroContext } from '@/context';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { COLORS } from '@/constants/colors';
import { NemoIcon } from '@/components/ui';

/**
 * Footer 컴포넌트 [V5.2 Reveal Pattern]
 * - 기획서 3단 레이아웃 구현
 * - Fixed 하단 고정 (z-index: -1)
 */
export default function Footer(): React.ReactElement {
  const { setFooterHeight, isTimelineReady } = useHeroContext();
  const footerRef = useRef<HTMLElement>(null);
  const currentYear = new Date().getFullYear();
  const pathname = usePathname();
  const isHome = pathname === '/';

  // [V5.3] ResizeObserver를 통한 실제 푸터 높이 감지 및 전역 상태 동기화
  useEffect(() => {
    const element = footerRef.current;
    if (!element) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const height = entry.contentRect.height;
        // Padding/Border를 포함한 실제 높이(offsetHeight)가 필요하므로 
        // 렌더링된 요소의 실제 크기를 취득
        const actualHeight = element.offsetHeight;
        if (actualHeight > 0) {
          setFooterHeight(actualHeight);
        }
      }
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, [setFooterHeight]);

  return (
    <footer 
      ref={footerRef}
      className="fixed bottom-0 left-0 w-full h-[450px] md:h-[600px] flex flex-col justify-between px-6 py-12 md:px-12 md:py-16 text-[#f0ebe3] select-none"
      style={{ 
        backgroundColor: '#0a0a0a', 
        zIndex: -1,
        pointerEvents: 'auto',
        // [V5.4 Fix] 홈페이지 진입 시 타임라인/레이아웃 준비 전 푸터 노출(Flash) 증상 차단
        opacity: isHome && !isTimelineReady ? 0 : 1,
        transition: 'opacity 0.3s'
      }}
    >
      {/* 1. 상단: Get in touch */}
      <div className="flex justify-end pt-4">
        <Link 
          href="/contact"
          data-cursor="contact"
          className="text-lg md:text-xl font-medium tracking-tight hover:opacity-70 transition-opacity"
        >
          Get in touch
        </Link>
      </div>

      {/* 2. 중앙: 네모:ON 빅타이포 (Full-bleed) */}
      <div className="flex-1 flex items-center justify-center pointer-events-none">
        <h2 className="text-[clamp(60px,18vw,200px)] md:text-[clamp(120px,22vw,450px)] font-bold leading-none tracking-tighter whitespace-nowrap overflow-hidden">
          <span className="font-esamanru">네모</span>
          <NemoIcon 
            style={{ transform: 'translateY(-5vw)' }}
            gapClassName="gap-[0.5vw]"
            className="px-[2vw] mb-[2vw]"
            triangleClassName="border-l-[clamp(15px,3vw,60px)] border-r-[clamp(15px,3vw,60px)] border-b-[clamp(22.5px,4.5vw,90px)]"
            triangleStyle={{ transform: 'translateY(-2vw)' }}
            circleClassName="w-[clamp(22.5px,4.5vw,90px)] h-[clamp(22.5px,4.5vw,90px)] border-[0.6vw] -translate-y-[1.2vw] md:translate-y-0"
          />
          <span className="font-gmarket">ON</span>
        </h2>
      </div>

      {/* 3. 하단: 소셜 및 저작권 */}
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-6 mt-auto border-t border-white/10 pt-8">
        <div className="flex items-center gap-6 text-sm font-medium tracking-wide">
          <a 
            href="https://threads.net" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-[#0891b2] transition-colors"
          >
            Threads
          </a>
          <a 
            href="https://instagram.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-[#0891b2] transition-colors"
          >
            Instagram
          </a>
          <span className="w-[1px] h-3 bg-white/20 mx-1 hidden md:block" />
          <Link 
            href="/privacy"
            className="hover:text-[#0891b2] transition-colors"
          >
            개인정보처리방침
          </Link>
        </div>
        
        <p className="text-[11px] md:text-xs text-white/40 font-light tracking-wider">
          © {currentYear} 네모:ON All rights reserved.
        </p>
      </div>
    </footer>
  );
}
