'use client';

import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { useHeroContext } from '@/context';
import JourneyLogo, { JourneyLogoHandle } from './JourneyLogo';
import SharedNemo, { SharedNemoHandle } from './SharedNemo';
import FallingKeywordsStage, { FallingKeywordsHandle } from './FallingKeywordsStage';
import {
  COLORS,
  STAGES,
  TIMING_CFG,
  INTERACTION_Z_INDEX,
  HEADER_POS,
  SECTION_SCROLL_HEIGHT,
} from '@/constants/interaction';
import { JOURNEY_MASTER_CONFIG } from '@/data/home/journey';
import { GlobalInteractionStageProps } from './types';
import { LOGO_JOURNEY_SECTIONS, NEMO_JOURNEY_SECTIONS } from './journey-data';
import { calculateLabels, initGlobalStyles, initLogoState, initNemoState } from './utils';
import { buildHeroSwapSequence, buildLogoTimeline, buildMessageTimeline, buildNemoTimeline, buildSectionScrollTimeline } from './builders';

gsap.registerPlugin(ScrollTrigger);


export const GlobalInteractionStage = ({
  isMobile,
  isTablet,
  interactionMode,
  isMobileView,
  isTabletPortrait,
  isOn,
  isTransitioning,
}: GlobalInteractionStageProps) => {
  const { isScrollable, isTimelineReady, footerHeight, setIsTimelineReady } = useHeroContext();

  const containerRef = useRef<HTMLDivElement>(null);
  const logoHandle   = useRef<JourneyLogoHandle>(null);
  const nemoHandle   = useRef<SharedNemoHandle>(null);
  const fallingRef   = useRef<FallingKeywordsHandle>(null);
  const masterTl     = useRef<gsap.core.Timeline | null>(null);
  const rafId        = useRef<number | null>(null);
  const keywordsTrigger = useRef<ScrollTrigger | null>(null); // [V16.41] 독립형 트리거

  // [V5.4] 브라우저의 강제 스크롤 복구 방지 (영점 동기화 하드닝)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.history.scrollRestoration = 'manual';
      if (ScrollTrigger.clearScrollMemory) {
        ScrollTrigger.clearScrollMemory('manual');
      }
    }
  }, []);

  useGSAP(() => {
    const logo = logoHandle.current;
    const nemo = nemoHandle.current;
    const falling = fallingRef.current;

    if (!logo?.containerEl || !nemo?.nemoEl || !falling) return;

    const ctx = gsap.context(() => {
      initGlobalStyles(isOn);
      if (!masterTl.current) {
        initLogoState(logo, isOn, isMobileView);
      }
      initNemoState(nemo);

      if (isScrollable) {
        // [V5.4 Zombie Kill] 새 엔진이 가동되기 직전, 모든 이전 잔재(좀비) 소거
        // 사용자 제안 V6 정밀 구조를 반영하여 인트로 이후에 배치
        ScrollTrigger.getAll().forEach((t) => t.kill());

        // [V5.3] 푸터 높이가 측정되기 전에는 타임라인 빌드를 보류하여 영점 오류 방지
        if (footerHeight === 0) return;

        // [V4.2] 타이밍 보호: 브라우저가 레이아웃(스크롤바 생성 등)을 확정할 때까지 한 틱 대기
        rafId.current = requestAnimationFrame(() => {
          masterTl.current = gsap.timeline();
          const { offsets: L, totalWeight } = calculateLabels();
          
          // [V5.3 Fix] 실제 이동 거리(px)를 먼저 계산하여 ScrollTrigger end와 1:1 동기화
          const H = SECTION_SCROLL_HEIGHT;
          const vhToPx = (vh: number) => (vh * window.innerHeight) / 100;
          const finalY = vhToPx(H.HERO + H.PAIN + H.MESSAGE + H.FORWHO + H.STORY + H.CTA) + footerHeight;

          masterTl.current = gsap.timeline({
            scrollTrigger: {
              trigger: '#home-stage',
              start: 'top top',
              // [V5.3 Fix] 이동 거리 == 스크롤 거리 → 잘림/데드스크롤 원천 차단
              end: () => `+=${finalY}`,
              scrub: TIMING_CFG.SCRUB,
              pin: true,
              pinSpacing: true, 
            },
            defaults: { ease: 'none' },
          });
          
          const tl = masterTl.current;

          Object.entries(L).forEach(([key, time]) => {
            tl.addLabel(key, time);
          });

          buildLogoTimeline(tl, logo, isMobileView, L);
          buildNemoTimeline(tl, nemo, { isMobile: isMobileView, isTablet }, falling, L);
          buildSectionScrollTimeline(tl, L, finalY);

          buildMessageTimeline(tl, nemo, L);
          buildHeroSwapSequence(tl, nemo);

          // [V16.41] 독립형 물리 엔진 제어 트리거 (마스터 타임라인과 분리)
          keywordsTrigger.current = ScrollTrigger.create({
            trigger: '#section-pain', 
            start: 'top bottom',      
            end: 'bottom+=400% top',   // [V26.85 Fix] 다음 섹션까지 충분히 가동되도록 범위 확장 (낙하 멈춤 방지)
            onEnter: () => fallingRef.current?.resumeSimulation(),
            onLeave: () => fallingRef.current?.pauseSimulation(),
            onEnterBack: () => fallingRef.current?.resumeSimulation(),
            onLeaveBack: () => fallingRef.current?.pauseSimulation(),
          });

          // 핀 계산 후 좌표 무결성 강제 갱신
          ScrollTrigger.refresh();
          
          // [V5.4] 타임라인 및 레이아웃 준비 완료 신호 전송 (푸터 마스킹 해제용)
          setTimeout(() => {
            setIsTimelineReady(true);
            // [V5.4 Fix] 모바일 등에서 레이아웃 확정 후 최종 좌표 갱신
            ScrollTrigger.refresh();
          }, 100);
        });
      }
    });

    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);

      // [V5.4 Fix] ctx.revert() 전에 스타일을 먼저 초기화하여 레이아웃 무결성 선제적 확보
      const wrapper = document.getElementById('sections-content-wrapper');
      if (wrapper) {
        wrapper.style.position = '';
        wrapper.style.top = '';
        wrapper.style.left = '';
        wrapper.style.width = '';
        wrapper.style.transform = '';
      }

      ctx.revert();

      // [V5.4 Fix] GSAP 표준 방식으로 스타일 초기화 (revert 후에 최종 정리)
      gsap.set('#home-stage', { clearProps: 'transform,position' });

      // [V5.4 Fix] rAF 내부에서 생성된 ScrollTrigger/타임라인은 ctx.revert()에 포착되지 않으므로
      // masterTl.current를 통해 직접 추적하여 명시적으로 제거
      if (masterTl.current) {
        masterTl.current.scrollTrigger?.kill();
        masterTl.current.kill();
        masterTl.current = null;
      }

      // [V16.41] 독립형 트리거 명시적 제거 (좀비 인스턴스 방지)
      if (keywordsTrigger.current) {
        keywordsTrigger.current.kill();
        keywordsTrigger.current = null;
      }

      // [V5.4] 언마운트 또는 초기화 시 준비 상태 리셋
      setIsTimelineReady(false);
    };
  }, { dependencies: [isScrollable, isOn, isMobileView, isTablet, footerHeight] });

  // [V4.2] 레이라우트 무결성 Double-Lock: 
  // 스크롤 해제(overflow hidden 제거) 시 발생하는 레이아웃 시프트를 감지하여 핀 좌표 최종 갱신
  useEffect(() => {
    if (isScrollable) {
      // 브라우저가 스크롤바를 렌더링하고 레이아웃이 완전히 정착될 시간을 벌어줌
      const timer = setTimeout(() => {
        ScrollTrigger.refresh();
      }, 100); 
      return () => clearTimeout(timer);
    }
  }, [isScrollable]);

  return (
    <div ref={containerRef} className="global-interaction-stage fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 10 }}>
      {/* 1. Shared Nemo */}
      <div style={{ zIndex: INTERACTION_Z_INDEX.SHARED_NEMO }}>
        <SharedNemo ref={nemoHandle} isMobile={isMobileView} />
      </div>

      {/* 2. Journey Logo */}
      <div 
        className="absolute origin-top-left cursor-pointer pointer-events-auto" 
        style={{ 
          left: isMobile ? `${HEADER_POS.MOBILE.x}px` : (isTabletPortrait ? `${HEADER_POS.TABLET.x}vw` : `${HEADER_POS.PC.x}vw`), 
          top: isMobile ? `${HEADER_POS.MOBILE.y}px` : (isTabletPortrait ? `${HEADER_POS.TABLET.y}vw` : `${HEADER_POS.PC.y}vw`), 
          zIndex: INTERACTION_Z_INDEX.JOURNEY_LOGO 
        }}
        onClick={() => {
          // [V26.96 Global UX] 물리 엔진 리셋 선행 후 최상단 즉시 이동 (시각적 무결성 확보)
          fallingRef.current?.reset();
          window.lenis?.scrollTo(0, { immediate: true });
        }}
      >
        <JourneyLogo ref={logoHandle} isOn={isOn} progress={0} isTransitioning={isTransitioning} />
      </div>

      {/* 3. Scroll Hint */}
      <div id="pain-scroll-hint" className="fixed bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 opacity-0 pointer-events-none" style={{ zIndex: INTERACTION_Z_INDEX.SCROLL_HINT }}>
        <span className="text-[10px] font-medium tracking-[0.3em] uppercase" style={{ color: `${COLORS.TEXT.LIGHT}99` }}>Scroll</span>
        <div className="w-[1px] h-12 relative overflow-hidden" style={{ background: `linear-gradient(to bottom, ${COLORS.TEXT.LIGHT}CC, transparent)` }}>
          <div className="absolute top-0 left-0 w-full h-1/2 animate-scroll-hint" style={{ backgroundColor: COLORS.TEXT.LIGHT }} />
        </div>
      </div>

      <FallingKeywordsStage 
        ref={fallingRef} 
        containerRef={containerRef} 
        isMobile={isMobile}
        isTablet={isTablet} 
      />
    </div>
  );
};

export default GlobalInteractionStage;
