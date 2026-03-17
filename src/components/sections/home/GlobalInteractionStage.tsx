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
} from '@/constants/interaction';
import { PAIN_POINTS, RESONANCE_MESSAGE, MESSAGE_SECTION_GROUPS } from '@/data/homeContent';

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
        <SharedNemo ref={nemoHandle} />
      </div>

      {/* 2. Journey Logo */}
      <div className="absolute origin-top-left" style={{ 
        left: isMobile ? 20 : 40, 
        top: isMobile ? 20 : 32, 
        zIndex: INTERACTION_Z_INDEX.JOURNEY_LOGO 
      }}>
        <JourneyLogo ref={logoHandle} isOn={isOn} progress={0} isTransitioning={isTransitioning} />
      </div>

      {/* 3. Scroll Hint */}
      <div id="pain-scroll-hint" className="fixed bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 opacity-0 pointer-events-none" style={{ zIndex: INTERACTION_Z_INDEX.SCROLL_HINT }}>
        <span className="text-[10px] font-medium tracking-[0.3em] text-[#f0ebe3]/60 uppercase">Scroll</span>
        <div className="w-[1px] h-12 bg-gradient-to-b from-[#f0ebe3]/80 to-transparent relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1/2 bg-[#f0ebe3] animate-scroll-hint" />
        </div>
      </div>

      <FallingKeywordsStage ref={fallingRef} containerRef={containerRef} />
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
  const headerColor = isOn ? COLORS.TEXT_DARK : COLORS.TEXT_LIGHT;
  const bgColor = isOn ? COLORS.BG_CREAM : COLORS.BG_DARK;
  document.documentElement.style.setProperty('--header-fg', headerColor);
  document.documentElement.style.setProperty('--bg', bgColor);
}

function _initLogoState(logo: JourneyLogoHandle, isOn: boolean, isMobile: boolean): void {
  const bigScale = isMobile ? LOGO_SIZE.BIG_SCALE_MOBILE : LOGO_SIZE.BIG_SCALE;
  gsap.set(logo.containerEl, { 
    scale: bigScale, 
    transformOrigin: 'top left', 
    x: 0, y: 0,
    visibility: 'visible',
    opacity: 1
  });
  gsap.set([logo.nemoKrEl, logo.statusEl, logo.shapesEl], { opacity: 1, y: 0, visibility: 'visible' });
  if (logo.statusEl) logo.statusEl.textContent = isOn ? 'ON' : 'OFF';
  gsap.set([logo.rectangleEl, logo.plusEl], { opacity: 0 });
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

  tl.set(logo.containerEl, { scale: isMobile ? LOGO_SIZE.BIG_SCALE_MOBILE : LOGO_SIZE.BIG_SCALE }, 0);
  
  tl.to([logo.shapesEl, logo.statusEl], {
    opacity: 0, y: -40, duration: t * 0.4, ease: 'power2.in'
  }, L[STAGES.START_TO_PAIN]);

  tl.to(logo.containerEl, {
    scale: headerScale, duration: t, ease: 'power3.inOut'
  }, L[STAGES.START_TO_PAIN]);

  tl.to(document.documentElement, {
    '--header-fg': COLORS.TEXT_LIGHT,
    '--bg': COLORS.BG_SECTION_DARK,
    duration: t
  }, L[STAGES.START_TO_PAIN]);

  // English Logo (RECTANGLE) Morphing
  tl.to(logo.nemoKrEl, { opacity: 0, duration: 0.2 }, L[STAGES.RESONANCE]);
  tl.to(logo.rectangleEl, { opacity: 1, duration: 0.2 }, L[STAGES.RESONANCE] + 0.1);
  
  // T -> + Morph
  tl.to(logo.tEl, { opacity: 0, duration: 0.2 }, L[STAGES.TO_MESSAGE]);
  tl.to(logo.plusEl, { opacity: 1, duration: 0.2 }, L[STAGES.TO_MESSAGE] + 0.1);
  
  tl.to(document.documentElement, { '--header-fg': COLORS.TEXT_DARK, duration: 0.1 }, L[STAGES.TO_MESSAGE]);

  tl.to(logo.rectangleEl, { opacity: 0, duration: 0.2 }, L[STAGES.MSG_CONTENT]);
  tl.to([logo.nemoKrEl, logo.shapesEl, logo.statusEl], { opacity: 1, y: 0, duration: 0.2 }, L[STAGES.TO_FORWHO]);

  // ─────────────────────────────────────────────
  // [V4.3] 전역 스타일 전환 (배경색 & 폰트색)
  // ─────────────────────────────────────────────
  
  // To ForWho: Dark -> Dark (No Change)
  
  // To BrandStory: Dark -> Cream
  tl.to(document.documentElement, {
    '--bg': COLORS.BG_CREAM,
    '--header-fg': COLORS.TEXT_DARK,
    duration: t
  }, L[STAGES.TO_STORY]);

  // To CTA: Cream -> Dark
  tl.to(document.documentElement, {
    '--bg': COLORS.BG_SECTION_DARK,
    '--header-fg': COLORS.TEXT_LIGHT,
    duration: t
  }, L[STAGES.TO_CTA]);
}

