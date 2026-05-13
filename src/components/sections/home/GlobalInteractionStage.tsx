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
import GlobalScrollHint from './GlobalScrollHint';
import { INTERACTION_REGISTRY } from './interaction-registry';
import { buildHeroSwapSequence, buildForWhoTimeline, buildLogoTimeline, buildMessageTimeline, buildNemoTimeline, buildSectionScrollTimeline, buildWarmupTimeline, buildCoreFunnelTimeline, buildStoryTimeline, buildCTATimeline } from './builders';
import { CORE_FUNNEL_TITLE, MESSAGE_COLORS } from '@/data/home/message';
import { DEBUG_CONFIG } from '@/constants/debug';
import InteractionDebugger from './InteractionDebugger';

// [V66.Phase1] GSAP/ScrollTrigger 글로벌 설정
// 모바일 주소창 변화로 인한 미세한 height 리사이즈를 무시하여 인터랙션 튐 현상을 방지합니다.
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ 
    ignoreMobileResize: true,
    autoRefreshEvents: "visibilitychange,DOMContentLoaded,load,resize" 
  });
}

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
  
  // [V66.Phase1] 리사이즈 임계값 관리를 위한 상태
  const lastWidthRef = useRef<number>(0);
  const lastHeightRef = useRef<number>(0);

  // [V11.Separation] 하이드레이션 오류 방지를 위한 마운트 상태 관리
  const [mounted, setMounted] = useState(false);
  const [revision, setRevision] = useState(0); 
  useEffect(() => {
    setMounted(true);
    lastWidthRef.current = window.innerWidth;
    lastHeightRef.current = window.innerHeight;
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

  // [V66.Phase1] 지능형 리사이즈 감지 정책 적용
  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      
      // 너비가 변했거나 (가로/세로 전환), 높이 변화가 임계값(80px 또는 12%) 이상일 때만 엔진 재가동
      const widthChanged = Math.abs(w - lastWidthRef.current) > 2;
      const heightDiff = Math.abs(h - lastHeightRef.current);
      const heightThreshold = Math.max(80, lastHeightRef.current * 0.12);
      
      if (widthChanged || heightDiff > heightThreshold) {
        lastWidthRef.current = w;
        lastHeightRef.current = h;
        setRevision(prev => prev + 1);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isScrollable) {
      const timer = setTimeout(() => {
        ScrollTrigger.refresh();
      }, 100); 
      return () => clearTimeout(timer);
    }
  }, [isScrollable]);

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
      
      // [V66.Phase1] 폰트 로딩 대기 후 정밀 측정 실행
      const runMeasurementAndBuild = async () => {
        if (typeof document !== 'undefined' && (document as any).fonts) {
          await (document as any).fonts.ready;
        }

        rafId.current = requestAnimationFrame(() => ctx.add(() => {
          // [V66.Phase1] 모든 섹션 ID 정의
          const sectionIds = [
            'section-hero',
            'section-pain',
            'section-message',
            'section-forwho',
            'section-brand-story',
            'section-bridge',
            'section-cta'
          ];

          // [V66.Phase1] 측정 가드: 모든 섹션이 렌더링되었는지 확인
          const sectionElements = sectionIds.map(id => document.getElementById(id));
          const allRendered = sectionElements.every(el => el && el.offsetHeight > 0);
          
          // [V66.Phase1] 푸터 높이 실측 또는 Fallback
          const footerEl = document.querySelector('footer');
          const measuredFooterHeight = footerEl?.offsetHeight || footerHeight;

          // 푸터 높이가 아직 0이고 실기기 모바일인 경우, 정확한 측정을 위해 빌드를 한 차례 지연
          if (measuredFooterHeight === 0 && isMobile) {
            console.warn('[V66.Phase1] Footer height not ready, deferring build...');
            setRevision(prev => prev + 1);
            return;
          }

          if (!allRendered) {
            console.warn('[V66.Phase1] Some sections are missing or height is 0, retrying...');
            setRevision(prev => prev + 1);
            return;
          }

          // [V66.Phase1] 지형 실측 (Ground Truth Measurement)
          const sectionHeightsMap = sectionIds.reduce((map, id) => {
            map[id] = document.getElementById(id)?.offsetHeight || 0;
            return map;
          }, {} as Record<string, number>);

          const measuredSectionsTotal = Object.values(sectionHeightsMap).reduce((a, b) => a + b, 0);
          const measuredTotalHeight = measuredSectionsTotal + measuredFooterHeight;

          // 기존 vh 방식 계산값 (진단용)
          const { 
            SECTION_SCROLL_HEIGHT: H, 
            TIMING_CFG, 
            STAGES, 
          } = INTERACTION_REGISTRY.constants;
          const vhToPx = (vh: number) => (vh * window.innerHeight) / 100;
          const sectionHeightsSum = H.HERO + H.PAIN + H.MESSAGE + H.FORWHO + H.STORY + H.BRIDGE + H.CTA;
          const estimatedTotalHeight = vhToPx(sectionHeightsSum) + footerHeight;

          // [V66.Phase1] 뷰포트 진단 데이터 로그 출력
          console.group('🚀 Nemo V66 Phase 1: Interaction Engine Diagnostics');
          console.table({
            'Viewport (Inner)': window.innerHeight,
            'Viewport (Visual)': window.visualViewport?.height || 'N/A',
            'Footer (Context)': footerHeight,
            'Footer (Measured)': measuredFooterHeight,
            'Sections Total (Estimated)': estimatedTotalHeight,
            'Sections Total (Measured)': measuredTotalHeight,
            'Cumulative Error (px)': measuredTotalHeight - estimatedTotalHeight
          });
          console.log('Section Heights (Measured):', sectionHeightsMap);
          console.groupEnd();

          // [V66.Phase1] Phase 1에서는 아직 기존 계산식(estimatedTotalHeight)을 유지합니다.
          const finalY = estimatedTotalHeight - window.innerHeight;

          ScrollTrigger.refresh();
          const isRestoringNow = isRestoringRef.current;
          
          initGlobalStyles(INTERACTION_REGISTRY, isOn, isMobileView, currProgressRef.current, isRestoringNow);
          initLogoState(INTERACTION_REGISTRY, logo, { isOn, isMobile, isTabletPortrait, progress: currProgressRef.current });
          const measuredPos = initNemoState(INTERACTION_REGISTRY, nemo, { isOn, isMobileView, isTabletPortrait, progress: currProgressRef.current, isRestoring: isRestoringNow });

          const { offsets: L, totalWeight } = calculateLabels(INTERACTION_REGISTRY, interactionMode);

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
          buildStoryTimeline(tl, L, builderOptions);
          buildCTATimeline(tl, L, builderOptions);

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
            scrub: interactionMode === 'touch' ? TIMING_CFG.SCRUB_TOUCH : TIMING_CFG.SCRUB,
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
      };

      // 실측 및 빌드 프로세스 시작
      runMeasurementAndBuild();
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
      
      {/* 3. Global Scroll Hint (통합 가이드) */}
      {mounted && typeof document !== 'undefined' && createPortal(
        <GlobalScrollHint />,
        document.body
      )}


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
