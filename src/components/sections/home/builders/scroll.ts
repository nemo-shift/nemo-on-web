import { gsap } from 'gsap';
import { GlobalBuilderOptions } from '../types';

/**
 * 섹션 스크롤링 타임라인 빌더
 */
export function buildSectionScrollTimeline(
  tl: gsap.core.Timeline, 
  L: Record<string, number>, 
  finalY: number, 
  options: GlobalBuilderOptions
) {
  const { STAGES, TIMING_CFG, EASE, SECTION_SCROLL_HEIGHT } = options.registry.constants;
  const { LOGO_JOURNEY_SECTIONS, JOURNEY_MASTER_CONFIG } = options.registry.data;
  const target = '#sections-content-wrapper';
  if (typeof document !== 'undefined' && !document.querySelector(target)) return;
  const t = TIMING_CFG.TRANSITION_WEIGHT;
  const H = SECTION_SCROLL_HEIGHT;

  gsap.set('#home-stage', { minHeight: '100vh' });
  gsap.set(target, { position: 'absolute', top: 0, left: 0, width: '100vw' });

  // [V11.41] Phase 2: 히어로 콘텐츠 패러랙스 상승 (무대 비우기)
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

  // 최종 푸터 리빌
  tl.to(target, {
    y: -finalY,
    duration: t,
    ease: EASE.TRANSITION
  }, L[STAGES.TO_FOOTER]);

  // [V11.18 통합] 전역 배경색 및 헤더색 전이 엔진
  const heroCfg = JOURNEY_MASTER_CONFIG[STAGES.HERO];
  let lastEnv = heroCfg.on?.env || heroCfg.env;
  const r = TIMING_CFG.TRANSITION_FINISH_RATIO;

  LOGO_JOURNEY_SECTIONS.forEach(({ label, stage }: { label: string, stage: string }) => {
    const raw = JOURNEY_MASTER_CONFIG[stage];
    if (!raw) return;
    const cfg = options.isMobileView && raw.mobile ? { ...raw, ...raw.mobile } : raw;
    const time = L[label];

    if (label === STAGES.START_TO_PAIN) {
      tl.set(document.documentElement, {
        '--bg': lastEnv.bg,
        '--header-fg': lastEnv.fg
      }, 0);
    }

    let transitionCfg = cfg;
    if (label === STAGES.PAIN_TO_MSG) {
      transitionCfg = JOURNEY_MASTER_CONFIG[STAGES.TO_MESSAGE];
    }

    tl.fromTo(document.documentElement, 
      {
        '--header-fg': lastEnv.fg,
        '--bg': lastEnv.bg
      },
      {
        '--header-fg': transitionCfg.env.fg!,
        '--bg': transitionCfg.env.bg!,
        duration: (label === STAGES.PAIN_TO_MSG || label === STAGES.TO_MESSAGE) ? 1.5 * r : t * r,
        ease: 'none',
        immediateRender: false
      }, 
      time
    );

    if (transitionCfg.env.fg && transitionCfg.env.bg) {
      lastEnv = { fg: transitionCfg.env.fg, bg: transitionCfg.env.bg };
    }
  });
}
