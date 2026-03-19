'use client';

import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { useHeroContext } from '@/context';
import JourneyLogo, { JourneyLogoHandle } from './JourneyLogo';
import SharedNemo, { SharedNemoHandle } from './SharedNemo';
import FallingKeywordsStage, { FallingKeywordsHandle } from './FallingKeywordsStage';
import {
  COLORS,
  STAGES,
  TIMING_CFG,
  INTERACTION_Z_INDEX,
  LOGO_SIZE,
  NEMO_SIZE,
  HEADER_POS,
  EASE,
  SECTION_SCROLL_HEIGHT,
} from '@/constants/interaction';
import { PAIN_POINTS, RESONANCE_MESSAGE, MESSAGE_SECTION_GROUPS } from '@/data/homeContent';
import { JOURNEY_MASTER_CONFIG, StageState } from '@/data/home/journey';

gsap.registerPlugin(ScrollTrigger);

interface GlobalInteractionStageProps {
  isMobile: boolean;
  isOn: boolean;
  isTransitioning: boolean;
}

export const GlobalInteractionStage = ({
  isMobile,
  isOn,
  isTransitioning,
}: GlobalInteractionStageProps) => {
  const { isScrollable } = useHeroContext();

  const containerRef = useRef<HTMLDivElement>(null);
  const logoHandle   = useRef<JourneyLogoHandle>(null);
  const nemoHandle   = useRef<SharedNemoHandle>(null);
  const fallingRef   = useRef<FallingKeywordsHandle>(null);
  const masterTl     = useRef<gsap.core.Timeline | null>(null);

  useGSAP(() => {
    const logo = logoHandle.current;
    const nemo = nemoHandle.current;
    const falling = fallingRef.current;

    if (!logo?.containerEl || !nemo?.nemoEl || !falling) return;

    const ctx = gsap.context(() => {
      _initGlobalStyles(isOn);
      _initLogoState(logo, isOn, isMobile);
      _initNemoState(nemo, isMobile);

      if (isScrollable) {
        // [V4.2] 타이밍 보호: 브라우저가 레이아웃(스크롤바 생성 등)을 확정할 때까지 한 틱 대기
        requestAnimationFrame(() => {
          const L = _calculateLabels();
          
          masterTl.current = gsap.timeline({
            scrollTrigger: {
              trigger: '#home-stage',
              start: 'top top',
              end: 'bottom bottom',
              scrub: TIMING_CFG.SCRUB,
              pin: true,
              pinSpacing: false,
            },
            defaults: { ease: 'none' },
          });
          
          const tl = masterTl.current;

          Object.entries(L).forEach(([key, time]) => {
            tl.addLabel(key, time);
          });

          buildLogoTimeline(tl, logo, isMobile, L);
          buildNemoTimeline(tl, nemo, isMobile, falling, L);
          buildSectionScrollTimeline(tl, L);

          _buildHeroSwapSequence(tl, nemo);

          // 핀 계산 후 좌표 무결성 강제 갱신
          ScrollTrigger.refresh();
        });
      }
    });

    return () => ctx.revert();
  }, { dependencies: [isScrollable, isOn, isMobile] });

  // [V4.2] 레이라우트 무결성 Double-Lock: 
  // 스크롤 해제(overflow hidden 제거) 시 발생하는 레이아웃 시프트를 감지하여 핀 좌표 최종 갱신
  useEffect(() => {
    if (isScrollable) {
      // 브라우저가 스크롤바를 렌더링하고 레이아웃이 완전히 정착될 시간을 벌어줌
      const timer = setTimeout(() => {
        ScrollTrigger.refresh();
      }, 100); 
      return () => clearTimeout(timer);
    }
  }, [isScrollable]);

  return (
    <div ref={containerRef} className="global-interaction-stage fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 10 }}>
      {/* 1. Shared Nemo */}
      <div style={{ zIndex: INTERACTION_Z_INDEX.SHARED_NEMO }}>
        <SharedNemo ref={nemoHandle} isMobile={isMobile} />
      </div>

      {/* 2. Journey Logo */}
      <div className="absolute origin-top-left" style={{ 
        left: isMobile ? HEADER_POS.MOBILE.x : HEADER_POS.PC.x, 
        top: isMobile ? HEADER_POS.MOBILE.y : HEADER_POS.PC.y, 
        zIndex: INTERACTION_Z_INDEX.JOURNEY_LOGO 
      }}>
        <JourneyLogo ref={logoHandle} isOn={isOn} progress={0} isTransitioning={isTransitioning} />
      </div>

      {/* 3. Scroll Hint */}
      <div id="pain-scroll-hint" className="fixed bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 opacity-0 pointer-events-none" style={{ zIndex: INTERACTION_Z_INDEX.SCROLL_HINT }}>
        <span className="text-[10px] font-medium tracking-[0.3em] uppercase" style={{ color: `${COLORS.TEXT.LIGHT}99` }}>Scroll</span>
        <div className="w-[1px] h-12 relative overflow-hidden" style={{ background: `linear-gradient(to bottom, ${COLORS.TEXT.LIGHT}CC, transparent)` }}>
          <div className="absolute top-0 left-0 w-full h-1/2 animate-scroll-hint" style={{ backgroundColor: COLORS.TEXT.LIGHT }} />
        </div>
      </div>

      <FallingKeywordsStage ref={fallingRef} containerRef={containerRef} isMobile={isMobile} />
    </div>
  );
};

