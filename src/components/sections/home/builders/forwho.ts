import { gsap } from 'gsap';
import { STAGES } from '@/constants/interaction';
import { ForWhoSectionHandle } from '../forwho/ForWhoSection';
import { GlobalBuilderOptions } from '../types';

import { SharedNemoHandle } from '../SharedNemo';
import { getForWhoTargetRect } from '../global-interaction-utils';
import { FOR_WHO_LIST } from '@/data/home/forwho';

/**
 * [V12] buildForWhoTimeline
 * ForWho Section Builder with Cinematic Finale
 */
export function buildForWhoTimeline(
  tl: gsap.core.Timeline,
  L: Record<string, number>,
  forwho: ForWhoSectionHandle | null,
  nemo: SharedNemoHandle | null,
  options: GlobalBuilderOptions,
  toggle?: () => void // Step 3: Logo Toggle 추가
) {
  if (!forwho || !nemo?.nemoEl) return;

  const { constants, data } = options.registry;
  const { NEMO_RESPONSIVE_LAYOUT, EASE, TIMING_CFG } = constants;
  const FORWHO_FRAME = NEMO_RESPONSIVE_LAYOUT.FORWHO_FRAME;
  
  const start = L[STAGES.TO_FORWHO];        
  const end = L[STAGES.FW_TO_STORY];         
  
  const mode = options.isMobileView ? 'MOBILE' : 
               options.isTabletPortrait ? 'TABLET_P' : 'PC';
               
  const r = TIMING_CFG.TRANSITION_FINISH_RATIO;
  const isTouch = options.interactionMode === 'touch';
  
  const duration = (end - start);
  const effectiveEnd = start + duration * (isTouch ? 0.35 : 0.6);
  const effectiveDuration = (effectiveEnd - start);

  const introRatio = isTouch ? 0.03 : 0.25;
  const introEnd = start + (effectiveDuration * introRatio); 
  const frameMorphStart = introEnd;

  // STEP B: Intro Reveal
  const t = TIMING_CFG.TRANSITION_WEIGHT;
  const revealDuration = isTouch ? (0.25 * r) : (0.5 * r);
  const revealStartOffset = isTouch ? 0 : (t * r * 0.5);

  if (forwho.introTextRef.current) {
    tl.to(forwho.introTextRef.current, {
      opacity: 1,
      y: 0,
      duration: revealDuration,
      ease: 'power2.out'
    }, start + revealStartOffset);

    tl.call(() => {
      forwho.resetCards();
    }, [], start);
  }

  // STEP C: Carousel Transformation
  const frame = FORWHO_FRAME[mode];

  tl.to(nemo.nemoEl, {
    width: () => (getForWhoTargetRect()?.width ?? frame.w) - 2,
    height: () => (getForWhoTargetRect()?.height ?? frame.h) - 2,
    left: () => (getForWhoTargetRect()?.left ?? frame.left) + 1,
    top: () => (getForWhoTargetRect()?.top ?? frame.top) + 1,
    borderRadius: frame.borderRadius,
    duration: (effectiveEnd - frameMorphStart) * r,
    ease: EASE.TRANSITION
  }, frameMorphStart);

  if (nemo.imageEl) {
    const morphDuration = (effectiveEnd - frameMorphStart) * r;
    const distortionStart = frameMorphStart + (morphDuration * 0.7); 
    const distortionDuration = morphDuration * 0.3; 

    tl.to(nemo.imageEl, {
      skewX: isTouch ? 50 : 60, 
      scaleX: isTouch ? 2.0 : 2.5, 
      filter: isTouch ? 'blur(1px)' : 'blur(2px)', 
      duration: distortionDuration,
      ease: isTouch ? 'none' : 'power2.in' 
    }, distortionStart);

    const swapPoint = distortionStart + distortionDuration + 0.03;
    
    tl.to([nemo.nemoEl, nemo.imageEl], { 
      autoAlpha: 0, 
      duration: 0.3,
      ease: 'power2.in',
      immediateRender: false 
    }, swapPoint);

    if (forwho.contentWrapperRef.current) {
      tl.set(forwho.contentWrapperRef.current, { autoAlpha: 0, transition: 'none', immediateRender: false }, frameMorphStart);
      tl.set(forwho.contentWrapperRef.current, { autoAlpha: 1, transition: 'none', immediateRender: false }, swapPoint - 0.2); 
    }
  }

  if (forwho.introTextRef.current) {
    tl.to(forwho.introTextRef.current, {
      top: '12%', 
      left: mode === 'PC' ? '14%' : '5%',
      x: 0,
      scale: 0.6,
      opacity: 0.8,
      duration: (effectiveEnd - frameMorphStart) * r,
      ease: EASE.TRANSITION
    }, frameMorphStart);
  }

  // STEP D & E: [V12 Unified] Carousel Lifecycle & Philosophy Reveal + Finale
  if (forwho.contentWrapperRef.current && forwho.philosophyRef.current) {
    const totalPhaseDuration = (end - effectiveEnd);
    
    // D-1. 카드 등장 (Reveal)
    const revealPhaseStart = effectiveEnd;
    const revealPhaseDuration = totalPhaseDuration * 0.15;
    
    tl.to(forwho.contentWrapperRef.current, {
      autoAlpha: 1,
      pointerEvents: 'auto',
      yPercent: 0, 
      duration: revealPhaseDuration,
      ease: 'power2.out'
    }, revealPhaseStart);

    // D-2. 카드 퇴장 (Exit) & 문구 노출 (Philosophy Reveal)
    const exitStart = effectiveEnd + totalPhaseDuration * 0.25;
    const exitDuration = totalPhaseDuration * 0.45;

    tl.to(forwho.contentWrapperRef.current, {
      yPercent: -150,
      force3D: true,
      duration: exitDuration,
      ease: 'none' 
    }, exitStart);

    if (forwho.introTextRef.current) {
      tl.to(forwho.introTextRef.current, {
        yPercent: -150,
        opacity: 0,
        duration: exitDuration,
        ease: 'none'
      }, exitStart);
    }

    tl.to(forwho.philosophyRef.current, {
      autoAlpha: 1,
      duration: exitDuration * 0.5,
      ease: 'none'
    }, exitStart);

    // E. 피날레 (Finale): 철학 문구 퇴장 및 로고 전환
    const finaleStart = exitStart + exitDuration + totalPhaseDuration * 0.1;
    const finaleDuration = totalPhaseDuration * 0.2;

    // 철학 문구 상단 퇴장
    tl.to(forwho.philosophyRef.current, {
      yPercent: -100,
      autoAlpha: 0,
      duration: finaleDuration,
      ease: 'power2.inOut'
    }, finaleStart);

    // 문구 올라가는 시점에 로고 전격 교체 (REC+ANGLE -> 네모:ON)
    if (toggle) {
      tl.call(() => {
        toggle();
      }, [], finaleStart);
    }

    // 섹션 이탈 시 최종 리셋
    tl.call(() => {
      forwho.resetCards();
    }, [], end);
  }
}
