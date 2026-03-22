import { gsap } from 'gsap';
import { 
  COLORS, STAGES, TIMING_CFG, LOGO_SIZE, EASE, SECTION_SCROLL_HEIGHT, 
} from '@/constants/interaction';
import { JOURNEY_MASTER_CONFIG } from '@/data/home/journey';
import { PAIN_POINTS, RESONANCE_MESSAGE, MESSAGE_SECTION_GROUPS } from '@/data/homeContent';
import { LOGO_JOURNEY_SECTIONS, NEMO_JOURNEY_SECTIONS } from './journey-data';
import { JourneyLogoHandle } from './JourneyLogo';
import { SharedNemoHandle } from './SharedNemo';
import { FallingKeywordsHandle } from './FallingKeywordsStage';

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
  // [V26.00] window.innerWidth 직접 참조 제거 계획에 따라 isMobile 기반으로 변경 (SSOT 준수)
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

/**
 * 네모(Nemo) 및 콘텐츠 타임라인 빌더
 */
export function buildNemoTimeline(tl: gsap.core.Timeline, nemo: SharedNemoHandle, isMobile: boolean, falling: FallingKeywordsHandle, L: Record<string, number>) {
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
    const cfg = isMobile && raw.mobile?.nemo ? { ...raw.nemo, ...raw.mobile.nemo } : raw.nemo;
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
  const painDuration = L[STAGES.PAIN_CONTENT] - L[STAGES.TO_PAIN];
  const itemGap = painDuration / PAIN_POINTS.length;

  tl.to('#pain-scroll-hint', { opacity: 1, duration: 0.2 }, L[STAGES.TO_PAIN]);

  PAIN_POINTS.forEach((point, i) => {
    const startTime = L[STAGES.TO_PAIN] + (i * itemGap);
    tl.set(step, { textContent: `STEP 0${point.id}`, opacity: 0 }, startTime);
    tl.set(content, { textContent: point.text, opacity: 0 }, startTime);
    tl.to([step, content], { opacity: 1, duration: 0.2 }, startTime);
    tl.to(line, { scaleX: 1, opacity: 0.3, duration: 0.2 }, startTime);
    
    point.keywords.forEach((kw, kwIdx) => {
      tl.to({}, { duration: 0.001, onStart: () => falling.addKeyword(kw), onReverseComplete: () => falling.popKeyword(kw) }, startTime + 0.1 + (kwIdx * 0.02));
    });

    if (i < PAIN_POINTS.length - 1) {
      tl.to([step, content], { opacity: 0, duration: 0.1 }, startTime + itemGap - 0.1);
    }
  });

  tl.to([step, line], { opacity: 0, duration: 0.2 }, L[STAGES.PAIN_CONTENT]);
  tl.to({}, { duration: 0.1, onStart: () => falling.dropAll() }, L[STAGES.PAIN_CONTENT] + 0.2);

  tl.set(content, { textContent: RESONANCE_MESSAGE.main, color: COLORS.TEXT.DARK, fontWeight: '700', opacity: 0, y: 20 }, L[STAGES.RESONANCE]);
  tl.to(content, { opacity: 1, y: 0, duration: 0.4 }, L[STAGES.RESONANCE]);

  tl.to(content, { opacity: 0, duration: 0.2 }, L[STAGES.RESONANCE] + TIMING_CFG.SECTION_WEIGHT.RESONANCE_STILL - 0.2);

  MESSAGE_SECTION_GROUPS.forEach((text, i) => {
    const msgGap = TIMING_CFG.SECTION_WEIGHT.MESSAGE_STILL / MESSAGE_SECTION_GROUPS.length;
    const time = L[STAGES.MSG_CONTENT] + (i * msgGap);
    tl.set(content, { textContent: text, color: COLORS.TEXT.LIGHT, fontWeight: '400', opacity: 0 }, time);
    tl.to(content, { opacity: 1, duration: 0.3 }, time);
    if (i < MESSAGE_SECTION_GROUPS.length - 1) {
      tl.to(content, { opacity: 0, duration: 0.2 }, time + msgGap - 0.2);
    }
  });
  
  if (nemo.imageEl) tl.to(nemo.imageEl, { opacity: 1, duration: 0.5 }, L[STAGES.TO_FORWHO] + 0.2);
}

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
