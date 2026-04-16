import { gsap } from 'gsap';
import { 
  TIMING_CFG, EASE, SECTION_SCROLL_HEIGHT, STAGES 
} from '@/constants/interaction';
import { GlobalBuilderOptions } from '../types';
import { LOGO_JOURNEY_SECTIONS } from '@/data/home/interaction-journey';
import { JOURNEY_MASTER_CONFIG } from '@/data/home/journey';

/**
 * 섹션 스크롤링 타임라인 빌더
 */
export function buildSectionScrollTimeline(
  tl: gsap.core.Timeline, 
  L: Record<string, number>, 
  finalY: number,
  options: GlobalBuilderOptions
) {
  const target = '#sections-content-wrapper';
  if (typeof document !== 'undefined' && !document.querySelector(target)) return;
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

  // [V11.18 통합] 전역 배경색 및 헤더색 전이 엔진
  // 로고 빌더에서 분리하여 섹션 인터랙션과 동기화된 중앙 집중 제어 체계를 확립합니다.
  let lastEnv = JOURNEY_MASTER_CONFIG[STAGES.HERO].on?.env || JOURNEY_MASTER_CONFIG[STAGES.HERO].env;
  const r = TIMING_CFG.TRANSITION_FINISH_RATIO;

  LOGO_JOURNEY_SECTIONS.forEach(({ label, stage }) => {
    const raw = JOURNEY_MASTER_CONFIG[stage];
    if (!raw) return;
    const cfg = options.isMobileView && raw.mobile ? { ...raw, ...raw.mobile } : raw;
    const time = L[label];

    // [V11.19 Fix] 히어로 섹션 역방향 스크롤 무결성 확보 (State Lock)
    // 타임라인이 시작되는 0 지점에서 히어로의 초기 색상을 강제로 잠금하여, 
    // 스크롤을 다시 올릴 때 색상이 유실되거나 공백 상태가 되는 현상을 방지합니다.
    if (label === STAGES.START_TO_PAIN) {
      tl.set(document.documentElement, {
        '--bg': lastEnv.bg,
        '--header-fg': lastEnv.fg
      }, 0);
    }

    // [V11.56 Sync] 배경색 및 로고 전이 타이밍 동기화 (PAIN_TO_MSG 브릿지 대응)
    let transitionCfg = cfg;
    if (label === STAGES.PAIN_TO_MSG) {
      transitionCfg = JOURNEY_MASTER_CONFIG[STAGES.TO_MESSAGE];
    }

    // [전역 색상 전이] fromTo를 사용하여 현재 위치에 맞는 색상을 강제 고정
    // 이를 통해 리사이즈 후 타임라인 복구 시 해당 위치의 배경색이 즉시 복원됨.
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
