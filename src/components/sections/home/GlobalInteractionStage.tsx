'use client';

import React, { useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
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
import { GlobalInteractionStageProps, GlobalBuilderOptions } from './types';
import { calculateLabels, initGlobalStyles, initLogoState, initNemoState } from './global-interaction-utils';
import { JOURNEY_MASTER_CONFIG } from '@/data/home/journey';
import { buildHeroSwapSequence, buildLogoTimeline, buildMessageTimeline, buildNemoTimeline, buildSectionScrollTimeline } from './builders';
import { DEBUG_CONFIG } from '@/constants/debug';
import InteractionDebugger from './InteractionDebugger';

gsap.registerPlugin(ScrollTrigger);


export const GlobalInteractionStage = ({
  isMobile,
  interactionMode,
  isMobileView,
  isTabletPortrait,
  isOn,
  isTransitioning,
  painRef,
  messageRef,
}: GlobalInteractionStageProps) => {
  const { isScrollable, footerHeight, setIsTimelineReady } = useHeroContext();

  const containerRef = useRef<HTMLDivElement>(null);
  const logoHandle   = useRef<JourneyLogoHandle>(null);
  const nemoHandle   = useRef<SharedNemoHandle>(null);
  const fallingRef   = useRef<FallingKeywordsHandle>(null);
  const masterTl     = useRef<gsap.core.Timeline | null>(null);
  const rafId        = useRef<number | null>(null);
  const keywordsTrigger = useRef<ScrollTrigger | null>(null);
  
  // [V11.Separation] 하이드레이션 오류 방지를 위한 마운트 상태 관리
  const [mounted, setMounted] = useState(false);
  const [revision, setRevision] = useState(0); // [V11.6] 홈 복귀 시 엔진 원포인트 기동용 리비전
  useEffect(() => {
    setMounted(true);
    return () => {};
  }, []);

  useEffect(() => {
    if (mounted && isScrollable && !masterTl.current) {
      setRevision(prev => prev + 1);
    }
  }, [mounted]);

  const currProgressRef = useRef<number>(0);
  const rawScrollYRef   = useRef<number>(0);
  const isRestoringRef  = useRef<boolean>(false); 
  const layoutTimerRef  = useRef<ReturnType<typeof setTimeout> | null>(null); 

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.history.scrollRestoration = 'manual';
      if (ScrollTrigger.clearScrollMemory) {
        ScrollTrigger.clearScrollMemory('manual');
      }
    }
  }, []);

  useEffect(() => {
    return () => {};
  }, []);

  useEffect(() => {
    if (isScrollable) {
      const timer = setTimeout(() => {
        ScrollTrigger.refresh();
      }, 100); 
      return () => clearTimeout(timer);
    }
  }, [isScrollable]);

  // [V11.13 Fix] 타임라인 빌드 전, 렌더링 단계에서 전역 스타일을 즉시 동기 주입하여 
  // 포탈 내 로고가 찰나의 순간에도 '--header-fg' 변수를 잃지 않도록 보장합니다.
  if (mounted) {
    initGlobalStyles(isOn, isMobileView);
  }

  useGSAP(() => {
    const logo = logoHandle.current;
    const nemo = nemoHandle.current;
    const falling = fallingRef.current;

    let localTl: gsap.core.Timeline | null = null;
    let localTrigger: ScrollTrigger | null = null;

    const ctx = gsap.context(() => {
      if (!isScrollable || !mounted) return;
      if (!logo?.containerEl || !nemo?.nemoEl || !falling) return;
      
      initGlobalStyles(isOn, isMobileView);
      
      if (!masterTl.current) {
        initLogoState(logo, { isOn, isMobile: isMobileView });
      }
      initNemoState(nemo);
      
      if (isScrollable) {
        if (!isRestoringRef.current) {
          initLogoState(logo, { isOn, isMobile, isTabletPortrait });
          initNemoState(nemo, { isOn, isMobileView, isTabletPortrait });
        }

        rafId.current = requestAnimationFrame(() => ctx.add(() => {
          // [V11.9 Fix] 타임라인 빌드 직전 전역 스타일(색상 변수) 선점 주입
          initGlobalStyles(isOn, isMobileView);

          const { offsets: L, totalWeight } = calculateLabels(interactionMode);
          const H = SECTION_SCROLL_HEIGHT;
          const vhToPx = (vh: number) => (vh * window.innerHeight) / 100;
          const totalHeight = vhToPx(H.HERO + H.PAIN + H.MESSAGE + H.FORWHO + H.STORY + H.CTA) + footerHeight;
          const finalY = totalHeight - window.innerHeight;

          localTl = gsap.timeline({
            scrollTrigger: {
              trigger: '#home-stage',
              start: 'top top',
              end: () => `+=${finalY}`,
              scrub: TIMING_CFG.SCRUB,
              pin: true,
              pinSpacing: true, 
            },
            defaults: { ease: 'none' },
            onUpdate: function() {
              const currentProgress = this.progress();
              const currentScrollY = window.scrollY;
              
              if (currentProgress > 0) {
                currProgressRef.current = currentProgress;
                // [V11.18 Fix] 리사이즈 가드(initGlobalStyles)가 참조할 수 있도록 전역에 진행도 기록
                if (typeof window !== 'undefined') (window as any)._masterTlProgress = currentProgress;
              }
              if (currentScrollY > 0) {
                rawScrollYRef.current = currentScrollY;
              }

              const startRange = L[STAGES.START_TO_PAIN] / totalWeight;
              const endRange   = L[STAGES.TO_FOOTER] / totalWeight;

              if ((currentProgress >= startRange && currentProgress <= endRange) || isRestoringRef.current) {
                const el = nemoHandle.current?.nemoEl;
                if (el) {
                  const rect = el.getBoundingClientRect();
                  const root = document.documentElement;
                  
                  root.style.setProperty('--nemo-t', `${rect.top}px`);
                  root.style.setProperty('--nemo-r', `${window.innerWidth - rect.right}px`);
                  root.style.setProperty('--nemo-b', `${window.innerHeight - rect.bottom}px`);
                  root.style.setProperty('--nemo-l', `${rect.left}px`);
                }
              }
            }
          });
          
          masterTl.current = localTl;
          const tl = localTl;

          Object.entries(L).forEach(([key, time]) => {
            tl.addLabel(key, time);
          });

          const builderOptions: GlobalBuilderOptions = { 
            isMobile, isMobileView, isTabletPortrait, isOn, interactionMode 
          };

          initGlobalStyles(isOn, isMobileView);

          buildLogoTimeline(tl, logo, builderOptions, L);
          buildNemoTimeline(tl, nemo, builderOptions, falling, painRef, L, isRestoringRef);
          buildSectionScrollTimeline(tl, L, finalY, builderOptions);
          buildMessageTimeline(tl, L, { 
            standardGroups: messageRef.current?.getStandardGroups() || [], 
            invertedGroups: messageRef.current?.getInvertedGroups() || [] 
          }, builderOptions);
          buildHeroSwapSequence(tl, nemo, L);

          localTrigger = ScrollTrigger.create({
            trigger: '#section-pain', 
            start: 'top bottom',      
            end: 'bottom+=400% top',
            onEnter: () => fallingRef.current?.resumeSimulation(),
            onLeave: () => fallingRef.current?.pauseSimulation(),
            onEnterBack: () => fallingRef.current?.resumeSimulation(),
            onLeaveBack: () => {
              fallingRef.current?.pauseSimulation();
              fallingRef.current?.reset();
            },
          });
          keywordsTrigger.current = localTrigger;

          const targetProgress = currProgressRef.current;
          const targetScrollY = rawScrollYRef.current;

          ScrollTrigger.refresh();

          if (targetScrollY > 0 || targetProgress > 0.001) {
            isRestoringRef.current = true;
            
            if (targetScrollY > 0) {
              window.scrollTo(0, targetScrollY);
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              if ((window as any).lenis) (window as any).lenis.scrollTo(targetScrollY, { immediate: true });
            } else {
              tl.progress(targetProgress);
            }

            ScrollTrigger.refresh();
            isRestoringRef.current = false;
          }

          layoutTimerRef.current = setTimeout(() => {
            ScrollTrigger.refresh();
            if (isRestoringRef.current) {
              isRestoringRef.current = false;
            }
            // [V11.8 Fix] 타임라인 빌드 및 리프레시 완료 신호 전송
            setIsTimelineReady(true);
          }, 100);
        }));
      }
    });

    return () => {
      // [V11.8 Fix] 엔진 클린업 시 타임라인 준비 상태 리셋 (좀비 상태 방지)
      setIsTimelineReady(false);

      if (masterTl.current) {
        const lastProgress = masterTl.current.progress();
        if (lastProgress > 0) currProgressRef.current = lastProgress;
      }

      if (rafId.current) cancelAnimationFrame(rafId.current);
      if (layoutTimerRef.current) { clearTimeout(layoutTimerRef.current); layoutTimerRef.current = null; }

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

      if (localTl) {
        localTl.scrollTrigger?.kill();
        localTl.kill();
        if (masterTl.current === localTl) {
          masterTl.current = null;
        }
      }

      if (localTrigger) {
        localTrigger.kill();
        if (keywordsTrigger.current === localTrigger) {
          keywordsTrigger.current = null;
        }
      }
    };
  }, { dependencies: [revision, isScrollable, isOn, isMobileView, isTabletPortrait, isMobile, interactionMode, footerHeight], revertOnUpdate: true });

  // [V11.11 Fix] 포탈 내 변수 소실을 차단하기 위해 데이터 시트에서 현재 환경의 색상을 직접 추출합니다.
  const heroCfg = JOURNEY_MASTER_CONFIG[STAGES.HERO];
  const currentEnv = (isOn && heroCfg.on?.env) ? heroCfg.on.env : heroCfg.env;
  const headerFg = currentEnv.fg || '#f0ebe3';

  return (
    <div ref={containerRef} className="global-interaction-stage fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: INTERACTION_Z_INDEX.Z_STAGE_WRAPPER }}>
      <div style={{ zIndex: INTERACTION_Z_INDEX.Z_SHARED_NEMO }}>
        <SharedNemo ref={nemoHandle} />
      </div>

      {/* 2. Journey Logo (Brand Layer: Portal로 최상위 독립) */}
      {mounted && typeof document !== 'undefined' && createPortal(
        <div 
          className="fixed origin-top-left cursor-pointer pointer-events-none" 
          style={{ 
            left: isMobile ? `${HEADER_POS.MOBILE.x}px` : (isTabletPortrait ? `${HEADER_POS.TABLET.x}vw` : `${HEADER_POS.PC.x}vw`), 
            top: isMobile ? `${HEADER_POS.MOBILE.y}px` : (isTabletPortrait ? `${HEADER_POS.TABLET.y}vw` : `${HEADER_POS.PC.y}vw`), 
            zIndex: INTERACTION_Z_INDEX.Z_JOURNEY_LOGO,
            color: 'var(--header-fg)',
            // '--header-fg' 제거: 상위 documentElement의 애니메이션 값을 차단하지 않도록 함
            backgroundColor: 'transparent'
          } as React.CSSProperties}
        >
          <div
            className="pointer-events-none w-max h-max overflow-visible"
            style={{ transform: 'translateZ(0)' }} // 레이아웃 격리 유지
          >
            <JourneyLogo 
              ref={logoHandle} 
              isOn={isOn} 
              progress={0} 
              isTransitioning={isTransitioning}
              onLogoClick={() => {
                // [V26.96 Global UX] 물리 엔진 리셋 선행 후 최상단 즉시 이동 (시각적 무결성 확보)
                fallingRef.current?.reset();
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                if ((window as any).lenis) (window as any).lenis.scrollTo(0, { immediate: true });
              }}
            />
          </div>
        </div>,
        document.body
      )}

      {/* 3. Scroll Hint */}
      <div id="pain-scroll-hint" className="fixed bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 opacity-0 pointer-events-none" style={{ zIndex: INTERACTION_Z_INDEX.Z_UI_GUIDE }}>
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

      {/* // [DEPLOY-DELETE] : 디버그 전용 점프 엔진 도킹 (배포 시 이 한 줄만 삭제하거나 debug.ts에서 OFF) */}
      {DEBUG_CONFIG.USE_DEBUG && <InteractionDebugger masterTl={masterTl.current} />}
    </div>
  );
};

export default GlobalInteractionStage;