export default GlobalInteractionStage;

/**
 * Labels sequence based on weights
 */
function _calculateLabels() {
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
  offsets[STAGES.TO_MESSAGE] = curr;

  curr += w.MESSAGE_STILL;
  offsets[STAGES.MSG_CONTENT] = curr;

  curr += t;
  offsets[STAGES.TO_FORWHO] = curr;

  curr += w.FOR_WHO_STILL;
  offsets[STAGES.FW_CONTENT] = curr;

  curr += t;
  offsets[STAGES.TO_STORY] = curr;

  curr += w.STORY_STILL;
  offsets[STAGES.STORY_CONTENT] = curr;

  curr += t;
  offsets[STAGES.TO_CTA] = curr;

  curr += w.CTA_STILL;
  offsets[STAGES.CTA_CONTENT] = curr;

  return offsets;
}

function _initGlobalStyles(isOn: boolean) {
  // [V4.4] 마스터 시트에서 히어로 상태의 환경 설정 가져오기 (isOn 상태 우선 적용)
  const cfg = JOURNEY_MASTER_CONFIG[STAGES.HERO];
  let env = { ...cfg.env };
  
  if (isOn && cfg.on?.env) {
    env = { ...env, ...cfg.on.env };
  }
  
  // 모바일에 특화된 배경색/헤더색이 있다면 오버라이드
  if (cfg.mobile?.env) {
    env = { ...env, ...cfg.mobile.env };
  }
  
  document.documentElement.style.setProperty('--header-fg', env.fg);
  document.documentElement.style.setProperty('--bg', env.bg);
}

