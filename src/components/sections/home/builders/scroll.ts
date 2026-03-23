import { gsap } from 'gsap';
import { 
  TIMING_CFG, EASE, SECTION_SCROLL_HEIGHT, STAGES 
} from '@/constants/interaction';

/**
 * 섹션 스크롤링 타임라인 빌더
 */
export function buildSectionScrollTimeline(tl: gsap.core.Timeline, L: Record<string, number>, finalY: number) {
  const target = '#sections-content-wrapper';
  const t = TIMING_CFG.TRANSITION_WEIGHT;
  const H = SECTION_SCROLL_HEIGHT;

  gsap.set('#home-stage', { minHeight: '100vh' });
  gsap.set(target, { position: 'absolute', top: 0, left: 0, width: '100vw' });

  tl.to(target, {
    y: `-${H.HERO}vh`,
    duration: t,
    ease: EASE.TRANSITION
  }, L[STAGES.START_TO_PAIN]);

  tl.to(target, {
    y: `-${H.HERO + H.PAIN}vh`,
    duration: t,
    ease: EASE.TRANSITION
  }, L[STAGES.TO_MESSAGE]);

  tl.to(target, {
    y: `-${H.HERO + H.PAIN + H.MESSAGE}vh`,
    duration: t,
    ease: EASE.TRANSITION
  }, L[STAGES.TO_FORWHO]);

  tl.to(target, {
    y: `-${H.HERO + H.PAIN + H.MESSAGE + H.FORWHO}vh`, 
    duration: t,
    ease: EASE.TRANSITION
  }, L[STAGES.TO_STORY]);

  tl.to(target, {
    y: `-${H.HERO + H.PAIN + H.MESSAGE + H.FORWHO + H.STORY}vh`,
    duration: t,
    ease: EASE.TRANSITION
  }, L[STAGES.TO_CTA]);

  tl.to(target, {
    y: -finalY,
    duration: t,
    ease: EASE.TRANSITION
  }, L[STAGES.TO_FOOTER]);
}
