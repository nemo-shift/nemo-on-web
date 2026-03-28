import { gsap } from 'gsap';
import { 
  COLORS, STAGES, TIMING_CFG, LOGO_SIZE, HEADER_POS 
} from '@/constants/interaction';
import { JOURNEY_MASTER_CONFIG } from '@/data/home/journey';
import { JourneyLogoHandle } from './JourneyLogo';
import { SharedNemoHandle } from './SharedNemo';

/**
 * 타임라인 레이블 오프셋 계산 [Step 4-2]
 */
export function calculateLabels() {
  const w = TIMING_CFG.SECTION_WEIGHT;
  const t = TIMING_CFG.TRANSITION_WEIGHT;

  let curr = 0;
  const offsets: Record<string, number> = {};

  offsets[STAGES.HERO] = curr;
  curr += w.HERO_STILL;

  offsets[STAGES.START_TO_PAIN] = curr;
  curr += t;
  offsets[STAGES.TO_PAIN] = curr; 

  curr += w.PAIN_STILL * 0.7; 
  offsets[STAGES.PAIN_CONTENT] = curr;

  curr += w.PAIN_STILL * 0.3; 
  offsets[STAGES.PAIN_SHIFT] = curr;

  curr += w.RESONANCE_STILL;
  offsets[STAGES.RESONANCE] = curr;

  curr += t;
  offsets[STAGES.PAIN_TO_MSG] = curr;

  curr += t;
  offsets[STAGES.TO_MESSAGE] = curr;

  curr += w.MESSAGE_STILL;
  offsets[STAGES.MSG_CONTENT] = curr;

  curr += t;
  offsets[STAGES.MSG_TO_FW] = curr;

  curr += t;
  offsets[STAGES.TO_FORWHO] = curr;

  curr += w.FOR_WHO_STILL;
  offsets[STAGES.FW_CONTENT] = curr;

  curr += t;
  offsets[STAGES.FW_TO_STORY] = curr;

  curr += t;
  offsets[STAGES.TO_STORY] = curr;

  curr += w.STORY_STILL;
  offsets[STAGES.STORY_CONTENT] = curr;

  curr += t;
  offsets[STAGES.TO_CTA] = curr;

  curr += w.CTA_STILL;
  offsets[STAGES.CTA_CONTENT] = curr;

  curr += t;
  offsets[STAGES.TO_FOOTER] = curr;

  const totalWeight = curr + t;

  return { offsets, totalWeight };
}

/**
 * 전역 CSS 변수 및 스타일 초기화
 */
export function initGlobalStyles(isOn: boolean) {
  const cfg = JOURNEY_MASTER_CONFIG[STAGES.HERO];
  let env = { ...cfg.env };
  
  if (isOn && cfg.on?.env) {
    env = { ...env, ...cfg.on.env };
  }
  
  if (cfg.mobile?.env) {
    env = { ...env, ...cfg.mobile.env };
  }
  
  document.documentElement.style.setProperty('--header-fg', env.fg);
  document.documentElement.style.setProperty('--bg', env.bg);
}

/**
 * 여정 로고의 초기 상태 설정
 */
export function initLogoState(logo: JourneyLogoHandle, isOn: boolean, isMobile: boolean): void {
  const container = logo.containerEl;
  if (!container) return;

  const cfg = JOURNEY_MASTER_CONFIG[STAGES.HERO];
  let logoCfg = { ...cfg.logo };
  if (isOn && cfg.on?.logo) {
    logoCfg = { ...logoCfg, ...cfg.on.logo };
  }
  if (isMobile && cfg.mobile?.logo) {
    logoCfg = { ...logoCfg, ...cfg.mobile.logo };
  }

  gsap.set(container, {
    x: 0,
    y: 0,
    scale: 1, // CSS(font-size)에 스케일링 위임
    transformOrigin: 'top left',
    visibility: 'visible',
    opacity: 1
  });

  gsap.set(logo.nemoKrEl, { opacity: logoCfg.nemoKr ? 1 : 0, visibility: logoCfg.nemoKr ? 'visible' : 'hidden' });
  gsap.set(logo.shapesEl, { opacity: logoCfg.shapes ? 0.8 : 0, visibility: logoCfg.shapes ? 'visible' : 'hidden' });
  gsap.set(logo.statusEl, { opacity: logoCfg.status ? 1 : 0, visibility: logoCfg.status ? 'visible' : 'hidden' });
  gsap.set(logo.rectangleEl, { opacity: logoCfg.rectangle ? 1 : 0, visibility: logoCfg.rectangle ? 'visible' : 'hidden' });
  
  if (logo.tLines.h && logo.tLines.v) {
    const isPlus = logoCfg.morph === '+';
    // [v26.98 UI Detail] 고해상도 소스에 맞춘 좌표 스케일 업 (4px -> 20px, 12px -> 60px)
    gsap.set(logo.tLines.h, { width: '100%', top: isPlus ? '60px' : '20px', left: 0 });
    gsap.set(logo.tLines.v, { height: '100%', top: isPlus ? '20px' : '20px' });
  }
}

/**
 * 네모(Nemo) 상자의 초기 상태 설정
 */
export function initNemoState(nemo: SharedNemoHandle): void {
  const originEl = document.getElementById('hero-nemo-origin');
  if (!nemo.nemoEl || !originEl) return;
  const rect = originEl.getBoundingClientRect();
  const style = window.getComputedStyle(originEl);
  
  gsap.set(nemo.nemoEl, {
    width: rect.width, height: rect.height, 
    left: rect.left + rect.width / 2, top: rect.top + rect.height / 2,
    xPercent: -50, yPercent: -50, 
    borderRadius: style.borderRadius, 
    backgroundColor: style.backgroundColor,
    border: style.border, 
    borderColor: style.borderColor, 
    boxShadow: style.boxShadow, 
    opacity: 0, 
    position: 'fixed',
  });
}