function _initLogoState(logo: JourneyLogoHandle, isOn: boolean, isMobile: boolean, isTransitioning?: boolean): void {
  const container = logo.containerEl;
  if (!container) return;

  const cfg = JOURNEY_MASTER_CONFIG[STAGES.HERO];
  // isOn 상태와 isMobile 상태를 순차적으로 병합하여 로고 가시성 결정
  let logoCfg = { ...cfg.logo };
  if (isOn && cfg.on?.logo) {
    logoCfg = { ...logoCfg, ...cfg.on.logo };
  }
  if (isMobile && cfg.mobile?.logo) {
    logoCfg = { ...logoCfg, ...cfg.mobile.logo };
  }

  // [V4.3 Fixed Proxy] 상단 고정된 에디토리얼 앵커 위치를 기준으로 초기화
  const anchorEl = document.getElementById('hero-logo-anchor');
  const headerPos = isMobile ? HEADER_POS.MOBILE : HEADER_POS.PC;
  
  if (anchorEl) {
    const anchorRect = anchorEl.getBoundingClientRect();
    const scale = anchorRect.height / 32; 
    
    gsap.set(container, {
      x: anchorRect.left - headerPos.x,
      y: anchorRect.top - headerPos.y,
      scale: scale,
      transformOrigin: 'top left',
      visibility: 'visible',
      opacity: 1
    });
  } else {
    const bigScale = isMobile ? LOGO_SIZE.BIG_SCALE_MOBILE : LOGO_SIZE.BIG_SCALE;
    gsap.set(container, { scale: bigScale, x: 0, y: 0, transformOrigin: 'top left', visibility: 'visible', opacity: 1 });
  }

  // [V4.4 Data-Driven] 마스터 데이터 기반 초기 가시성 설정
  gsap.set(logo.nemoKrEl, { opacity: logoCfg.nemoKr ? 1 : 0, visibility: logoCfg.nemoKr ? 'visible' : 'hidden' });
  gsap.set(logo.shapesEl, { opacity: logoCfg.shapes ? 0.8 : 0, visibility: logoCfg.shapes ? 'visible' : 'hidden' });
  gsap.set(logo.statusEl, { opacity: logoCfg.status ? 1 : 0, visibility: logoCfg.status ? 'visible' : 'hidden' });
  gsap.set(logo.rectangleEl, { opacity: logoCfg.rectangle ? 1 : 0, visibility: logoCfg.rectangle ? 'visible' : 'hidden' });
  
  if (logo.tLines.h && logo.tLines.v) {
    const isPlus = logoCfg.morph === '+';
    gsap.set(logo.tLines.h, { width: '100%', top: isPlus ? '12px' : '4px', left: 0 });
    gsap.set(logo.tLines.v, { height: '100%', top: isPlus ? '4px' : '4px' });
  }
}

function _initNemoState(nemo: SharedNemoHandle, isMobile: boolean): void {
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
    opacity: 1, 
    position: 'fixed',
  });
}

function _buildHeroSwapSequence(tl: gsap.core.Timeline, nemo: SharedNemoHandle) {
  const originEl = document.getElementById('hero-nemo-origin');
  const originText = originEl?.querySelector('span');
  if (!originEl) return;

  tl.set([originEl, originText, nemo.nemoEl], { transition: 'none' }, 0);
  tl.to(originEl, { backgroundColor: 'transparent', borderColor: 'transparent', boxShadow: 'none', duration: 0.1 }, 0);
  tl.to(nemo.nemoEl, { opacity: 1, duration: 0.01 }, 0);
  if (originText) tl.to(originText, { opacity: 0, y: -15, duration: 0.1 }, 0);
}

function buildLogoTimeline(tl: gsap.core.Timeline, logo: JourneyLogoHandle, isMobile: boolean, L: Record<string, number>) {
  const headerScale = LOGO_SIZE.HEADER_SCALE;
  const t = TIMING_CFG.TRANSITION_WEIGHT;
  const r = TIMING_CFG.TRANSITION_FINISH_RATIO;
  
  // [V4.4 Master Loop] 데이터 기반 로고 및 환경 전환 자동화
  const sections = [
    { label: STAGES.START_TO_PAIN, stage: STAGES.START_TO_PAIN },
    { label: STAGES.RESONANCE, stage: STAGES.RESONANCE },
    { label: STAGES.TO_MESSAGE, stage: STAGES.TO_MESSAGE },
    { label: STAGES.TO_FORWHO, stage: STAGES.TO_FORWHO },
    { label: STAGES.TO_CTA, stage: STAGES.TO_CTA }
  ];

  sections.forEach(({ label, stage }) => {
    const raw = JOURNEY_MASTER_CONFIG[stage];
    if (!raw) return;
    const cfg = isMobile && raw.mobile ? { ...raw, ...raw.mobile } : raw;
    const time = L[label];

    // 1. 환경 전환 (배경, 헤더색)
    tl.to(document.documentElement, {
      '--header-fg': cfg.env.fg,
      '--bg': cfg.env.bg,
      duration: t * r
    }, time);

    // 2. 가시성 전환
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

    // 3. T Morphing (+ 브릿지)
    if (logo.tLines.h && logo.tLines.v) {
      const isPlus = cfg.logo.morph === '+';
      tl.to(logo.tLines.h, { top: isPlus ? '12px' : '4px', duration: 0.2 }, time);
    }
  });

  // 로고 전체 스케일 전환 (히어로 탈출 시)
  tl.to(logo.containerEl, {
    scale: headerScale, x: 0, y: 0, duration: t * r, ease: EASE.TRANSITION
  }, L[STAGES.START_TO_PAIN]);
}