function buildNemoTimeline(tl: gsap.core.Timeline, nemo: SharedNemoHandle, isMobile: boolean, falling: FallingKeywordsHandle, L: Record<string, number>) {
  const el = nemo.nemoEl!;
  const borderBoxW = isMobile ? '70vw' : NEMO_SIZE.BORDER_BOX_W;
  const borderBoxH = isMobile ? '35vh' : NEMO_SIZE.BORDER_BOX_H;
  const t = TIMING_CFG.TRANSITION_WEIGHT;

  tl.to(['.hero-content-layer', '.hero-bottom-bar', '#hero-nemo-origin'], {
    opacity: 0, visibility: 'hidden', duration: t * 0.5, ease: 'power2.in'
  }, L[STAGES.START_TO_PAIN]);

  tl.to(el, { 
    width: '100vw', height: '100vh', borderRadius: 0, left: '50%', top: '50%', 
    backgroundColor: COLORS.BG_SECTION_DARK, border: '0px solid transparent',
    duration: t, ease: 'power3.inOut'
  }, L[STAGES.START_TO_PAIN]);

  tl.to(el, {
    width: borderBoxW, height: borderBoxH, borderRadius: 12,
    left: isMobile ? '50%' : '75%',
    backgroundColor: 'transparent', border: `1.5px solid ${COLORS.TEXT_LIGHT}`,
    duration: 0.4, ease: 'back.out(1.2)'
  }, L[STAGES.TO_PAIN]);

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

  tl.to(el, {
    left: '50%', backgroundColor: COLORS.TEXT_LIGHT, border: 'none',
    duration: TIMING_CFG.SECTION_WEIGHT.PAIN_STILL * 0.3, ease: 'power2.inOut'
  }, L[STAGES.PAIN_CONTENT]);

  tl.to([step, line], { opacity: 0, duration: 0.2 }, L[STAGES.PAIN_CONTENT]);
  tl.to({}, { duration: 0.1, onStart: () => falling.dropAll() }, L[STAGES.PAIN_CONTENT] + 0.2);

  tl.set(content, { textContent: RESONANCE_MESSAGE.main, color: COLORS.TEXT_DARK, fontWeight: '700', opacity: 0, y: 20 }, L[STAGES.RESONANCE]);
  tl.to(content, { opacity: 1, y: 0, duration: 0.4 }, L[STAGES.RESONANCE]);

  tl.to(content, { opacity: 0, duration: 0.2 }, L[STAGES.RESONANCE] + TIMING_CFG.SECTION_WEIGHT.RESONANCE_STILL - 0.2);
  tl.to(el, {
    width: NEMO_SIZE.TEAL_BOX_W, height: NEMO_SIZE.TEAL_BOX_H, 
    backgroundColor: COLORS.BRAND, duration: t, ease: TIMING_CFG.EASE_TRANS
  }, L[STAGES.TO_MESSAGE]);

  MESSAGE_SECTION_GROUPS.forEach((text, i) => {
    const msgGap = TIMING_CFG.SECTION_WEIGHT.MESSAGE_STILL / MESSAGE_SECTION_GROUPS.length;
    const time = L[STAGES.MSG_CONTENT] + (i * msgGap);
    tl.set(content, { textContent: text, color: COLORS.TEXT_LIGHT, fontWeight: '400', opacity: 0 }, time);
    tl.to(content, { opacity: 1, duration: 0.3 }, time);
    if (i < MESSAGE_SECTION_GROUPS.length - 1) {
      tl.to(content, { opacity: 0, duration: 0.2 }, time + msgGap - 0.2);
    }
  });

  tl.to(el, {
    width: NEMO_SIZE.IMAGE_W, height: NEMO_SIZE.IMAGE_H, borderRadius: 18,
    duration: t, ease: 'power3.inOut'
  }, L[STAGES.TO_FORWHO]);
  
  if (nemo.imageEl) tl.to(nemo.imageEl, { opacity: 1, duration: 0.5 }, L[STAGES.TO_FORWHO] + 0.2);
}

/**
 * [V4.3] 섹션 스크롤링 타임라인
 * 전체 고정(Whole-Pin) 상태에서 실제 섹션 콘텐츠들이 스크롤 호흡에 맞춰 위로 올라가도록 제어합니다.
 */
function buildSectionScrollTimeline(tl: gsap.core.Timeline, L: Record<string, number>) {
  const target = '#sections-content-wrapper';
  const t = TIMING_CFG.TRANSITION_WEIGHT;

  // 1. Hero -> Pain (전환)
  tl.to(target, {
    y: '-100vh',
    duration: t,
    ease: 'power3.inOut'
  }, L[STAGES.START_TO_PAIN]);

  // 2. Pain -> Message (전환)
  // Hero(100) + Pain(1000) = 1100vh만큼 위로 이동
  tl.to(target, {
    y: '-1100vh',
    duration: t,
    ease: 'power3.inOut'
  }, L[STAGES.TO_MESSAGE]);

  // 3. Message -> ForWho (전환)
  // 이전 1100 + Message(800) = 1900vh만큼 위로 이동
  tl.to(target, {
    y: '-1900vh',
    duration: t,
    ease: 'power3.inOut'
  }, L[STAGES.TO_FORWHO]);

  // 4. ForWho -> BrandStory (전환)
  // 이전 1900 + ForWho(1000) = 2900vh
  // [!] BrandStorySection은 py-64 (약 32rem)이므로 높이가 다름 
  // 그러나 기획상 각 섹션은 100vh 단위의 공간을 점유하므로 100vh 이동
  tl.to(target, {
    y: '-2900vh', 
    duration: t,
    ease: 'power3.inOut'
  }, L[STAGES.TO_STORY]);

  // 5. BrandStory -> CTA (전환)
  // Story 섹션은 h-screen이 아니어도 인터랙션 호흡을 위해 100vh 공간 할당
  tl.to(target, {
    y: '-3000vh',
    duration: t,
    ease: 'power3.inOut'
  }, L[STAGES.TO_CTA]);
}
