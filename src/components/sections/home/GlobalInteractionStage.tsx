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
import { LOGO_JOURNEY_SECTIONS, NEMO_JOURNEY_SECTIONS } from './interaction-journey';
import { calculateLabels, initGlobalStyles, initLogoState, initNemoState } from './global-interaction-utils';
import { buildHeroSwapSequence, buildLogoTimeline, buildMessageTimeline, buildNemoTimeline, buildSectionScrollTimeline } from './builders';

gsap.registerPlugin(ScrollTrigger);


export const GlobalInteractionStage = ({
  isMobile,
  isMidRange,
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

  /**
   * [V11.31 Knowledge Transfer] GlobalInteractionStage
   * 이 컴포넌트는 전체 서비스의 '마스터 타임라인'을 관리하며, 다음과 같은 엄격한 인터랙션을 보장함:
   * 1. 영점 동기화 (Zero-Point Sync): rAF와 ScrollTrigger.refresh()를 조합하여 브라우저 레이아웃 확정 후 좌표를 계산.
   * 2. 좀비 인스턴스 방지 (Zombie Instance Kill): 명시적인 클린업 순서를 통해 이전 타임라인의 잔재를 제거.
   * 3. 마스터 시트(Interaction Journey) 기반의 선형적 시퀀스 제어.
   */
  useGSAP(() => {
    const logo = logoHandle.current;
    const nemo = nemoHandle.current;
    const falling = fallingRef.current;

    if (!logo?.containerEl || !nemo?.nemoEl || !falling) return;

    const ctx = gsap.context(() => {
      // [V4.1 Strategy] 초기화 시점의 스타일 강제 주입 (레이아웃 시프트 방지)
      initGlobalStyles(isOn);
      
      if (!masterTl.current) {
        initLogoState(logo, isOn, isMobileView);
      }
      initNemoState(nemo);

      if (isScrollable) {
        // [V5.4 Zombie Kill] 새 엔진이 가동되기 직전, 모든 이전 잔재(ScrollTrigger 인스턴스) 소거
        // 리액트 스트릭트 모드 또는 빠른 리프레시 상황에서 인스턴스가 겹치는 것을 원천 차단.
        ScrollTrigger.getAll().forEach((t) => t.kill());

        // [V5.3 Priority] 푸터 높이가 측정되기 전에는 타임라인 빌드를 보류하여 '데드 스크롤' 영역 발생 방지.
        if (footerHeight === 0) return;

        // [V4.2 Timing] 중요: 브라우저가 스크롤바 생성 등 레이아웃을 확정할 때까지 한 틱(Next Tick) 대기 필수.
        // 이를 누락하면 모바일/태블릿에서 핀(Pin) 좌표가 억 단위(28,815px 등)로 튀는 버그 발생 가능.
        rafId.current = requestAnimationFrame(() => {
          masterTl.current = gsap.timeline();
          const { offsets: L, totalWeight } = calculateLabels();
          
          // [V5.3 Fix] 섹션별 고정 VH 높이를 픽셀로 환산하여 ScrollTrigger end 값과 1:1 동기화.
          const H = SECTION_SCROLL_HEIGHT;
          const vhToPx = (vh: number) => (vh * window.innerHeight) / 100;
          const finalY = vhToPx(H.HERO + H.PAIN + H.MESSAGE + H.FORWHO + H.STORY + H.CTA) + footerHeight;

          // 마스터 타임라인 생성 및 핀(Pin) 설정
          masterTl.current = gsap.timeline({
            scrollTrigger: {
              trigger: '#home-stage',
              start: 'top top',
              // [V5.3 Fix] 이동 거리 == 스크롤 거리 관계를 유지하여 '무한 스크롤' 또는 '조기 종료' 현상 차단.
              end: () => `+=${finalY}`,
              scrub: TIMING_CFG.SCRUB,
              pin: true,
              pinSpacing: true, 
            },
            defaults: { ease: 'none' },
          });
          
          const tl = masterTl.current;

          // 마스터 시트에서 계산된 오프셋 라벨 주입
          Object.entries(L).forEach(([key, time]) => {
            tl.addLabel(key, time);
          });

          // 개별 섹션 빌더 호출 (로고, 네모, 섹션 스크롤 등)
          buildLogoTimeline(tl, logo, isMobileView, L);
          buildNemoTimeline(tl, nemo, { isMobile: isMobileView, isMidRange }, falling, L);
          buildSectionScrollTimeline(tl, L, finalY);

          buildMessageTimeline(tl, nemo, L);
          buildHeroSwapSequence(tl, nemo);

          // [V16.41] 독립형 물리 엔진 제어 트리거: 뷰포트 내(OnEnter)에서만 물리 시뮬레이션 가동하여 GPU 부하 절감.
          keywordsTrigger.current = ScrollTrigger.create({
            trigger: '#section-pain', 
            start: 'top bottom',      
            end: 'bottom+=400% top',
            onEnter: () => fallingRef.current?.resumeSimulation(),
            onLeave: () => fallingRef.current?.pauseSimulation(),
            onEnterBack: () => fallingRef.current?.resumeSimulation(),
            onLeaveBack: () => fallingRef.current?.pauseSimulation(),
          });

          // 핀(Pin) 계산 후 좌표 무결성 강제 갱신 (Double-Lock 기법)
          ScrollTrigger.refresh();
          
          // [V5.4 Stability] 모든 레이아웃 준비 완료 후 푸터 마스킹 해제 신호 전송
          setTimeout(() => {
            setIsTimelineReady(true);
            ScrollTrigger.refresh();
          }, 100);
        });
      }
    });

    return () => {
      // [V4.2 Cleanup] 마운트 해제 시 비동기 작업(rAF) 및 GSAP 컨텍스트 강제 초기화
      if (rafId.current) cancelAnimationFrame(rafId.current);

      // [V5.4 Finalizer] ctx.revert() 전에 스타일을 먼저 초기화하여 레이아웃 붕괴 방지.
      const wrapper = document.getElementById('sections-content-wrapper');
      if (wrapper) {
        wrapper.style.position = '';
        wrapper.style.top = '';
        wrapper.style.left = '';
        wrapper.style.width = '';
        wrapper.style.transform = '';
      }

      ctx.revert();

      // [V5.4 Finalizer] GSAP 표준 방식으로 스타일 초기화 (revert 후에 최종 정리)
      gsap.set('#home-stage', { clearProps: 'transform,position' });

      // [V5.4 Zombie Defense] rAF 내부에서 생성된 인스턴스는 명시적으로 제거해야 함.
      if (masterTl.current) {
        masterTl.current.scrollTrigger?.kill();
        masterTl.current.kill();
        masterTl.current = null;
      }

      if (keywordsTrigger.current) {
        keywordsTrigger.current.kill();
        keywordsTrigger.current = null;
      }

      setIsTimelineReady(false);
    };
  }, { dependencies: [isScrollable, isOn, isMobileView, isMidRange, footerHeight] });

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
        isMidRange={isMidRange} 
      />
    </div>
  );
};

export default GlobalInteractionStage;