function buildNemoTimeline(tl: gsap.core.Timeline, nemo: SharedNemoHandle, isMobile: boolean, falling: FallingKeywordsHandle, L: Record<string, number>) {
  const el = nemo.nemoEl!;
  const t = TIMING_CFG.TRANSITION_WEIGHT;
  const r = TIMING_CFG.TRANSITION_FINISH_RATIO;

  // 히어로 탈출 시 주변 요소 페이드아웃
  tl.to(['.hero-content-layer', '.hero-bottom-bar', '#hero-nemo-origin'], {
    opacity: 0, visibility: 'hidden', duration: t * 0.5, ease: EASE.FADE
  }, L[STAGES.START_TO_PAIN]);

  // [V4.4 Master Loop] 데이터 기반 네모 상자 변형 자동화
  const sections = [
    { label: STAGES.START_TO_PAIN, stage: STAGES.START_TO_PAIN, ease: EASE.TRANSITION },
    { label: STAGES.TO_PAIN, stage: STAGES.TO_PAIN, ease: EASE.BOUNCE },
    { label: STAGES.PAIN_CONTENT, stage: STAGES.RESONANCE, ease: EASE.SETTLE }, // 수축 후 중앙 이동
    { label: STAGES.TO_MESSAGE, stage: STAGES.TO_MESSAGE, ease: TIMING_CFG.EASE_TRANS },
    { label: STAGES.TO_FORWHO, stage: STAGES.TO_FORWHO, ease: EASE.TRANSITION },
    { label: STAGES.TO_CTA, stage: STAGES.TO_CTA, ease: EASE.SETTLE }
  ];

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

  // [Pain 전용] 콘텐츠 제로잉 로직 (기존 뼈대 유지)
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
 * [V4.3] 섹션 스크롤링 타임라인
 * 전체 고정(Whole-Pin) 상태에서 실제 섹션 콘텐츠들이 스크롤 호흡에 맞춰 위로 올라가도록 제어합니다.
 */
function buildSectionScrollTimeline(tl: gsap.core.Timeline, L: Record<string, number>) {
  const target = '#sections-content-wrapper';
  const t = TIMING_CFG.TRANSITION_WEIGHT;
  const H = SECTION_SCROLL_HEIGHT;

  // 1. Hero -> Pain
  tl.to(target, {
    y: `-${H.HERO}vh`,
    duration: t,
    ease: EASE.TRANSITION
  }, L[STAGES.START_TO_PAIN]);

  // 2. Pain -> Message
  tl.to(target, {
    y: `-${H.HERO + H.PAIN}vh`,
    duration: t,
    ease: EASE.TRANSITION
  }, L[STAGES.TO_MESSAGE]);

  // 3. Message -> ForWho
  tl.to(target, {
    y: `-${H.HERO + H.PAIN + H.MESSAGE}vh`,
    duration: t,
    ease: EASE.TRANSITION
  }, L[STAGES.TO_FORWHO]);

  // 4. ForWho -> BrandStory
  tl.to(target, {
    y: `-${H.HERO + H.PAIN + H.MESSAGE + H.FORWHO}vh`, 
    duration: t,
    ease: EASE.TRANSITION
  }, L[STAGES.TO_STORY]);

  // 5. BrandStory -> CTA
  tl.to(target, {
    y: `-${H.HERO + H.PAIN + H.MESSAGE + H.FORWHO + H.STORY}vh`,
    duration: t,
    ease: EASE.TRANSITION
  }, L[STAGES.TO_CTA]);
}
