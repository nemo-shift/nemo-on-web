'use client';

import React, { useRef } from 'react';
import { useHeroContext } from '@/context';
import { useDeviceDetection } from '@/hooks/useDeviceDetection';
import { Footer } from '@/components/layout';
import HeroSection from './HeroSection';
import { PainSection } from './PainSection';
import { MessageSection } from './MessageSection';
import { ForWhoSection } from './ForWhoSection';
import { BrandStorySection } from './BrandStorySection';
import { CTASection } from './CTASection';
import { GlobalInteractionStage } from './GlobalInteractionStage';

/**
 * HomeStage 컴포넌트: 전체 페이지의 섹션 스택 관리
 * - GSAP & ScrollTrigger를 활용한 전역 인터랙션은 GlobalInteractionStage에서 총괄합니다.
 */
export default function HomeStage(): React.ReactElement {
  const { isOn, isTransitioning, toggle } = useHeroContext();
  const { isMobile } = useDeviceDetection();
  const containerRef = useRef<HTMLDivElement>(null);

  // Note: 기존의 useLogoJourney 및 Framer Motion 스크롤 감시 로직은 
  // Phase 5 아키텍처 전환에 따라 GlobalInteractionStage의 GSAP 타임라인으로 이관됩니다.

  return (
    <main className="relative w-full overflow-x-hidden">
      {/* 0. Global Interaction Layer (Outside pinned area for stable fixed positioning) */}
      <GlobalInteractionStage isMobile={isMobile} isOn={isOn} isTransitioning={isTransitioning} />
      
      <div id="home-stage" ref={containerRef} className="w-full">
        {/* 모든 섹션을 포함하는 래퍼 (GlobalInteractionStage에서 y축 이동을 제어) */}
        <div id="sections-content-wrapper" className="w-full">
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
      </div>

      <Footer />
    </main>
  );
}
