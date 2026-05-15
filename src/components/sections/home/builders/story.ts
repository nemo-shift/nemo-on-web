import { gsap } from 'gsap';
import { GlobalBuilderOptions } from '../types';

/**
 * [V12.Story] Brand Story 6-Step Sequence Builder
 * 1. Solid(Teal) -> 2. Split(White/Teal) -> 3. Reverse Split(Teal/White) -> 4. Solid(Teal)
 */
export const buildStoryTimeline = (
  tl: gsap.core.Timeline,
  L: Record<string, number>,
  options: GlobalBuilderOptions
) => {
  const { STAGES, TIMING_CFG } = options.registry.constants;
  const isTouch = options.interactionMode === 'touch';
  const w = isTouch ? TIMING_CFG.SECTION_WEIGHT.STORY_STILL_TOUCH : TIMING_CFG.SECTION_WEIGHT.STORY_STILL;
  const start = L[STAGES.TO_STORY];
  const step = w / 10.0; // [V66.UX] Expanded divisor for maximum stay time (7.5 -> 10.0)
  const { isMobileView, isTabletPortrait } = options;

  // Common Animation Options
  const fadeOut = { opacity: 0, y: -20, duration: step * 0.4, ease: 'power2.in' };
  const fadeIn = { opacity: 1, y: 0, duration: step * 0.6, ease: 'power2.out' };

  // ─────────────────────────────────────────────
  // Phase 1-1: Group 1 First (Zigzag Layout)
  // ─────────────────────────────────────────────
  const p1Pos = isTabletPortrait
    ? { x: '-2vw', y: '-14vh' } // 태블릿 세로: 중앙 정렬
    : isMobileView 
      ? { x: 0, y: '-14vh' } 
      : { x: '-5vw', y: '-12vh' };

  tl.fromTo('#story-paragraph-1', 
    { opacity: 0, ...p1Pos, y: parseFloat(p1Pos.y as string) + 5 + 'vh' },
    { opacity: 1, ...p1Pos, duration: step * 0.6, ease: 'power2.out' },
    start + 0.2
  );

  // ─────────────────────────────────────────────
  // Phase 1-2: Group 1 Second (Cumulative Zigzag)
  // ─────────────────────────────────────────────
  const p2Start = start + step;
  const p2Pos = isTabletPortrait
    ? { x: '2vw', y: '3vh' } // 태블릿 세로: 중앙 정렬 및 상향 배치
    : isMobileView 
      ? { x: 0, y: '4vh' } 
      : { x: '5vw', y: '8vh' };

  tl.fromTo('#story-paragraph-2', 
    { opacity: 0, ...p2Pos, y: parseFloat(p2Pos.y as string) - 5 + 'vh' },
    { opacity: 1, ...p2Pos, duration: step * 0.6, ease: 'power2.out' },
    p2Start + step * 0.2
  );

  // ─────────────────────────────────────────────
  // Phase 2-1: Group 2 First (Split Background Transition)
  // ─────────────────────────────────────────────
  const p3Start = start + step * 2.7; // 1-2 stay time: 1.7 steps
  tl.to(['#story-paragraph-1', '#story-paragraph-2'], fadeOut, p3Start);

  if (isTabletPortrait) {
    tl.fromTo('#story-bg-white', { opacity: 1, yPercent: -100, xPercent: 0 }, { yPercent: -58, duration: step * 0.6, ease: 'power3.inOut' }, p3Start);
    tl.fromTo('#story-paragraph-3', { opacity: 0, y: '16vh', x: 0 }, { opacity: 1, y: '8vh', x: 0, duration: step * 0.6, ease: 'power2.out' }, p3Start + step * 0.2);
  } else if (isMobileView) {
    tl.fromTo('#story-bg-white', { opacity: 1, yPercent: -100, xPercent: 0 }, { yPercent: -58, duration: step * 0.6, ease: 'power3.inOut' }, p3Start);
    tl.fromTo('#story-paragraph-3', { opacity: 0, y: '16vh', x: 0 }, { opacity: 1, y: '8vh', x: 0, duration: step * 0.6, ease: 'power2.out' }, p3Start + step * 0.2);
  } else {
    tl.fromTo('#story-bg-white', { opacity: 1, xPercent: -100, yPercent: 0 }, { xPercent: -50, duration: step * 0.6, ease: 'power3.inOut' }, p3Start);
    tl.fromTo('#story-paragraph-3', { opacity: 0, x: '25vw', y: '5vh' }, { opacity: 1, x: '25vw', y: '-3vh', duration: step * 0.6, ease: 'power2.out' }, p3Start + step * 0.2);
  }

  // ─────────────────────────────────────────────
  // Phase 2-2: Group 2 Second (Static Background, Text Swap)
  // ─────────────────────────────────────────────
  const p4Start = start + step * 4.4; // 2-1 stay time: 1.7 steps
  tl.to('#story-paragraph-3', fadeOut, p4Start);
  
  if (isTabletPortrait) {
    tl.fromTo('#story-paragraph-4', { opacity: 0, y: '7vh', x: 0 }, { opacity: 1, y: '15vh', x: 0, duration: step * 0.6, ease: 'power2.out' }, p4Start + step * 0.2);
  } else if (isMobileView) {
    tl.fromTo('#story-paragraph-4', { opacity: 0, y: '7vh', x: 0 }, { opacity: 1, y: '15vh', x: 0, duration: step * 0.6, ease: 'power2.out' }, p4Start + step * 0.2);
  } else {
    tl.fromTo('#story-paragraph-4', { opacity: 0, x: '25vw', y: '-5vh' }, { opacity: 1, x: '25vw', y: '3vh', duration: step * 0.6, ease: 'power2.out' }, p4Start + step * 0.2);
  }

  // ─────────────────────────────────────────────
  // Phase 3: Original Group 3 (Reverse Split Transition)
  // ─────────────────────────────────────────────
  const p5Start = start + step * 6.1; // 2-2 stay time: 1.7 steps
  tl.to('#story-paragraph-4', fadeOut, p5Start);

  if (isTabletPortrait) {
    tl.to('#story-bg-white', { yPercent: 50, duration: step * 0.8, ease: 'power3.inOut' }, p5Start);
    tl.fromTo('#story-paragraph-5', { opacity: 0, y: '-17vh', x: 0 }, { opacity: 1, y: '-25vh', x: 0, duration: step * 0.6, ease: 'power2.out' }, p5Start + step * 0.2);
  } else if (isMobileView) {
    tl.to('#story-bg-white', { yPercent: 50, duration: step * 0.8, ease: 'power3.inOut' }, p5Start);
    tl.fromTo('#story-paragraph-5', { opacity: 0, y: '-17vh' }, { opacity: 1, y: '-25vh', duration: step * 0.6, ease: 'power2.out' }, p5Start + step * 0.2);
  } else {
    tl.to('#story-bg-white', { xPercent: 50, duration: step * 0.8, ease: 'power3.inOut' }, p5Start);
    tl.fromTo('#story-paragraph-5', { opacity: 0, x: '-33vw', y: 0 }, { opacity: 1, x: '-25vw', y: 0, duration: step * 0.6, ease: 'power2.out' }, p5Start + step * 0.2);
  }

  // ─────────────────────────────────────────────
  // Phase 4: Original Group 4 (Solid Background Transition)
  // ─────────────────────────────────────────────
  const p6Start = start + step * 7.8; // Phase 3 stay time: 1.7 steps
  tl.to('#story-paragraph-5', fadeOut, p6Start);

  tl.to('#story-bg-white', { opacity: 0, duration: step * 0.6, ease: 'power2.inOut' }, p6Start);
  tl.set('#story-text-6', { color: '#FFFFFF' }, p6Start);
  tl.to('#story-paragraph-6', fadeIn, p6Start + step * 0.2);

  // Phase 4 (ID 6) will stay for 10.0 - 7.8 = 2.2 steps!

  const eraseStart = L[STAGES.STORY_ERASE];
  tl.to('#story-bg-white', {
    backgroundColor: '#0D1A1F',
    opacity: 1,
    xPercent: 0,
    yPercent: 0,
    width: '100%',
    height: '100%',
    duration: 0.1,
    ease: 'none',
    onStart: () => { gsap.set('#story-cursor-6', { display: 'inline-block' }); },
    onReverseComplete: () => { gsap.set('#story-cursor-6', { display: 'none' }); }
  }, eraseStart - 0.2);
};
