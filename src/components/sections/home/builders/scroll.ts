import { gsap } from 'gsap';
import { GlobalBuilderOptions } from '../types';

/**
 * 섹션 스크롤링 타임라인 빌더
 */
/**
 * [V11.Macro_Final_Refine] buildSectionScrollTimeline
 * 섹션 이동 및 무대 환경(배경색, 헤더색) 제어권을 완전히 통합 관리합니다.
 */
export function buildSectionScrollTimeline(
  tl: gsap.core.Timeline, 
  L: Record<string, number>, 
  finalY: number, 
  options: GlobalBuilderOptions
) {
  const { constants, data } = options.registry;
  const { STAGES, TIMING_CFG, EASE, SECTION_SCROLL_HEIGHT } = constants;
  const { LOGO_JOURNEY_SECTIONS, JOURNEY_MASTER_CONFIG } = data;
  
  const target = '#sections-content-wrapper';
  if (typeof document !== 'undefined' && !document.querySelector(target)) return;

  const t = TIMING_CFG.TRANSITION_WEIGHT;
  const r = TIMING_CFG.TRANSITION_FINISH_RATIO;
  const H = SECTION_SCROLL_HEIGHT;

  // 1. 기초 레이아웃 영점 보정
  gsap.set('#home-stage', { minHeight: '100vh' });
  gsap.set(target, { position: 'absolute', top: 0, left: 0, width: '100vw' });

  // 2. 히어로 콘텐츠 패러랙스 상승 (무대 비우기)
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

  // 3. 섹션별 물리적 스크롤 이동 (VHS 기반)
  tl.to(target, { y: `-${H.HERO}vh`, duration: t, ease: EASE.TRANSITION }, L[STAGES.START_TO_PAIN]);
  tl.to(target, { y: `-${H.HERO + H.PAIN}vh`, duration: t, ease: EASE.TRANSITION }, L[STAGES.TO_MESSAGE]);

  // [V18.Audit] 퍼널 조립 중에는 배경 고정, 팽창 시점에 맞춰 포후 섹션으로 전이
  const expandDuration = L[STAGES.TO_FORWHO] - L[STAGES.CORE_FUNNEL_EXPAND];
  tl.to(target, { 
    y: `-${H.HERO + H.PAIN + H.MESSAGE}vh`, 
    duration: expandDuration, 
    ease: EASE.TRANSITION 
  }, L[STAGES.CORE_FUNNEL_EXPAND]);

  tl.to(target, { y: `-${H.HERO + H.PAIN + H.MESSAGE + H.FORWHO}vh`, duration: t, ease: EASE.TRANSITION }, L[STAGES.TO_STORY]);
  tl.to(target, { y: `-${H.HERO + H.PAIN + H.MESSAGE + H.FORWHO + H.STORY}vh`, duration: t, ease: EASE.TRANSITION }, L[STAGES.TO_CTA]);
  tl.to(target, { y: -finalY, duration: t, ease: EASE.TRANSITION }, L[STAGES.TO_FOOTER]);

  // 4. [V11.Macro_Final] 전역 환경(배경색/헤더색) 통합 엔진
  const heroCfg = JOURNEY_MASTER_CONFIG[STAGES.HERO];
  let lastEnv = (options.isOn && heroCfg.on?.env) ? heroCfg.on.env : heroCfg.env;

  // 초기 상태 강제 주입
  tl.set(document.documentElement, {
    '--bg': lastEnv.bg,
    '--header-fg': lastEnv.fg
  }, 0);

  LOGO_JOURNEY_SECTIONS.forEach(({ label, stage }: { label: string, stage: string }) => {
    const raw = JOURNEY_MASTER_CONFIG[stage];
    if (!raw) return;
    const cfg = options.isMobileView && raw.mobile ? { ...raw, ...raw.mobile } : raw;
    const time = L[label];

    // 포인트 구간별 환경 데이터 수립
    let targetEnv = cfg.env;
    if (label === STAGES.PAIN_TO_MSG) {
      targetEnv = JOURNEY_MASTER_CONFIG[STAGES.TO_MESSAGE].env;
    }

    // 환경 전이 (CSS 변수)
    tl.fromTo(document.documentElement, 
      { '--header-fg': lastEnv.fg, '--bg': lastEnv.bg },
      {
        '--header-fg': targetEnv.fg!,
        '--bg': targetEnv.bg!,
        duration: (label === STAGES.PAIN_TO_MSG || label === STAGES.TO_MESSAGE) ? 1.5 * r : t * r,
        ease: 'none',
        immediateRender: false
      }, 
      time
    );

    lastEnv = { fg: targetEnv.fg!, bg: targetEnv.bg! };
  });
}

