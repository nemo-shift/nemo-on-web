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
  INTERACTION_Z_INDEX,
} from '@/constants/interaction';
import { GlobalInteractionStageProps, GlobalBuilderOptions } from './types';
import { calculateLabels, initGlobalStyles, initLogoState, initNemoState, syncNemoCoordinates } from './global-interaction-utils';
import { INTERACTION_REGISTRY } from './interaction-registry';
import { buildHeroSwapSequence, buildForWhoTimeline, buildLogoTimeline, buildMessageTimeline, buildNemoTimeline, buildSectionScrollTimeline, buildWarmupTimeline, buildCoreFunnelTimeline } from './builders';
import { CORE_FUNNEL_TITLE, MESSAGE_COLORS } from '@/data/home/message';
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
  forwhoRef,
  sectionsContentRef,
}: GlobalInteractionStageProps) => {
  const { isScrollable, footerHeight, setIsTimelineReady, toggle } = useHeroContext();


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
    const isRestoring = (currProgressRef.current || 0) > 0.001;
    initGlobalStyles(INTERACTION_REGISTRY, isOn, isMobileView, currProgressRef.current, isRestoring);
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
      
      rafId.current = requestAnimationFrame(() => ctx.add(() => {
          // [V43] 측정 전 레이아웃을 강제로 리프레시하여 요동치는 좌표(-795px 등)를 고정시킵니다.
          ScrollTrigger.refresh();

          // [V43] 리사이즈 복구 여부를 전역 플래그(isRestoringRef)로부터 확실히 전달받습니다.
          const isRestoringNow = isRestoringRef.current;
          
          // [V42] 레이아웃이 확정된 RAF 시점에서 단 한 번, 정밀하게 초기 상태를 측정하고 주입합니다.
          initGlobalStyles(INTERACTION_REGISTRY, isOn, isMobileView, currProgressRef.current, isRestoringNow);
          initLogoState(INTERACTION_REGISTRY, logo, { isOn, isMobile, isTabletPortrait, progress: currProgressRef.current });
          const measuredPos = initNemoState(INTERACTION_REGISTRY, nemo, { isOn, isMobileView, isTabletPortrait, progress: currProgressRef.current, isRestoring: isRestoringNow });

          const { offsets: L, totalWeight } = calculateLabels(INTERACTION_REGISTRY, interactionMode);
          const { 
            SECTION_SCROLL_HEIGHT: H, 
            TIMING_CFG, 
            STAGES, 
          } = INTERACTION_REGISTRY.constants;
          
          const vhToPx = (vh: number) => (vh * window.innerHeight) / 100;
          
          // [V18.Audit] 전체 섹션의 vh 합산 + 푸터 높이 - 현재 뷰포트 (총 가용 스크롤 범위)
          const sectionHeights = H.HERO + H.PAIN + H.MESSAGE + H.FORWHO + H.STORY + H.CTA;
          const totalHeight = vhToPx(sectionHeights) + footerHeight;
          const finalY = totalHeight - window.innerHeight;

          localTl = gsap.timeline({
            defaults: { ease: 'none' },
            onUpdate: function() {
              const currentProgress = this.progress();
              if (currentProgress > 0) {
                currProgressRef.current = currentProgress;
              }
              const currentScrollY = window.scrollY;
              if (currentScrollY > 0) {
                rawScrollYRef.current = currentScrollY;
              }


              const startRange = L[STAGES.START_TO_PAIN] / totalWeight;
              const endRange   = L[STAGES.TO_FOOTER] / totalWeight;

              if ((currentProgress >= startRange && currentProgress <= endRange) || isRestoringRef.current) {
                syncNemoCoordinates(nemoHandle.current?.nemoEl || null);
              }
            }
          });
          
          masterTl.current = localTl;
          const tl = localTl;

          Object.entries(L).forEach(([key, time]) => {
            tl.addLabel(key, time);
          });

          const builderOptions: GlobalBuilderOptions = { 
            isMobile, 
            isMobileView, 
            isTabletPortrait, 
            isOn, 
            interactionMode,
            registry: INTERACTION_REGISTRY,
            // [V43] 실측된 동적 영점 데이터를 빌더들에게 보급합니다.
            initialNemoPos: measuredPos || undefined
          };


          // [V11.Macro_Final] 정규화된 빌더들의 통합 순차 호출
          buildWarmupTimeline(tl, logo, nemo, builderOptions, L);
          buildLogoTimeline(tl, logo, builderOptions, L);
          buildNemoTimeline(tl, nemo, builderOptions, falling, painRef, L, isRestoringRef);
          buildSectionScrollTimeline(tl, L, finalY, builderOptions);
          buildMessageTimeline(tl, L, { 
            standardGroups: messageRef.current?.getStandardGroups() || [], 
            invertedGroups: messageRef.current?.getInvertedGroups() || [] 
          }, builderOptions);
          
          // [V18.Phase3] 퍼널 스냅 지점 데이터 수집
          const funnelSnapTimes = buildCoreFunnelTimeline(tl, nemo, L, builderOptions);
          
          buildForWhoTimeline(tl, L, forwhoRef.current, nemoHandle.current, builderOptions, toggle);

          buildHeroSwapSequence(tl, nemo, L, builderOptions);

          // ─────────────────────────────────────────────
          // [V18.Phase3] Localized Snap Engine Logic
          // ─────────────────────────────────────────────
          const totalDuration = tl.duration();
          const funnelSnapPoints = funnelSnapTimes.map(time => time / totalDuration);
          
          const funnelStart = L[STAGES.CORE_FUNNEL_START] / totalWeight;
          const funnelEnd = L[STAGES.CORE_FUNNEL_SNAP] / totalWeight;

          const targetProgress = currProgressRef.current;

          // [V20.Fix] 스크롤트리거를 먼저 생성하여 브라우저와 동기화 시킵니다.
          localTrigger = ScrollTrigger.create({
            animation: tl,
            trigger: '#home-stage',
            start: 'top top',
            end: () => `+=${finalY}`,
            scrub: TIMING_CFG.SCRUB,
            pin: true,
            pinSpacing: true, 
            snap: {
              snapTo: (progress) => {
                // [V19.Stability] 복구 중이거나 타임라인이 아직 준비되지 않았을 때 스냅 방지
                if (isRestoringRef.current) return progress;

                // 퍼널 구간 내부에 있을 때만 스냅 활성화
                if (progress >= funnelStart && progress <= funnelEnd) {
                  const closest = funnelSnapPoints.reduce((prev, curr) => 
                    Math.abs(curr - progress) < Math.abs(prev - progress) ? curr : prev
                  );
                  return closest;
                }
                return progress; 
              },
              duration: interactionMode === 'touch' ? { min: 0.2, max: 0.8 } : { min: 0.1, max: 0.4 },
              delay: interactionMode === 'touch' ? 0.15 : 0.05,
              ease: 'power2.out'
            }
          });
          keywordsTrigger.current = localTrigger;

          // [V23.Bulletproof] 물리적 높이 선점 (Height Pre-sync)
          ScrollTrigger.refresh();

          // [V24.RefinedOrder] 리사이즈 대응 핵심 복구 로직 (사용자 제안 반영)
          if (targetProgress > 0.001) {
            tl.progress(targetProgress, false);
            isRestoringRef.current = true;
            
            const targetY = finalY * targetProgress;
            
            // [V33.Minimalist] Lenis 중심의 단일화된 스크롤 복구
            requestAnimationFrame(() => {
              const lenis = (window as any).lenis;
              if (lenis) {
                lenis.scrollTo(targetY, { immediate: true });
              } else {
                window.scrollTo(0, targetY);
              }


              ScrollTrigger.refresh();
              isRestoringRef.current = false;
              console.log('[Interaction/V33] Restoration Success');
            });
          } else {
            isRestoringRef.current = false;
          }

          layoutTimerRef.current = setTimeout(() => {
            // [V23.Bulletproof] 모든 레이아웃 렌더링 및 스크롤 복구가 끝난 후 최종 정밀 리프레시
            ScrollTrigger.refresh();
            setIsTimelineReady(true);
          }, 200);
        }));
    });

    return () => {
      setIsTimelineReady(false);

      console.log('[Interaction/V33] Cleanup Context');

      if (rafId.current) cancelAnimationFrame(rafId.current);
      if (layoutTimerRef.current) { clearTimeout(layoutTimerRef.current); layoutTimerRef.current = null; }

      const wrapper = sectionsContentRef.current;
      if (wrapper) {
        wrapper.style.position = '';
        wrapper.style.top = '';
        wrapper.style.left = '';
        wrapper.style.width = '';
        wrapper.style.transform = '';
      }

      console.log('[Interaction/Debug] Cleanup - Triggering ctx.revert()');
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
  const { STAGES, COLORS } = INTERACTION_REGISTRY.constants;
  const { JOURNEY_MASTER_CONFIG } = INTERACTION_REGISTRY.data;
  const heroCfg = JOURNEY_MASTER_CONFIG[STAGES.HERO];
  
  // [V11.Macro_Final] 초기화 Flicker 방어를 위한 Seed Value 계산
  const seedEnv = (isOn && heroCfg.on?.env) ? heroCfg.on.env : heroCfg.env;
  const initialBg = seedEnv.bg || '#f0ebe3';
  const initialFg = seedEnv.fg || '#1a1a1a';

  return (
    <div 
      ref={containerRef} 
      className="global-interaction-stage fixed inset-0 pointer-events-none overflow-hidden" 
      style={{ 
        zIndex: INTERACTION_Z_INDEX.Z_STAGE_WRAPPER,
        backgroundColor: 'transparent', 
      } as React.CSSProperties}
    >
      {/* 0. Background Typo Layer (네모 뒤, 키워드 위) */}
      <div 
        id="core-funnel-background-typo"
        className="fixed inset-0 flex flex-col items-center justify-center pointer-events-none select-none opacity-0"
        style={{ 
          zIndex: INTERACTION_Z_INDEX.Z_BACKGROUND_TYPO,
          willChange: 'opacity, transform' 
        }}
      >
        <div className="flex flex-col items-start justify-center px-[5vw] w-full">
          <h2 className={`font-dm font-black ${isMobile ? 'text-[19vw]' : 'text-[18vw]'} leading-[0.8] text-[#EDEDED] tracking-tighter whitespace-nowrap uppercase`}>
            Driven
          </h2>
          <h2 className={`font-dm font-black ${isMobile ? 'text-[19vw]' : 'text-[18vw]'} leading-[0.8] text-[#EDEDED] tracking-tighter whitespace-nowrap uppercase`}>
            Core
          </h2>
          <h2 className={`font-dm font-black ${isMobile ? 'text-[19vw]' : 'text-[18vw]'} leading-[0.8] text-[#EDEDED] tracking-tighter whitespace-nowrap uppercase`}>
            Funnel
          </h2>
        </div>
      </div>

      <SharedNemo ref={nemoHandle} />

      {/* 4. [NEW] 코어 퍼널 그리드 빌드 레이어 (v18.Phase3) */}
      <div 
        id="core-funnel-grid-container" 
        className="fixed inset-0 pointer-events-none" 
        style={{ zIndex: INTERACTION_Z_INDEX.Z_SHARED_NEMO + 1 }}
      >
        {/* 보조 네모 박스 (2, 3, 4번 슬롯용) */}
        {[2, 3, 4].map(idx => (
          <div 
            key={idx}
            id={`sub-nemo-${idx}`}
            className="absolute bg-brand opacity-0"
            style={{ pointerEvents: 'none', borderRadius: 0 }}
          />
        ))}

        {/* 커넥터 화살표 (>) */}
        {[1, 2, 3].map(idx => (
          <div 
            key={idx}
            id={`funnel-arrow-${idx}`}
            className="absolute opacity-0 flex items-center justify-center text-[#BBBBBB] pointer-events-none"
          >
            <svg 
              width={isMobile ? '6vw' : (isTabletPortrait ? '4vw' : '2.5vw')} 
              height={isMobile ? '6vw' : (isTabletPortrait ? '4vw' : '2.5vw')} 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="overflow-visible"
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
          </div>
        ))}

        {/* 프로세스 과정 텍스트 (브랜딩, 디자인 시스템, 로고, 자동화) */}
        {['브랜딩', '디자인 시스템', '로고 · 웹/앱', '자동화'].map((label, idx) => (
          <div 
            key={idx}
            id={`funnel-label-${idx + 1}`}
            className="absolute opacity-0 font-suit font-bold text-white text-center flex items-center justify-center select-none"
            style={{ 
              pointerEvents: 'none',
              fontSize: isMobile ? '3.5vw' : (isTabletPortrait ? '2.5vw' : '1.1vw'),
              textAlign: 'center',
              wordBreak: 'keep-all',
              padding: '0 1vw'
            }}
          >
            {label}
          </div>
        ))}
      </div>

      {/* 2. Journey Logo (Brand Layer: Portal로 최상위 독립) */}
      {mounted && typeof document !== 'undefined' && createPortal(
        <div 
          className="fixed origin-top-left cursor-pointer pointer-events-none" 
          style={{ 
            left: isMobile ? `${INTERACTION_REGISTRY.constants.HEADER_POS.MOBILE.x}px` : (isTabletPortrait ? `${INTERACTION_REGISTRY.constants.HEADER_POS.TABLET.x}vw` : `${INTERACTION_REGISTRY.constants.HEADER_POS.PC.x}vw`), 
            top: isMobile ? `${INTERACTION_REGISTRY.constants.HEADER_POS.MOBILE.y}px` : (isTabletPortrait ? `${INTERACTION_REGISTRY.constants.HEADER_POS.TABLET.y}vw` : `${INTERACTION_REGISTRY.constants.HEADER_POS.PC.y}vw`), 
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
      {/* [DEPLOY-DELETE] 디버그 점프 엔진 (인터랙션 준비 완료 시 활성화) */}
      <InteractionDebugger masterTl={masterTl.current} registry={INTERACTION_REGISTRY} />
    </div>
  );
};

export default GlobalInteractionStage;
