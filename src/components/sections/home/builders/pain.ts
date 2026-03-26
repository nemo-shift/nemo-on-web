import { gsap } from 'gsap';
import { 
  COLORS, STAGES, TIMING_CFG, EASE 
} from '@/constants/interaction';
import { JOURNEY_MASTER_CONFIG } from '@/data/home/journey';
import { PAIN_POINTS, RESONANCE_MESSAGE } from '@/data/home/pain';
import { NEMO_JOURNEY_SECTIONS } from '../journey-data';
import { SharedNemoHandle } from '../SharedNemo';
import { FallingKeywordsHandle } from '../FallingKeywordsStage';

/**
 * 네모(Nemo) 및 콘텐츠 타임라인 빌더
 */
export function buildNemoTimeline(
  tl: gsap.core.Timeline, 
  nemo: SharedNemoHandle, 
  device: { isMobile: boolean; isTablet: boolean }, 
  falling: FallingKeywordsHandle, 
  L: Record<string, number>
) {
  const el = nemo.nemoEl!;
  const t = TIMING_CFG.TRANSITION_WEIGHT;
  const r = TIMING_CFG.TRANSITION_FINISH_RATIO;

  tl.to(['.hero-content-layer', '.hero-bottom-bar', '#hero-nemo-origin'], {
    opacity: 0, visibility: 'hidden', duration: t * 0.5, ease: EASE.FADE
  }, L[STAGES.START_TO_PAIN]);

  const sections = NEMO_JOURNEY_SECTIONS;

  sections.forEach(({ label, stage, ease }) => {
    const raw = JOURNEY_MASTER_CONFIG[stage];
    if (!raw) return;
    
    let cfg = raw.nemo;
    if (device.isMobile && raw.mobile?.nemo) {
      cfg = { ...cfg, ...raw.mobile.nemo };
    } else if (device.isTablet && raw.tablet?.nemo) {
      cfg = { ...cfg, ...raw.tablet.nemo };
    }
    
    const time = L[label];

    tl.to(el, {
      width: cfg.width,
      height: cfg.height,
      borderRadius: cfg.borderRadius,
      backgroundColor: cfg.backgroundColor,
      border: cfg.border,
      left: cfg.left,
      top: cfg.top,
      opacity: cfg.opacity,
      duration: (label === STAGES.TO_PAIN) ? 0.4 * r : t * r,
      ease: ease
    }, time);
  });

  const step = nemo.stepEl, line = nemo.lineEl, content = nemo.contentEl;
  
  const waitOffset = 0.4 * r;
  const painDuration = (L[STAGES.PAIN_CONTENT] - (L[STAGES.TO_PAIN] + waitOffset));
  const itemGap = painDuration / PAIN_POINTS.length;

  tl.to('#pain-scroll-hint', { opacity: 1, duration: 0.2 }, L[STAGES.TO_PAIN] + waitOffset);

  PAIN_POINTS.forEach((point, i) => {
    const startTime = L[STAGES.TO_PAIN] + waitOffset + (i * itemGap);
    
    if (i > 0) {
      tl.to([step, content], { opacity: 0, x: -20, duration: 0.2 }, startTime - 0.2);
    }

    tl.set(step, { textContent: `STEP 0${point.id}`, opacity: 0, x: 100 }, startTime);
    tl.set(content, { textContent: point.text, opacity: 0, x: 100 }, startTime);
    
    tl.to([step, content], { opacity: 1, x: 0, duration: 0.5, ease: 'power2.out' }, startTime);
    
    tl.fromTo(line, 
      { scaleX: 0, opacity: 0, x: 100 }, 
      { scaleX: 1, opacity: 0.9, x: 0, duration: 0.5, ease: 'power2.out' }, 
      startTime
    );
    
    point.keywords.forEach((kw, kwIdx) => {
      tl.to({}, { 
        duration: 0.001, 
        onStart: () => falling.addKeyword(kw), 
        onReverseComplete: () => falling.popKeyword(kw) 
      }, startTime + 0.2 + (kwIdx * 0.02));
    });

    if (i < PAIN_POINTS.length - 1) {
      tl.to(line, { opacity: 0, duration: 0.2 }, startTime + itemGap - 0.2);
    }
  });

  const bridgeItems = RESONANCE_MESSAGE.bridge;
  const bridgeDuration = L[STAGES.PAIN_SHIFT] - L[STAGES.PAIN_CONTENT];
  const bridgeGap = bridgeDuration / bridgeItems.length;

  tl.to([step, line], { opacity: 0, duration: 0.2 }, L[STAGES.PAIN_CONTENT]);

  bridgeItems.forEach((text, i) => {
    const startTime = L[STAGES.PAIN_CONTENT] + (i * bridgeGap);
    tl.set(content, { textContent: text, opacity: 0 }, startTime);
    tl.to(content, { opacity: 1, duration: 0.2 }, startTime);
    tl.to(content, { opacity: 0, duration: 0.1 }, startTime + bridgeGap - 0.1);
  });

  tl.to({}, { 
    duration: 0.1, 
    onStart: () => {
      falling.dropAll();
    },
    onReverseComplete: () => {
      falling.magneticReset();
    }
  }, L[STAGES.PAIN_SHIFT]);

  tl.to(el, {
    left: '50%',
    backgroundColor: '#F7F4F0',
    border: 'none',
    duration: 0.6,
    ease: EASE.TRANSITION
  }, L[STAGES.PAIN_SHIFT] + 0.1);

  tl.set(content, { textContent: RESONANCE_MESSAGE.main, color: COLORS.TEXT.DARK, fontWeight: '700', opacity: 0, y: 20 }, L[STAGES.RESONANCE]);
  tl.to(content, { opacity: 1, y: 0, duration: 0.4 }, L[STAGES.RESONANCE]);

  tl.to(content, { opacity: 0, duration: 0.2 }, L[STAGES.RESONANCE] + TIMING_CFG.SECTION_WEIGHT.RESONANCE_STILL - 0.2);

  
  if (nemo.imageEl) tl.to(nemo.imageEl, { opacity: 1, duration: 0.5 }, L[STAGES.TO_FORWHO] + 0.2);
}
