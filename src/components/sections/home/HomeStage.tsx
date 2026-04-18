'use client';

import React, { useRef } from 'react';
import { useHeroContext, useDevice } from '@/context';
import HeroSection from './hero/HeroSection';
import { PainSection, PainSectionHandle } from './pain/PainSection';
import { MessageSection, MessageSectionHandle } from './message/MessageSection';
import { ForWhoSection, ForWhoSectionHandle } from './forwho/ForWhoSection';
import { BrandStorySection } from './story/BrandStorySection';
import { CTASection } from './cta/CTASection';
import { Footer } from '@/components/layout';
import GlobalInteractionStage from './GlobalInteractionStage';
import { INTERACTION_Z_INDEX } from '@/constants/interaction';

/**
 * HomeStage 컴포넌트: 전체 페이지의 섹션 스택 관리
 * - GSAP & ScrollTrigger를 활용한 전역 인터랙션은 GlobalInteractionStage에서 총괄합니다.
 */
export default function HomeStage(): React.ReactElement {
  const { isOn, isTransitioning, toggle, footerHeight } = useHeroContext();
  const { isMobile, interactionMode, isMobileView, isTabletPortrait } = useDevice();
  const containerRef = useRef<HTMLDivElement>(null);
  
  // [V11.55] 각 섹션 내부 엘리먼트 제어를 위한 Ref 핸들
  const painRef = useRef<PainSectionHandle>(null);
  const messageRef = useRef<MessageSectionHandle>(null);
  const forwhoRef = useRef<ForWhoSectionHandle>(null);
  const sectionsContentRef = useRef<HTMLDivElement>(null);

  // Note: 기존의 useLogoJourney 및 Framer Motion 스크롤 감시 로직은 
  // Phase 5 아키텍처 전환에 따라 GlobalInteractionStage의 GSAP 타임라인으로 이관됩니다.
  // [v16.3] 'isScrollable'은 HeroContext에서 전역 관리됩니다.

  return (
    <main className="relative w-full overflow-x-hidden" style={{ backgroundColor: 'var(--bg)' }}>
      {/* 0. Global Interaction Layer (Outside pinned area for stable fixed positioning) */}
      <GlobalInteractionStage 
        isMobile={isMobile} 
        interactionMode={interactionMode}
        isMobileView={isMobileView}
        isTabletPortrait={isTabletPortrait}
        isOn={isOn} 
        isTransitioning={isTransitioning} 
        painRef={painRef}
        messageRef={messageRef}
        forwhoRef={forwhoRef}
        sectionsContentRef={sectionsContentRef}
      />
      
      {/* 콘텐츠 영역: Z_CONTENT(100)로 GlobalInteractionStage(Z_STAGE_WRAPPER:50)보다 상위 쌓임 맥락 확보 */}
      <div id="home-stage" ref={containerRef} className="relative w-full" style={{ zIndex: INTERACTION_Z_INDEX.Z_CONTENT }}>
        {/* 모든 섹션을 포함하는 래퍼: 섹션 이동 및 배경색 전환을 위한 핵심 ID(sections-content-wrapper) 탑재 */}
        <div 
          id="sections-content-wrapper"
          ref={sectionsContentRef}
          className="relative w-full"
          style={{ zIndex: INTERACTION_Z_INDEX.Z_CONTENT }}
        >
          {/* 1. Hero Section */}
          <HeroSection id="section-hero" isOn={isOn} onToggle={toggle} />
  
          {/* 2-5. Journey Sections (Always in DOM for ScrollTrigger Stability) */}
          <div className={isOn ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none transition-all duration-700'}>
            <PainSection ref={painRef} interactionMode={interactionMode} />
            <MessageSection ref={messageRef} />
            <ForWhoSection ref={forwhoRef} />
            <BrandStorySection />
            <CTASection />
            <Footer isHomeStage={true} />
          </div>
        </div>

        {/* [v5.3 Fix] 홈페이지(Pinned) 한정: 물리적 스페이서 대신 GSAP pinSpacing이 공간을 확보하므로 높이를 0으로 격리 */}
        <div className="h-0 pointer-events-none" />
      </div>
    </main>
  );
}
