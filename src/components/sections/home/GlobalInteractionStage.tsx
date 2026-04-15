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
import { JOURNEY_MASTER_CONFIG } from '@/data/home/journey';
import { GlobalInteractionStageProps } from './types';
import { LOGO_JOURNEY_SECTIONS, NEMO_JOURNEY_SECTIONS } from '@/data/home/interaction-journey';
import { calculateLabels, initGlobalStyles, initLogoState, initNemoState } from './global-interaction-utils';
import { buildHeroSwapSequence, buildLogoTimeline, buildMessageTimeline, buildNemoTimeline, buildSectionScrollTimeline } from './builders';
import { DEBUG_CONFIG } from '@/constants/debug';

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
  const { isScrollable, isTimelineReady, footerHeight, setIsTimelineReady } = useHeroContext();

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
    return () => setMounted(false);
  }, []);

  // [V11.6] 핀셋 기동 트리거: 포털은 마운트(mounted)되었는데 엔진(masterTl)이 잠들어 있을 때만 비상 레버를 당깁니다.
  // 이 트리거는 리사이즈 무결성을 해치지 않도록 초기 마운트 시점에만 한정적으로 동작합니다.
  useEffect(() => {
    if (mounted && !masterTl.current && logoHandle.current?.containerEl) {
      console.log('[DEBUG-Trigger] 엔진 비상 기동 레버 동작 (Revision up)');
      setRevision(prev => prev + 1);
    }
  }, [mounted]);

  // [V11.34] 유동성 시스템 정밀 동기화: 리사이즈 시 진행률 및 픽셀 위치 보존용 Ref
  const currProgressRef = useRef<number>(0);
  const rawScrollYRef   = useRef<number>(0);
  const isRestoringRef  = useRef<boolean>(false); // [V11.34] 복원 모드 플래그 추가
  const layoutTimerRef  = useRef<ReturnType<typeof setTimeout> | null>(null); // [V11.7] 레이아웃 가드 타이머 ID 저장 (좀비 방지)

  // [V5.4] 브라우저의 강제 스크롤 복구 방지 (영점 동기화 하드닝)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.history.scrollRestoration = 'manual';
      if (ScrollTrigger.clearScrollMemory) {
        ScrollTrigger.clearScrollMemory('manual');
      }
    }
  }, []);

  useEffect(() => {
    console.log('[DEBUG-Lifecycle] GlobalInteractionStage MOUNTED');
    return () => console.log('[DEBUG-Lifecycle] GlobalInteractionStage UNMOUNTED');
  }, []);

  /**
   * [V11.31 Knowledge Transfer] GlobalInteractionStage
   * (중략)
   */
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

  useGSAP(() => {
    const logo = logoHandle.current;
    const nemo = nemoHandle.current;
    const falling = fallingRef.current;

    // [V11.2] 로컬 캡처 변수: 이 렌더링 세션에서 생성된 인스턴스만 추적하여 비동기 클린업 오작동 방지
    let localTl: gsap.core.Timeline | null = null;
    let localTrigger: ScrollTrigger | null = null;

    const ctx = gsap.context(() => {
      // [V11.Verify] 가설 검증: 마지막 마운트 시점에 useGSAP이 어떤 상태로 불리고 끝나는지 확인
      console.log('[DEBUG-Verify] useGSAP 내부 진입 - mounted:', mounted, 'Refs상태(logo/nemo/falling):', !!logo?.containerEl, !!nemo?.nemoEl, !!falling);

      if (!logo?.containerEl || !nemo?.nemoEl || !falling) return;
      // [V4.1 Strategy] 초기화 시점의 스타일 강제 주입
      initGlobalStyles(isOn, isMobileView);
      
      if (!masterTl.current) {
        initLogoState(logo, isOn, isMobileView);
      }
      initNemoState(nemo);
      
      console.log('[DEBUG-Stage] useGSAP 실행 - isScrollable:', isScrollable, 'isOn:', isOn);

      if (isScrollable) {
        console.log('[DEBUG-Stage] 타임라인 빌드 조건 통과 (if (isScrollable) 진입)');
        // [V11.Precision-Cleanup] 무차별 전역 소거(getAll) 중단 및 정밀 리프레시만 수행

        if (footerHeight === 0) return;

        // [V4.2 Timing] 레이아웃 확정 대기 (Next Tick)
        rafId.current = requestAnimationFrame(() => ctx.add(() => {
          const { offsets: L, totalWeight } = calculateLabels(interactionMode);
          const H = SECTION_SCROLL_HEIGHT;
          const vhToPx = (vh: number) => (vh * window.innerHeight) / 100;
          const totalHeight = vhToPx(H.HERO + H.PAIN + H.MESSAGE + H.FORWHO + H.STORY + H.CTA) + footerHeight;
          const finalY = totalHeight - window.innerHeight;

          // [V11.34] 마스터 타임라인 생성 및 캡처 로직 (onUpdate)
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

              const startRange = L[STAGES.START_TO_PAIN] / totalWeight;
              const endRange   = L[STAGES.TO_FOOTER] / totalWeight;

              if ((currentProgress >= startRange && currentProgress <= endRange) || isRestoringRef.current) {
                const el = nemoHandle.current?.nemoEl;
                if (el) {
                  // [V11.58] getBoundingClientRect를 통한 정밀 픽셀 추출 (Edge 기반)
                  const rect = el.getBoundingClientRect();
                  const root = document.documentElement;
                  
                  // inset(top right bottom left) 공식에 맞게 뷰포트 끝단에서의 거리 계산
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

          // 마스터 시트 라벨 주입
          Object.entries(L).forEach(([key, time]) => {
            tl.addLabel(key, time);
          });
          console.log('[DEBUG-Stage] 타임라인 빌드 완료 - 트리거 개수:', ScrollTrigger.getAll().length);

          // [V11.34-P5] 동기화 가드: 타임라인 빌드 직전에 정답 색상을 :root에 강제 주입
          // GSAP이 브라우저의 불안정한 스타일을 캡처하기 전에 먼저 선수 칩니다.
          initGlobalStyles(isOn, isMobileView);

          // 개별 섹션 빌더 호출
                    buildLogoTimeline(tl, logo, { isMobile, isTabletPortrait, isOn }, L);
          buildNemoTimeline(tl, nemo, { isMobile, isTabletPortrait, interactionMode }, falling, painRef, L, isRestoringRef);
          buildSectionScrollTimeline(tl, L, finalY);
          buildMessageTimeline(tl, L, { 
            standardGroups: messageRef.current?.getStandardGroups() || [], 
            invertedGroups: messageRef.current?.getInvertedGroups() || [] 
          }, { interactionMode });
          buildHeroSwapSequence(tl, nemo, L);

          // [V16.41] 독립형 물리 엔진 제어 트리거
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

          // [V26.98 Defensibility] 100ms Layout Guard
          // 이 숫자는 브라우저의 스크롤바 렌더링 및 레이아웃 엔진의 정착 시차가 유발하는 핀 좌표의 무결성 손실을 극복하기 위한 경험적 가드입니다.
          // 성능 최적화를 위해 이 값을 임의로 축소할 경우 레이아웃 시프트가 발생할 수 있으므로 절대적으로 보존해야 합니다.
          layoutTimerRef.current = setTimeout(() => {
            setIsTimelineReady(true);
            ScrollTrigger.refresh();
            console.log('[DEBUG-Stage] 최종 레이아웃 가드 완료 - 트리거 개수:', ScrollTrigger.getAll().length);

            // 🔥🔥🔥🔥🔥 [DEBUG-DELETE] : 배포 전 반드시 삭제 (디버그 점프 로직) !!!!!!!!!!!!!!!!!!!!!!!!!!🔥🔥🔥🔥🔥🔥
            if (process.env.NODE_ENV === 'development' && DEBUG_CONFIG.USE_DEBUG && DEBUG_CONFIG.START_STAGE) {
              const targetTime = L[DEBUG_CONFIG.START_STAGE];
              if (targetTime !== undefined) {
                const scrollPos = (targetTime / totalWeight) * (finalY - footerHeight);
                window.scrollTo(0, scrollPos);
                if (window.lenis) window.lenis.scrollTo(scrollPos, { immediate: true });
              }
            }
          }, 100);
        }));
      }
    });

    return () => {
      console.log('[DEBUG-Cleanup] 클린업 함수 실행 (Destruction) - 위상:', { isOn, isScrollable, footerHeight });
      // [V11.34] 클린업 브릿지: 타임라인 파괴 직전 최종 위치 박제
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

        // [V11.2 Precision-Cleanup] 로컬에 캡처된 인스턴스만 정밀 소거하여 타임라인 레이스 컨디션 해결
        if (localTl) {
          localTl.scrollTrigger?.kill();
          localTl.kill();
          // 전역 Ref가 여전히 나(로컬)를 가리킬 때만 null 처리 (사용자 제안 방어 로직)
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

        setIsTimelineReady(false);
        console.log('[DEBUG-Cleanup] 최종 트리거 잔액 (좀비 체크):', ScrollTrigger.getAll().length);
      };
  }, { dependencies: [isScrollable, isOn, isMobileView, isTabletPortrait, footerHeight, interactionMode, revision], revertOnUpdate: true });

  return (
    <div ref={containerRef} className="global-interaction-stage fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 10 }}>
      {/* 1. Shared Nemo */}
      <div style={{ zIndex: INTERACTION_Z_INDEX.SHARED_NEMO }}>
        <SharedNemo ref={nemoHandle} />
      </div>

      {/* 2. Journey Logo (Brand Layer: Portal로 최상위 독립) */}
      {mounted && typeof document !== 'undefined' && createPortal(
        <div 
          className="fixed origin-top-left cursor-pointer pointer-events-none" 
          style={{ 
            left: isMobile ? `${HEADER_POS.MOBILE.x}px` : (isTabletPortrait ? `${HEADER_POS.TABLET.x}vw` : `${HEADER_POS.PC.x}vw`), 
            top: isMobile ? `${HEADER_POS.MOBILE.y}px` : (isTabletPortrait ? `${HEADER_POS.TABLET.y}vw` : `${HEADER_POS.PC.y}vw`), 
            zIndex: INTERACTION_Z_INDEX.JOURNEY_LOGO 
          }}
        >
          <div
            className="pointer-events-auto"
            onClick={() => {
              // [V26.96 Global UX] 물리 엔진 리셋 선행 후 최상단 즉시 이동 (시각적 무결성 확보)
              fallingRef.current?.reset();
              window.lenis?.scrollTo(0, { immediate: true });
            }}
          >
            <JourneyLogo ref={logoHandle} isOn={isOn} progress={0} isTransitioning={isTransitioning} />
          </div>
        </div>,
        document.body
      )}

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
