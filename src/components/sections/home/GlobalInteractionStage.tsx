'use client';

import React, { useRef, useEffect, useLayoutEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { useHeroContext } from '@/context';
import JourneyLogo, { JourneyLogoHandle } from './JourneyLogo';
import SharedNemo, { SharedNemoHandle } from './SharedNemo';
import type { FallingKeywordsHandle, FallingKeywordsStageProps } from './FallingKeywordsStage';
const FallingKeywordsStage = dynamic<FallingKeywordsStageProps>(() => import('./FallingKeywordsStage'), { ssr: false, loading: () => null }) as React.ForwardRefExoticComponent<FallingKeywordsStageProps & React.RefAttributes<FallingKeywordsHandle>>;
import {
  INTERACTION_Z_INDEX,
  KAKAO_VIEWPORT_SAFETY_MARGIN,
  LOGO_SIZE,
  STAGES,
  TIMING_CFG
} from '@/constants/interaction';
import { GlobalInteractionStageProps, GlobalBuilderOptions } from './types';
import { calculateLabels, initGlobalStyles, initLogoState, initNemoState, syncNemoCoordinates } from './global-interaction-utils';
import GlobalScrollHint from './GlobalScrollHint';
import ScrollOnboardingNudge from './ScrollOnboardingNudge';
import { INTERACTION_REGISTRY } from './interaction-registry';
import { buildHeroSwapSequence, buildForWhoTimeline, buildLogoTimeline, buildMessageTimeline, buildNemoTimeline, buildSectionScrollTimeline, buildWarmupTimeline, buildCoreFunnelTimeline, buildStoryTimeline, buildCTATimeline } from './builders';
// [Batch2] CORE_FUNNEL_TITLE, MESSAGE_COLORS — interaction-registry/builders에서 직접 import하므로 여기선 미사용
// [V69.LaunchReady] STEP 5 — InteractionDebugger dev 전용 dynamic import (프로덕션 번들 제외)
import dynamic from 'next/dynamic';
const IS_DEV = process.env.NODE_ENV === 'development';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const InteractionDebugger: React.ComponentType<any> = IS_DEV
  ? dynamic(() => import('./InteractionDebugger'), { ssr: false })
  : () => null;

import { ScrollToPlugin } from 'gsap/dist/ScrollToPlugin';

// [V67.ViewportFix] 브라우저 크롬 상태와 무관한 안정 뷰포트 높이(100svh) 실측
// [KakaoFix] 카카오 인앱일 때는 <head> 스크립트가 측정한 __kakaoStableVH를 반환.
//   → CSS --kakao-vh-unit과 GSAP stableVH가 동일 측정값 사용 (좌표 일치 보장)
const getStableVH = (): number => {
  if (typeof window === 'undefined') return 0;
  if ((window as { __kakaoStableVH?: number }).__kakaoStableVH) {
    return (window as { __kakaoStableVH?: number }).__kakaoStableVH!;
  }
  const probe = document.createElement('div');
  probe.style.cssText =
    'position:fixed;top:0;left:0;height:100svh;width:0;visibility:hidden;pointer-events:none;';
  document.body.appendChild(probe);
  const h = probe.offsetHeight;
  probe.remove();
  return h || window.innerHeight;
};

// [V67.ViewportFix] 풀블리드 커버용 안정 높이(100lvh) 실측 — 크롬 접힘 상태에서도 전체 덮음
// [KakaoFix] 카카오 인앱일 때는 svh와 동일하게 __kakaoStableVH 반환.
//   lvh도 동적으로 변하는 환경이므로 로드 시점 스냅샷 고정값으로 통일.
const getStableLVH = (): number => {
  if (typeof window === 'undefined') return 0;
  if ((window as { __kakaoStableVH?: number }).__kakaoStableVH) {
    return (window as { __kakaoStableVH?: number }).__kakaoStableVH!;
  }
  const probe = document.createElement('div');
  probe.style.cssText =
    'position:fixed;top:0;left:0;height:100lvh;width:0;visibility:hidden;pointer-events:none;';
  document.body.appendChild(probe);
  const h = probe.offsetHeight;
  probe.remove();
  return h || window.innerHeight;
};

// [V66.Phase1] GSAP/ScrollTrigger 글로벌 설정
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
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
  const { isScrollable, footerHeight, isTimelineReady, setIsTimelineReady, toggle } = useHeroContext();

  const containerRef = useRef<HTMLDivElement>(null);
  const logoHandle   = useRef<JourneyLogoHandle>(null);
  const nemoHandle   = useRef<SharedNemoHandle>(null);
  const fallingRef   = useRef<FallingKeywordsHandle>(null);
  const masterTl     = useRef<gsap.core.Timeline | null>(null);
  const rafId        = useRef<number | null>(null);
  const keywordsTrigger = useRef<ScrollTrigger | null>(null);
  
  // [V66.Phase3.3] 실측 오프셋 관리 (렌더 불필요 → useRef)
  const offsetsRef = useRef<Record<string, number>>({});

  // [V66.Phase1] 리사이즈 임계값 관리를 위한 상태
  const lastWidthRef = useRef<number>(0);
  const lastHeightRef = useRef<number>(0);

  // [V11.Separation] 하이드레이션 오류 방지를 위한 마운트 상태 관리
  const [mounted, setMounted] = useState(false);
  const [revision, setRevision] = useState(0);
  // 타임라인 준비 전 터치 스크롤 차단용 투명 오버레이 상태
  const [showOverlay, setShowOverlay] = useState(true);

  // 재시도 안전장치: 연속 재시도 횟수 추적 (MAX_RETRY 초과 시 오버레이 강제 해제)
  const MAX_RETRY = 5;
  const retryCountRef = useRef(0);
  // [V68.Fix1] 마지막 빌드 시 footerHeight 기록 — 60px 게이트용
  const lastBuiltFooterHeightRef = useRef(0);
  // [Batch2] retry setTimeout 클린업용 ref
  const retryTimerRef2 = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setMounted(true);
    lastWidthRef.current = window.innerWidth;
    lastHeightRef.current = window.innerHeight;
  }, []);

  // 히어로 초기 Y 오프셋 — isScrollable 이전 다크/라이트 진입 시점에도 적용
  useEffect(() => {
    const el = logoHandle.current?.containerEl;
    if (!el || !mounted) return;
    const offset = isMobile
      ? LOGO_SIZE.HERO_Y_OFFSET_MOBILE
      : (isTabletPortrait ? LOGO_SIZE.HERO_Y_OFFSET_TABLET : LOGO_SIZE.HERO_Y_OFFSET);
    gsap.set(el, { y: offset });
  }, [mounted, isMobile, isTabletPortrait]);

  // 오버레이 해제:
  // - 오프모드(!isScrollable): 오버레이 유지 (isScrollable이 true로 전환될 때까지)
  // - 온모드(isScrollable): isTimelineReady까지 대기 후 500ms 해제
  useEffect(() => {
    if (!mounted) return;
    if (isScrollable && isTimelineReady) {
      const timer = setTimeout(() => setShowOverlay(false), 500);
      return () => clearTimeout(timer);
    }
    // isScrollable이 true로 바뀌는 순간 showOverlay를 다시 true로 복원
    // (오프→온 전환 시 타임라인 준비 전 구간도 오버레이 유지)
    if (isScrollable && !isTimelineReady) {
      setShowOverlay(true);
    }
  }, [mounted, isScrollable, isTimelineReady]);

  // iOS Safari 스크롤 차단:
  // - 오프모드(!isScrollable): touchmove preventDefault + lenis.stop()
  // - 온모드이지만 타임라인 미완료(isScrollable && !isTimelineReady): 동일하게 차단 유지
  // - 온모드 + 타임라인 완료(!shouldBlock): lenis.start() — effect 본문 else에서 즉시 호출
  // iOS Safari는 overflow:hidden을 무시하므로 touchmove preventDefault가 필수
  // lenis.start()는 내부적으로 isStopped 가드가 있어 이미 실행 중이면 no-op으로 안전
  const shouldBlock = !isScrollable || (isScrollable && !isTimelineReady);
  useEffect(() => {
    if (!mounted) return;
    const preventTouchMove = (e: TouchEvent) => e.preventDefault();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const lenis = (window as any).lenis;
    if (shouldBlock) {
      document.addEventListener('touchmove', preventTouchMove, { passive: false });
      if (lenis) lenis.stop();
    } else {
      // shouldBlock이 false가 된 렌더에서 즉시 실행 — 클로저 박제 문제 없음
      if (lenis) lenis.start();
    }
    return () => {
      document.removeEventListener('touchmove', preventTouchMove);
    };
  }, [mounted, shouldBlock]);

  useEffect(() => {
    if (mounted && isScrollable && !masterTl.current) {
      retryCountRef.current = 0;
      setRevision(prev => prev + 1);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps — isScrollable 의도적 제외:
  // 마운트 시점에 이미 ON 상태(복귀)인 경우 1회만 빌드 킥. isScrollable을 deps에 넣으면
  // OFF→ON 전환마다 이중 빌드가 발생함.
  }, [mounted]);

  const currProgressRef = useRef<number>(0);
  const rawScrollYRef   = useRef<number>(0);
  const isRestoringRef  = useRef<boolean>(false); 
  const layoutTimerRef  = useRef<ReturnType<typeof setTimeout> | null>(null); 

  // [Fix 4] 모바일 브라우저 컨트롤 바 등장/숨김 시 ScrollTrigger 좌표 동기화
  // ignoreMobileResize:true 가 빈번한 갱신을 막으므로, visualViewport 기반으로
  // 높이 변화가 50px 이상 안정된 후 1회만 refresh (300ms 디바운스)
  // [V68.Fix2] svh 전환 이후 touch에서는 시각 뷰포트 높이 변화(크롬 제어 바)가
  // ScrollTrigger 재빌드 트리거가 될 이유가 없음 — 터치에서는 핸들러 즉시 종료
  useEffect(() => {
    if (typeof window === 'undefined' || !window.visualViewport) return;
    // [V68.Fix2] svh 전환 이후 touch에서는 시각 뷰포트 높이 변화(크롬 제어 바)가
    // ScrollTrigger 재빌드 트리거가 될 이유가 없음 — 터치에서는 핸들러 즉시 종료
    if (interactionMode === 'touch') return;

    let debounceTimer: ReturnType<typeof setTimeout> | null = null;
    let lastHeight = window.visualViewport.height;

    const handleViewportResize = () => {
      const currentHeight = window.visualViewport!.height;
      const diff = Math.abs(currentHeight - lastHeight);
      if (diff < 50) return;

      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        lastHeight = window.visualViewport!.height;
        // [V67.ViewportFix] 핀 구간 후반(푸터 근처)에서는 refresh가 눈에 보이는
        // 점프를 유발하므로 스킵. STEP 1~2로 기하학이 svh 고정이라 보정 불필요.
        const progress = masterTl.current?.progress() ?? 0;
        if (masterTl.current && progress <= 0.9) {
          ScrollTrigger.refresh();
        }
        debounceTimer = null;
      }, 300);
    };

    window.visualViewport.addEventListener('resize', handleViewportResize);
    return () => {
      window.visualViewport?.removeEventListener('resize', handleViewportResize);
      if (debounceTimer) clearTimeout(debounceTimer);
    };
  }, [interactionMode]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.history.scrollRestoration = 'manual';
      if (ScrollTrigger.clearScrollMemory) {
        ScrollTrigger.clearScrollMemory('manual');
      }
    }
  }, []);

  // [V66.Phase1] 지능형 리사이즈 감지 정책 적용
  // [V67.ViewportFix] 터치 기기에서는 높이 변화(브라우저 크롬 등장/퇴장)를 무시.
  // 화면 회전은 너비 변화(widthChanged)로 감지되므로 정상 커버됨.
  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;

      // 너비가 변했거나 (가로/세로 전환), 높이 변화가 임계값(80px 또는 12%) 이상일 때만 엔진 재가동
      const widthChanged = Math.abs(w - lastWidthRef.current) > 2;
      const heightDiff = Math.abs(h - lastHeightRef.current);
      const heightThreshold = Math.max(80, lastHeightRef.current * 0.12);

      if (widthChanged || (interactionMode !== 'touch' && heightDiff > heightThreshold)) {
        lastWidthRef.current = w;
        lastHeightRef.current = h;
        retryCountRef.current = 0;
        setRevision(prev => prev + 1);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [interactionMode]);

  useEffect(() => {
    if (isScrollable) {
      const timer = setTimeout(() => {
        ScrollTrigger.refresh();
      }, 100); 
      return () => clearTimeout(timer);
    }
  }, [isScrollable]);

  // [V69.LaunchReady] STEP 6 — 렌더 본문 DOM 조작 → useLayoutEffect 이동 (React 규칙 준수)
  // ⚠️ 이동 후 홈 새로고침 시 첫 페인트 FOUC 발생 여부를 반드시 눈으로 확인할 것.
  //    깜빡임 발생 시 이 블록을 되돌리고 원인 보고 후 중단한다.
  useLayoutEffect(() => {
    if (!mounted) return;
    const isRestoring = (currProgressRef.current || 0) > 0.001;
    initGlobalStyles(INTERACTION_REGISTRY, isOn, isMobileView, currProgressRef.current, isRestoring);
  }, [mounted, isOn, isMobileView]);

  useGSAP(() => {
    const logo = logoHandle.current;
    const nemo = nemoHandle.current;
    const falling = fallingRef.current;

    let localTl: gsap.core.Timeline | null = null;
    let localTrigger: ScrollTrigger | null = null;
    let localPainTrigger: ScrollTrigger | null = null;

    const ctx = gsap.context(() => {
      if (!isScrollable || !mounted) return;
      if (!logo?.containerEl || !nemo?.nemoEl || !falling) {
        // [V76] FallingKeywordsStage dynamic import 미완료 시 재시도
        if (!falling && retryCountRef.current < MAX_RETRY) {
          retryCountRef.current += 1;
          retryTimerRef2.current = setTimeout(() => setRevision(prev => prev + 1), 80);
        }
        return;
      }

      if (isMobile) {
        ScrollTrigger.normalizeScroll({
          allowNestedScroll: true,
          momentum: 0
        });
      }
      
      // [V66.Phase1] 폰트 로딩 대기 후 정밀 측정 실행
      const runMeasurementAndBuild = async () => {
        if (typeof document !== 'undefined' && (document as any).fonts) {
          // [Batch5] fonts.ready가 멈추는 예외 환경 대비 1.5초 안전망
          await Promise.race([
            (document as any).fonts.ready,
            new Promise(resolve => setTimeout(resolve, 1500)),
          ]);
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
            if (retryCountRef.current < MAX_RETRY) {
              retryCountRef.current += 1;
              setRevision(prev => prev + 1);
            } else {
              console.error('[V66.Phase1] Max retries exceeded (footer). Force-releasing overlay.');
              setShowOverlay(false);
              setIsTimelineReady(true);
            }
            return;
          }

          if (!allRendered) {
            console.warn('[V66.Phase1] Some sections are missing or height is 0, retrying...');
            if (retryCountRef.current < MAX_RETRY) {
              retryCountRef.current += 1;
              setRevision(prev => prev + 1);
            } else {
              console.error('[V66.Phase1] Max retries exceeded (sections). Force-releasing overlay.');
              setShowOverlay(false);
              setIsTimelineReady(true);
            }
            return;
          }

          // [V66.Phase1] 지형 실측 (Ground Truth Measurement)
          const sectionHeightsMap = sectionIds.reduce((map, id) => {
            map[id] = document.getElementById(id)?.offsetHeight || 0;
            return map;
          }, {} as Record<string, number>);

          const measuredSectionsTotal = Object.values(sectionHeightsMap).reduce((a, b) => a + b, 0);
          const measuredTotalHeight = measuredSectionsTotal + measuredFooterHeight;

          // [V66.Phase3.3] 실측된 오프셋 데이터를 맵으로 생성
          const sectionOffsetsMap = sectionIds.reduce((map, id) => {
            const el = document.getElementById(id);
            if (el && sectionsContentRef.current) {
              map[id] = el.offsetTop;
            } else {
              map[id] = 0;
            }
            return map;
          }, {} as Record<string, number>);

          // 포커싱용 오프셋 캐시 업데이트
          offsetsRef.current = sectionOffsetsMap;

          // [V66.Phase3] 푸터 안전 여백은 이제 Footer.tsx의 padding-bottom으로 대체되었습니다.
          // 엔진은 Footer의 늘어난 offsetHeight를 실시간으로 측정하여 자동으로 finalY에 반영합니다.
          // [V67.ViewportFix] innerHeight(크롬 상태에 따라 가변) 대신 svh/lvh 실측값 사용
          const stableVH = getStableVH();
          const stableLVH = getStableLVH();
          // [KakaoFix] 카카오 인앱에서 스크롤 끝에서 되감기 현상 방지.
          // #home-stage가 +KAKAO_VIEWPORT_SAFETY_MARGIN만큼 늘어났으므로
          // finalY도 같은 값만큼 줄여 ScrollTrigger 핀 종료 지점을 맞춤.
          const isKakaoFixed = !!(window as { __kakaoStableVH?: number }).__kakaoStableVH;
          const finalY = measuredTotalHeight - stableVH - (isKakaoFixed ? KAKAO_VIEWPORT_SAFETY_MARGIN : 0);
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
                syncNemoCoordinates(nemoHandle.current?.nemoEl || null, stableVH);
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
            initialNemoPos: measuredPos || undefined,
            // [V66.Phase3-2] 실측 오프셋 데이터를 엔진에 주입합니다.
            sectionOffsets: sectionOffsetsMap,
            // [V67.ViewportFix] svh/lvh 실측값을 모든 빌더에 보급합니다.
            stableVH,
            stableLVH,
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

          // [V76] Pain 구간 물리 엔진 게이트 — ScrollTrigger onEnter/onLeave로 제어
          // duration:0 tween onStart 방식은 scrub 모드에서 불안정 → 콜백 방식으로 교체
          const painEnterScrollY = (L[STAGES.TO_PAIN] / totalDuration) * finalY;
          const painLeaveScrollY = (L[STAGES.PAIN_TO_MSG] / totalDuration) * finalY;
          localPainTrigger = ScrollTrigger.create({
            start: painEnterScrollY,
            end: painLeaveScrollY,
            onEnter: () => fallingRef.current?.resumeSimulation(),
            onLeave: () => fallingRef.current?.pauseSimulation(),
            onEnterBack: () => fallingRef.current?.resumeSimulation(),
            onLeaveBack: () => fallingRef.current?.pauseSimulation(),
          });

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
              if (process.env.NODE_ENV !== 'production') console.log('[Interaction/V33] Restoration Success');
            });
          } else {
            isRestoringRef.current = false;
          }

          layoutTimerRef.current = setTimeout(() => {
            // [V23.Bulletproof] 모든 레이아웃 렌더링 및 스크롤 복구가 끝난 후 최종 정밀 리프레시
            ScrollTrigger.refresh();
            retryCountRef.current = 0;
            // [V68.Fix1] 빌드 완료 시점의 footerHeight 기록 (게이트 기준값)
            lastBuiltFooterHeightRef.current = measuredFooterHeight;
            setIsTimelineReady(true);
          }, 200);
        }));
      };

      // 실측 및 빌드 프로세스 시작
      runMeasurementAndBuild();
    });

    return () => {
      setIsTimelineReady(false);
      if (process.env.NODE_ENV !== 'production') console.log('[Interaction/V33] Cleanup Context');

      if (retryTimerRef2.current) {
        clearTimeout(retryTimerRef2.current);
        retryTimerRef2.current = null;
      }
      if (rafId.current) cancelAnimationFrame(rafId.current);
      if (layoutTimerRef.current) {
        clearTimeout(layoutTimerRef.current);
        layoutTimerRef.current = null;
      }

      const wrapper = sectionsContentRef.current;
      if (wrapper) {
        wrapper.style.position = '';
        wrapper.style.top = '';
        wrapper.style.left = '';
        wrapper.style.width = '';
        wrapper.style.transform = '';
      }

      if (process.env.NODE_ENV !== 'production') console.log('[Interaction/Debug] Cleanup - Triggering ctx.revert()');
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

      if (localPainTrigger) {
        localPainTrigger.kill();
        localPainTrigger = null;
      }

      // [V76] 재빌드 시 물리 엔진 정지 (다음 ScrollTrigger onEnter가 재가동)
      fallingRef.current?.pauseSimulation();
    };
  }, { dependencies: [revision, isScrollable, isOn, isMobileView, isTabletPortrait, isMobile, interactionMode], revertOnUpdate: true });

  // [V66.Phase3.3] CTA 자동 포커스 이벤트 리스너 (offsetsRef에서 최신값 직접 읽음)
  useEffect(() => {
    if (!mounted) return;

    const handleCtaFocus = () => {
      const ctaOffset = offsetsRef.current['section-cta'];
      if (typeof ctaOffset === 'number' && ctaOffset > 0) {
        gsap.to(window, {
          scrollTo: ctaOffset,
          duration: 1.2,
          ease: 'power3.inOut',
          overwrite: true
        });
      }
    };

    window.addEventListener('nemo:cta-focus', handleCtaFocus);
    return () => window.removeEventListener('nemo:cta-focus', handleCtaFocus);
  }, [mounted]);

  // [V68.Fix1] footerHeight 변화 게이트 — 60px 이상 차이 시에만 재빌드 트리거
  // useGSAP deps에서 footerHeight를 제거하고, 실제로 의미 있는 변화(레이아웃 영향 수준)만 반응.
  // 모바일 컨트롤 바 전환으로 인한 calc() 미세 변화(~20-34px)는 차단됨.
  useEffect(() => {
    if (!masterTl.current) return;
    if (Math.abs(footerHeight - lastBuiltFooterHeightRef.current) > 60) {
      retryCountRef.current = 0;
      setRevision(prev => prev + 1);
    }
  }, [footerHeight]);

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
                // ScrollTrigger 캐시된 scroll position과 실제 위치 동기화
                requestAnimationFrame(() => ScrollTrigger.refresh());
              }}
            />
          </div>
        </div>,
        document.body
      )}
      
      {/* 3. Global Scroll Hint (통합 가이드) + 온보딩 넛지 배너 */}
      {mounted && typeof document !== 'undefined' && createPortal(
        <GlobalScrollHint />,
        document.body
      )}
      {mounted && typeof document !== 'undefined' && createPortal(
        <ScrollOnboardingNudge />,
        document.body
      )}


      <FallingKeywordsStage 
        ref={fallingRef} 
        containerRef={containerRef} 
        isMobile={isMobile}
        isTabletPortrait={isTabletPortrait} 
      />

      {/* 5. Interaction Debugger (v11.Separation) [완성후-삭제] */}
      {mounted && <InteractionDebugger masterTl={masterTl.current} registry={INTERACTION_REGISTRY} />}

      {/* 투명 오버레이 — iOS Safari 터치 스크롤 차단 (touchmove 리스너와 이중 방어)
          pointerEvents: 'none' → 클릭/탭은 하위 요소(토글, 메뉴)로 통과
          touchAction: 'none' → 오프모드 동안 CSS 레벨 터치 스크롤 차단 */}
      {showOverlay && mounted && typeof document !== 'undefined' && createPortal(
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9000,
            opacity: isTimelineReady ? 0 : 1,
            transition: 'opacity 0.4s ease',
            pointerEvents: 'none', // touchAction 불필요: pointerEvents:'none'이 터치 이벤트도 차단
            backgroundColor: 'transparent',
          }}
        />,
        document.body
      )}
    </div>
  );
};

export default GlobalInteractionStage;
