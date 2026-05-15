import { gsap } from 'gsap';
import { GlobalBuilderOptions } from '../types';

export const buildStoryTimeline = (
  tl: gsap.core.Timeline,
  L: Record<string, number>,
  options: GlobalBuilderOptions
) => {
  const { STAGES, TIMING_CFG } = options.registry.constants;
  const isTouch = options.interactionMode === 'touch';
  const w = isTouch ? TIMING_CFG.SECTION_WEIGHT.STORY_STILL_TOUCH : TIMING_CFG.SECTION_WEIGHT.STORY_STILL;
  const start = L[STAGES.TO_STORY];
  const step = w / 6;
  const { isMobileView } = options;

  const fadeOut = { opacity: 0, y: -20, duration: step * 0.4, ease: 'power2.in' };
  const fadeIn = { opacity: 1, y: 0, duration: step * 0.6, ease: 'power2.out' };

  const p1Pos = isMobileView ? { x: 0, y: '-14vh' } : { x: '-5vw', y: '-12vh' };
  tl.fromTo('#story-paragraph-1', { opacity: 0, ...p1Pos, y: parseFloat(p1Pos.y) + 5 + 'vh' }, { opacity: 1, ...p1Pos, duration: step * 0.6, ease: 'power2.out' }, start + 0.2);

  const p2Start = start + step;
  const p2Pos = isMobileView ? { x: 0, y: '10vh' } : { x: '5vw', y: '8vh' };
  tl.fromTo('#story-paragraph-2', { opacity: 0, ...p2Pos, y: parseFloat(p2Pos.y) - 5 + 'vh' }, { opacity: 1, ...p2Pos, duration: step * 0.6, ease: 'power2.out' }, p2Start + step * 0.2);

  const p3Start = start + step * 2.7;
  tl.to(['#story-paragraph-1', '#story-paragraph-2'], fadeOut, p3Start);

  if (isMobileView) {
    tl.fromTo('#story-bg-white', { opacity: 1, yPercent: -100, xPercent: 0 }, { yPercent: -50, duration: step * 0.6, ease: 'power3.inOut' }, p3Start);
    tl.fromTo('#story-paragraph-3', { opacity: 0, y: '33vh', x: 0 }, { opacity: 1, y: '25vh', x: 0, duration: step * 0.6, ease: 'power2.out' }, p3Start + step * 0.2);
  } else {
    tl.fromTo('#story-bg-white', { opacity: 1, xPercent: -100, yPercent: 0 }, { xPercent: -50, duration: step * 0.6, ease: 'power3.inOut' }, p3Start);
    tl.fromTo('#story-paragraph-3', { opacity: 0, x: '33vw', y: 0 }, { opacity: 1, x: '25vw', y: 0, duration: step * 0.6, ease: 'power2.out' }, p3Start + step * 0.2);
  }

  const p4Start = start + step * 3.7;
  tl.to('#story-paragraph-3', fadeOut, p4Start);
  if (isMobileView) {
    tl.fromTo('#story-paragraph-4', { opacity: 0, y: '33vh', x: 0 }, { opacity: 1, y: '25vh', x: 0, duration: step * 0.6, ease: 'power2.out' }, p4Start + step * 0.2);
  } else {
    tl.fromTo('#story-paragraph-4', { opacity: 0, x: '33vw', y: 0 }, { opacity: 1, x: '25vw', y: 0, duration: step * 0.6, ease: 'power2.out' }, p4Start + step * 0.2);
  }

  const p5Start = start + step * 4.7;
  tl.to('#story-paragraph-4', fadeOut, p5Start);
  if (isMobileView) {
    tl.to('#story-bg-white', { yPercent: 50, duration: step * 0.8, ease: 'power3.inOut' }, p5Start);
    tl.fromTo('#story-paragraph-5', { opacity: 0, y: '-17vh' }, { opacity: 1, y: '-25vh', duration: step * 0.6, ease: 'power2.out' }, p5Start + step * 0.2);
  } else {
    tl.to('#story-bg-white', { xPercent: 50, duration: step * 0.8, ease: 'power3.inOut' }, p5Start);
    tl.fromTo('#story-paragraph-5', { opacity: 0, x: '-33vw', y: 0 }, { opacity: 1, x: '-25vw', y: 0, duration: step * 0.6, ease: 'power2.out' }, p5Start + step * 0.2);
  }

  const p6Start = start + step * 5.7;
  tl.to('#story-paragraph-5', fadeOut, p6Start);
  tl.to('#story-bg-white', { opacity: 0, duration: step * 0.6, ease: 'power2.inOut' }, p6Start);
  tl.set('#story-text-6', { color: '#FFFFFF' }, p6Start);
  tl.to('#story-paragraph-6', fadeIn, p6Start + step * 0.2);

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
