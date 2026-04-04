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
  const keywordsTrigger = useRef<ScrollTrigger | null>(null);

  // [V11.34] 유동성 시스템 정밀 동기화: 리사이즈 시 진행률 및 픽셀 위치 보존용 Ref
  const currProgressRef = useRef<number>(0);
  const rawScrollYRef   = useRef<number>(0);
  const isRestoringRef  = useRef<boolean>(false); // [V11.34] 복원 모드 플래그 추가

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
   * (중략)
   */
  useGSAP(() => {
    const logo = logoHandle.current;
    const nemo = nemoHandle.current;
    const falling = fallingRef.current;

    if (!logo?.containerEl || !nemo?.nemoEl || !falling) return;

    const ctx = gsap.context(() => {
      // [V4.1 Strategy] 초기화 시점의 스타일 강제 주입
      initGlobalStyles(isOn, isMobileView);
      
      if (!masterTl.current) {
        initLogoState(logo, isOn, isMobileView);
      }
      initNemoState(nemo);

      if (isScrollable) {
        // [V5.4 Zombie Kill] 새 엔진이 가동되기 직전, 모든 이전 잔재 소거
        ScrollTrigger.getAll().forEach((t) => t.kill());

        if (footerHeight === 0) return;

        // [V4.2 Timing] 레이아웃 확정 대기 (Next Tick)
        rafId.current = requestAnimationFrame(() => {
          const { offsets: L, totalWeight } = calculateLabels();
          const H = SECTION_SCROLL_HEIGHT;
          const vhToPx = (vh: number) => (vh * window.innerHeight) / 100;
          const finalY = vhToPx(H.HERO + H.PAIN + H.MESSAGE + H.FORWHO + H.STORY + H.CTA) + footerHeight;

          // [V11.34] 마스터 타임라인 생성 및 캡처 로직 (onUpdate)
          masterTl.current = gsap.timeline({
            scrollTrigger: {
              trigger: '#home-stage',
              start: 'top top',
              end: () => `+=${finalY}`,
              scrub: TIMING_CFG.SCRUB,
              pin: true,
              pinSpacing: true, 
            },
            defaults: { ease: 'none' },
            // 상시 스냅샷: 리사이즈 0 리셋이 일어나기 전의 마지막 절대 위치를 박제함
            onUpdate: function() {
              const currentProgress = this.progress();
              const currentScrollY = window.scrollY;
              
              if (currentProgress > 0) {
                currProgressRef.current = currentProgress;
              }
              // [V11.34-P2] 리사이즈 리셋 0을 회피하기 위해 0보다 클 때만 스냅샷 갱신
              if (currentScrollY > 0) {
                rawScrollYRef.current = currentScrollY;
              }
            }
          });
          
          const tl = masterTl.current;

          // 마스터 시트 라벨 주입
          Object.entries(L).forEach(([key, time]) => {
            tl.addLabel(key, time);
          });

          // [V11.34-P5] 동기화 가드: 타임라인 빌드 직전에 정답 색상을 :root에 강제 주입
          // GSAP이 브라우저의 불안정한 스타일을 캡처하기 전에 먼저 선수 칩니다.
          initGlobalStyles(isOn, isMobileView);

          // 개별 섹션 빌더 호출
          buildLogoTimeline(tl, logo, isMobileView, isOn, L);
          buildNemoTimeline(tl, nemo, { isMobile: isMobileView, isTabletPortrait }, falling, L, isRestoringRef);
          buildSectionScrollTimeline(tl, L, finalY);
          buildMessageTimeline(tl, nemo, L);
          buildHeroSwapSequence(tl, nemo);

          // [V16.41] 독립형 물리 엔진 제어 트리거
          keywordsTrigger.current = ScrollTrigger.create({
            trigger: '#section-pain', 
            start: 'top bottom',      
            end: 'bottom+=400% top',
            onEnter: () => fallingRef.current?.resumeSimulation(),
            onLeave: () => fallingRef.current?.pauseSimulation(),
            onEnterBack: () => fallingRef.current?.resumeSimulation(),
            onLeaveBack: () => fallingRef.current?.pauseSimulation(),
          });

          // [V11.34 Step 1 최종 보정] 픽셀 스냅샷 기반 강제 복원 (리사이즈 리셋 대응)
          const targetProgress = currProgressRef.current;
          const targetScrollY = rawScrollYRef.current;

          // 1. [좌표 확정] 새 해상도에 맞게 모든 핀 좌표 재계산 (사용자 제안 반영: 복원 전 수행)
          ScrollTrigger.refresh();

          // 2. [강제 복원] 픽셀 좌표를 진행률보다 "먼저" 믿으며, Lenis 엔진을 직접 제어합니다.
          if (targetScrollY > 0 || targetProgress > 0.001) {
            // [V11.34-Step 3] 성벽 강화: 복원 시퀀스 시작 (Double-Lock 가동)
            isRestoringRef.current = true;
            
            if (targetScrollY > 0) {
              window.scrollTo(0, targetScrollY);
              window.lenis?.scrollTo(targetScrollY, { immediate: true });
            } else {
              tl.progress(targetProgress);
            }

            // [V11.34-Step 3] 사용자 지시: refresh() 완료 후에만 성벽 해제 (안성성 확보)
            ScrollTrigger.refresh();
            isRestoringRef.current = false;
          }

          setTimeout(() => {
            setIsTimelineReady(true);
            ScrollTrigger.refresh();
          }, 100);
        });
      }
    });

    return () => {
      // [V11.34] 클린업 브릿지: 타임라인 파괴 직전 최종 위치 박제
      if (masterTl.current) {
        const lastProgress = masterTl.current.progress();
        if (lastProgress > 0) currProgressRef.current = lastProgress;
      }

      if (rafId.current) cancelAnimationFrame(rafId.current);

      const wrapper = document.getElementById('sections-content-wrapper');
      if (wrapper) {
        wrapper.style.position = '';
        wrapper.style.top = '';
        wrapper.style.left = '';
        wrapper.style.width = '';
        wrapper.style.transform = '';
      }

      ctx.revert();
      gsap.set('#home-stage', { clearProps: 'transform,position' });

      if (masterTl.current) {
        masterTl.current.scrollTrigger?.kill();
        masterTl.current.kill();
        masterTl.current = null;
      }

      if (keywordsTrigger.current) {
        keywordsTrigger.current.kill();
        keywordsTrigger.current = null;
      }

      // [V11.34 Step 2] 물리 엔진 세이프 리셋: 리사이즈 시 히어로 섹션의 키워드 잔상 즉시 소거
      if (fallingRef.current) {
        fallingRef.current.reset();
      }

      setIsTimelineReady(false);
    };
  }, { dependencies: [isScrollable, isOn, isMobileView, isTabletPortrait, footerHeight] });

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
        <SharedNemo ref={nemoHandle} />
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
        isTabletPortrait={isTabletPortrait} 
      />
    </div>
  );
};

export default GlobalInteractionStage;
