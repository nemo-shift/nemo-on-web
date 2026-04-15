'use client';

import React from 'react';
import { useHeroContext } from '@/context';
import { cn } from '@/lib/utils';

interface SubPageLayoutProps {
  children: React.ReactNode;
  className?: string; // 기존 page.tsx의 main 태그 스타일 계승
  bg?: string;        // 배경색 커스텀 (기본값: bg-surface-cream)
}

/**
 * [V5.3] 서브 페이지 공통 레이아웃
 * - 배경색 격리를 통해 fixed 푸터를 가림.
 * - 하단에 footerHeight만큼의 물리적 스페이서를 내장하여 'Native Reveal' 구현.
 * - 홈페이지의 복잡한 GSAP 핀 없이 순수 브라우저 스크롤로만 작동.
 */
export default function SubPageLayout({ 
  children, 
  className = '', 
  bg = 'bg-surface-cream' 
}: SubPageLayoutProps): React.ReactElement {
  const { footerHeight } = useHeroContext();

  return (
    <main className="relative z-[1] w-full">
      {/* 1. 실제 서브 페이지 컨텐츠 (배경색 격리 레이어 + 컨텐츠 스타일 적용) */}
      <div 
        /* 
         * [V11.33] 서브페이지 전역 패딩 정규화
         * - 모든 상세 페이지(About, Contact 등)의 상단 여백 및 좌우 여백을 5축 시스템에 통합
         * - Header 높이와 비례하여 상단 여백(pt)을 기기별로 차등 배분
         */
        className={cn(
          'w-full min-h-screen transition-all duration-500',
          'pt-20 px-6',                          // Mobile
          'tablet-p:pt-24 tablet-p:px-8',        // 744px
          'tablet:pt-28 tablet:px-10',           // 992px
          'desktop-wide:pt-32 desktop-wide:px-12', // 1440px
          'desktop-cap:pt-40 desktop-cap:px-16',  // 1920px
          bg, 
          className
        )}
        style={{ 
          backgroundColor: bg === 'bg-surface-cream' ? 'var(--bg)' : undefined 
        }}
      >
        {children}
      </div>

      {/* 2. 푸터 리빌을 위한 투명 스페이서 (Native Reveal 런웨이) */}
      <div 
        className="relative w-full bg-transparent pointer-events-none" 
        style={{ height: footerHeight || '25vh' }}
      />
    </main>
  );
}
