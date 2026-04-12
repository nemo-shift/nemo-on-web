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

  // [V11.41] Phase 2: 히어로 콘텐츠 패러랙스 상승 (무대 비우기)
  // [V11.51 Fix] 조건부 렌더링 요소를 위한 안전 장치 추가: 요소가 존재할 때만 애니메이션 적용
  const heroTargets = typeof document !== 'undefined' 
    ? Array.from(document.querySelectorAll('#hero-on-center-phrase, #hero-on-center-stage'))
    : [];

  if (heroTargets.length > 0) {
    tl.to(heroTargets, {
      y: -150,
      duration: L[STAGES.HERO_STILL_END] - L[STAGES.HERO_STILL_CONTENT_RISE],
      ease: EASE.TRANSITION
    }, L[STAGES.HERO_STILL_CONTENT_RISE]);
  }

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
