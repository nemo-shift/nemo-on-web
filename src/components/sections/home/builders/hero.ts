import { gsap } from 'gsap';
import { 
  LOGO_SIZE, TIMING_CFG, STAGES, EASE 
} from '@/constants/interaction';
import { JOURNEY_MASTER_CONFIG } from '@/data/home/journey';
import { LOGO_JOURNEY_SECTIONS } from '../journey-data';
import { JourneyLogoHandle } from '../JourneyLogo';
import { SharedNemoHandle } from '../SharedNemo';

/**
 * 히어로 네모와 공유 네모 간의 교체 시퀀스 [Step 4-3]
 */
export function buildHeroSwapSequence(tl: gsap.core.Timeline, nemo: SharedNemoHandle) {
  const originEl = document.getElementById('hero-nemo-origin');
  const originText = originEl?.querySelector('span');
  if (!originEl) return;

  tl.set([originEl, originText, nemo.nemoEl], { transition: 'none' }, 0);
  tl.to(originEl, { backgroundColor: 'transparent', borderColor: 'transparent', boxShadow: 'none', duration: 0.1 }, 0);
  tl.to(nemo.nemoEl, { opacity: 1, duration: 0.01 }, 0);
  if (originText) tl.to(originText, { opacity: 0, y: -15, duration: 0.1 }, 0);
}

/**
 * 로고 애니메이션 타임라인 빌더
 */
export function buildLogoTimeline(tl: gsap.core.Timeline, logo: JourneyLogoHandle, isMobile: boolean, L: Record<string, number>) {
  const bigScale = isMobile ? LOGO_SIZE.BIG_SCALE_MOBILE : LOGO_SIZE.BIG_SCALE;
  
  tl.set(logo.containerEl, { scale: bigScale, x: 0, y: 0 }, 0);

  const headerScale = LOGO_SIZE.HEADER_SCALE;
  const t = TIMING_CFG.TRANSITION_WEIGHT;
  const r = TIMING_CFG.TRANSITION_FINISH_RATIO;
  
  const sections = LOGO_JOURNEY_SECTIONS;

  sections.forEach(({ label, stage }) => {
    const raw = JOURNEY_MASTER_CONFIG[stage];
    if (!raw) return;
    const cfg = isMobile && raw.mobile ? { ...raw, ...raw.mobile } : raw;
    const time = L[label];

    tl.to(document.documentElement, {
      '--header-fg': cfg.env.fg,
      '--bg': cfg.env.bg,
      duration: t * r
    }, time);

    tl.to(logo.nemoKrEl, { opacity: cfg.logo.nemoKr ? 1 : 0, duration: 0.2 }, time);
    tl.to([logo.shapesEl, logo.statusEl], { 
      opacity: cfg.logo.status ? 1 : 0, 
      visibility: cfg.logo.status ? 'visible' : 'hidden', 
      duration: 0.2 
    }, time);
    tl.to(logo.rectangleEl, { 
      opacity: cfg.logo.rectangle ? 1 : 0, 
      visibility: cfg.logo.rectangle ? 'visible' : 'hidden', 
      duration: 0.2 
    }, time);

    if (logo.tLines.h && logo.tLines.v) {
      const isPlus = cfg.logo.morph === '+';
      tl.to(logo.tLines.h, { top: isPlus ? '12px' : '4px', duration: 0.2 }, time);
    }
  });

  tl.to(logo.containerEl, {
    scale: headerScale, x: 0, y: 0, duration: t * r, ease: EASE.TRANSITION
  }, L[STAGES.START_TO_PAIN]);
}
