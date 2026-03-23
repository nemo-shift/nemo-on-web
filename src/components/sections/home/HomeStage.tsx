'use client';

import React, { useRef } from 'react';
import { useHeroContext } from '@/context';
import { useDeviceDetection } from '@/hooks/useDeviceDetection';
import HeroSection from './HeroSection';
import { PainSection } from './PainSection';
import { MessageSection } from './MessageSection';
import { ForWhoSection } from './ForWhoSection';
import { BrandStorySection } from './BrandStorySection';
import { CTASection } from './CTASection';
import GlobalInteractionStage from './GlobalInteractionStage';

/**
 * HomeStage 컴포넌트: 전체 페이지의 섹션 스택 관리
 * - GSAP & ScrollTrigger를 활용한 전역 인터랙션은 GlobalInteractionStage에서 총괄합니다.
 */
export default function HomeStage(): React.ReactElement {
  const { isOn, isTransitioning, toggle, footerHeight } = useHeroContext();
  const { isMobile, isTablet } = useDeviceDetection();
  const containerRef = useRef<HTMLDivElement>(null);

  // Note: 기존의 useLogoJourney 및 Framer Motion 스크롤 감시 로직은 
  // Phase 5 아키텍처 전환에 따라 GlobalInteractionStage의 GSAP 타임라인으로 이관됩니다.

  return (
    <main className="relative w-full overflow-x-hidden">
      {/* 0. Global Interaction Layer (Outside pinned area for stable fixed positioning) */}
      <GlobalInteractionStage isMobile={isMobile} isTablet={isTablet} isOn={isOn} isTransitioning={isTransitioning} />
      
      {/* 콘텐츠 영역: 내부 래퍼에 배경색을 주어 푸터를 가림 */}
      <div id="home-stage" ref={containerRef} className="relative w-full">
        {/* 모든 섹션을 포함하는 래퍼: 사용자 제안에 따라 var(--bg)로 '불투명 벽' 형성 */}
        <div 
          id="sections-content-wrapper" 
          className="relative z-[1] w-full"
          style={{ backgroundColor: 'var(--bg)' }}
        >
          {/* 1. Hero Section */}
          <HeroSection id="section-hero" isOn={isOn} onToggle={toggle} />
  
          {/* 2-5. Journey Sections (Always in DOM for ScrollTrigger Stability) */}
          <div className={isOn ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none transition-all duration-700'}>
            <PainSection />
            <MessageSection />
            <ForWhoSection />
            <BrandStorySection />
            <CTASection />
          </div>
        </div>

        {/* [v5.3 Fix] 홈페이지(Pinned) 한정: 물리적 스페이서 대신 GSAP pinSpacing이 공간을 확보하므로 높이를 0으로 격리 */}
        <div className="h-0 pointer-events-none" />
      </div>
    </main>
  );
}
