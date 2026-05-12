import { gsap } from 'gsap';
import { InteractionRegistry } from './types';
import { JourneyLogoHandle } from './JourneyLogo';
import { SharedNemoHandle } from './SharedNemo';

/**
 * [V11.31 Knowledge Transfer] calculateLabels
 * 전체 마스터 타임라인의 시간축(Time Axis)을 생성하는 핵심 엔진.
 * 
 * 원리:
 * 1. 초(seconds) 단위가 아닌 '가중치(Weight)' 시스템을 사용하여 섹션 간의 상대적 정지/이동 시간을 정의.
 * 2. TIMING_CFG.SECTION_WEIGHT는 각 섹션에 머무르는 정적 시간(Still Time)을 결정.
 * 3. TIMING_CFG.TRANSITION_WEIGHT는 섹션 간 이동하는 동적 시간(Transition Time)을 결정.
 * 
 * @returns {Record<string, number>} offsets - 각 스테이지 라벨별 시작 지점(Timeline Time)
 * @returns {number} totalWeight - 전체 타임라인의 총 길이 (ScrollTrigger end 값과 동기화됨)
 */
export function calculateLabels(registry: InteractionRegistry, mode: 'mouse' | 'touch' = 'mouse') {
  const { STAGES, TIMING_CFG } = registry.constants;
  const isTouch = mode === 'touch';
  const w = TIMING_CFG.SECTION_WEIGHT;
  const t = TIMING_CFG.TRANSITION_WEIGHT;

  let curr = 0;
  const offsets: Record<string, number> = {};

  // 상단 히어로 및 페인 로직
  const heroWeight = isTouch ? w.HERO_STILL_TOUCH : w.HERO_STILL;
  const painWeight = isTouch ? w.PAIN_STILL_TOUCH : w.PAIN_STILL;

  offsets[STAGES.HERO] = curr;
  offsets[STAGES.HERO_STILL_START] = curr;
  curr += heroWeight * 0.4; offsets[STAGES.HERO_STILL_LOGO_EJECT] = curr;
  curr += heroWeight * 0.35; offsets[STAGES.HERO_STILL_CONTENT_RISE] = curr;
  curr += heroWeight * 0.2; offsets[STAGES.HERO_STILL_NEMO_REVEAL] = curr;
  curr += heroWeight * 0.05; offsets[STAGES.HERO_STILL_END] = curr;

  offsets[STAGES.START_TO_PAIN] = curr;
  curr += t;
  offsets[STAGES.TO_PAIN] = curr; 

  curr += painWeight * 0.5; offsets[STAGES.PAIN_CONTENT] = curr;
  curr += painWeight * 0.5; offsets[STAGES.PAIN_SHIFT] = curr;

  // 공명 지평선 모핑 구간
  const morphGap = isTouch ? TIMING_CFG.GAPS.RESONANCE_MORPH.TOUCH : TIMING_CFG.GAPS.RESONANCE_MORPH.PC;
  curr += morphGap;
  offsets[STAGES.RESONANCE] = curr;
  
  // 공명 마퀴 스튜디오 구간
  const resonanceStill = isTouch ? TIMING_CFG.SECTION_WEIGHT.RESONANCE_STILL_TOUCH : w.RESONANCE_STILL;
  curr += resonanceStill;

  // 페인 -> 메시지 브릿지
  const transGap = isTouch ? TIMING_CFG.GAPS.RESONANCE_TRANS.TOUCH : TIMING_CFG.GAPS.RESONANCE_TRANS.PC;
  curr += transGap;
  offsets[STAGES.PAIN_TO_MSG] = curr;

  curr += transGap;
  offsets[STAGES.TO_MESSAGE] = curr;

  // 메시지 섹션 정지 가중치
  // [Architecture] 스크롤 가중치 결정 원칙
  // - isTouch (options.isMobile): 사용자의 입력 방식(터치 vs 마우스)에 따라 스크롤 호흡을 결정합니다.
  // - 여기서는 레이아웃 크기가 아닌 '동작 방식'이 중요하므로 터치 여부 변수를 사용합니다.
  const messageStill = isTouch ? w.MESSAGE_STILL : TIMING_CFG.SECTION_WEIGHT.MESSAGE_STILL_PC;
  curr += messageStill;
  offsets[STAGES.MSG_CONTENT] = curr;

  curr += t;
  offsets[STAGES.MSG_TO_FW] = curr;

  // [NEW] 코어 퍼널 브릿지 시퀀스
  const funnelWeight = isTouch ? w.CORE_FUNNEL_STILL_TOUCH : w.CORE_FUNNEL_STILL;
  const expandWeight = isTouch ? w.CORE_FUNNEL_EXPAND_TOUCH : w.CORE_FUNNEL_EXPAND_WEIGHT;

  curr += t; offsets[STAGES.CORE_FUNNEL_START] = curr;
  curr += funnelWeight * 0.5; offsets[STAGES.CORE_FUNNEL_BUILD] = curr;
  curr += funnelWeight * 0.3; offsets[STAGES.CORE_FUNNEL_SNAP] = curr;
  curr += funnelWeight * 0.2; offsets[STAGES.CORE_FUNNEL_EXPAND] = curr;

  curr += expandWeight; 
  offsets[STAGES.TO_FORWHO] = curr;

  const forWhoWeight = isTouch ? w.FOR_WHO_STILL_TOUCH : w.FOR_WHO_STILL;
  curr += forWhoWeight;
  offsets[STAGES.FW_CONTENT] = curr;

  curr += t;
  offsets[STAGES.FW_TO_STORY] = curr;

  curr += t;
  offsets[STAGES.TO_STORY] = curr;

  const storyWeight = isTouch ? w.STORY_STILL_TOUCH : w.STORY_STILL;
  curr += storyWeight;
  offsets[STAGES.STORY_CONTENT] = curr;

  curr += t;
  offsets[STAGES.STORY_ERASE] = curr; 

  const storyEraseWeight = isTouch ? w.STORY_ERASE_STILL_TOUCH : w.STORY_ERASE_STILL;
  curr += storyEraseWeight; 
  offsets[STAGES.TO_CTA] = curr; 

  const ctaWeight = isTouch ? w.CTA_STILL_TOUCH : w.CTA_STILL;
  curr += ctaWeight;
  offsets[STAGES.CTA_CONTENT] = curr;

  curr += t;
  offsets[STAGES.TO_FOOTER] = curr;

  const totalWeight = curr + t;

  return { offsets, totalWeight };
}

// [V11.34-P5] 모드(ON/OFF) 및 기기(isMobile)에 따른 전역 CSS 변수를 '동기적으로' 즉시 주입.
// [V11.18 Fix] 리사이즈 시 현재 진행도를 무시하고 히어로 색상으로 초기화되는 현상을 방지하기 위해 가드 추가.
export function initGlobalStyles(
  registry: InteractionRegistry, 
  isOn: boolean, 
  isMobile: boolean, 
  currentProgress: number = 0,
  isRestoring: boolean = false
) {
  const { STAGES } = registry.constants;
  const { JOURNEY_MASTER_CONFIG } = registry.data;
  
  // [V11.Macro_Final] window._masterTlProgress 제거 및 명시적 인자 주입 방식으로 전환
  if (typeof window !== 'undefined') {
    // [V40] 리사이즈 복구 상황이 아닐 때만 타임라인의 권한을 보호합니다.
    if (currentProgress > 0.001 && !isRestoring) return;
  }

  const cfg = JOURNEY_MASTER_CONFIG[STAGES.HERO];
  let env = { ...cfg.env };
  
  if (isOn && cfg.on?.env) {
    env = { ...env, ...cfg.on.env };
  }
  
  if (isMobile && cfg.mobile?.env) {
    env = { ...env, ...cfg.mobile.env };
  }
  
  document.documentElement.style.setProperty('--header-fg', env.fg);
  document.documentElement.style.setProperty('--bg', env.bg);
}

/**
 * [V11.31] initLogoState
 * 여정 로고(Journey Logo)의 초기 기하학적 형태와 모핑 포인트를 설정.
 * 고해상도 SVG 소스에 맞춰 모핑 좌표를 정밀하게 스케일링함.
 */
export function initLogoState(
  registry: InteractionRegistry,
  logo: JourneyLogoHandle, 
  options: { isOn: boolean; isMobile: boolean; isTabletPortrait?: boolean; progress?: number }
): void {
  const { STAGES } = registry.constants;
  const { JOURNEY_MASTER_CONFIG } = registry.data;
  const { isOn, isMobile, progress = 0 } = options;
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

  // [V11.19 Fix] 레이아웃 기준점(Anchor) 설정은 리사이즈 대응을 위해 항상 실행
  gsap.set(container, {
    x: 0,
    y: 0,
    scale: 1, 
    height: 'auto', // 초기에는 자동 높이 (히어로 빅 타이포 대응)
    transformOrigin: 'top left',
    visibility: 'visible',
    opacity: 1
  });

  // [+] 형태에서 [-] 형태로의 모핑 포인트를 픽셀 단위로 정밀 제어
  if (logo.tLines.h && logo.tLines.v) {
    const isPlus = logoCfg.morph === '+';
    // [v26.98 UI Detail] 고해상도 소스에 맞춘 좌표 스케일 업 (12px -> 60px)
    gsap.set(logo.tLines.h, { width: '100%', top: isPlus ? '60px' : '20px', left: 0 });
    gsap.set(logo.tLines.v, { height: '100%', top: isPlus ? '20px' : '20px' });
  }

  // [V11.Macro_Final] 명시적 진행도(progress) 기반 가드로 전환
  if (progress > 0.001) return;

  // 하위 엘리먼트 가시성 설정
  gsap.set(logo.nemoKrEl, { opacity: logoCfg.nemoKr ? 1 : 0, visibility: logoCfg.nemoKr ? 'visible' : 'hidden' });
  gsap.set(logo.shapesEl, { opacity: logoCfg.shapes ? 0.8 : 0, visibility: logoCfg.shapes ? 'visible' : 'hidden' });
  gsap.set(logo.statusEl, { opacity: logoCfg.status ? 1 : 0, visibility: logoCfg.status ? 'visible' : 'hidden' });
  gsap.set(logo.rectangleEl, { opacity: logoCfg.rectangle ? 1 : 0, visibility: logoCfg.rectangle ? 'visible' : 'hidden' });
}

/**
 * [V5.4 Integrity] initNemoState
 * '공유 네모(Shared Nemo)'와 히어로 섹션의 '원래 네모(Origin Nemo)' 간의 영점(Zero-point) 기록.
 * 
 * 중요:
 * 1. Origin Nemo의 현재 스크린 위치를 getBoundingClientRect로 실시간 계산.
 * 2. Shared Nemo를 그 위치로 고정(Fixed)시켜, 스크롤 시작 전 두 요소가 완벽히 하나로 겹쳐 보이게 함.
 * 3. 이 과정이 어긋나면 온모드 전환 시 네모가 튀거나 잔상이 남는 '고스트 현상'이 발생함.
 */
export function initNemoState(
  registry: InteractionRegistry,
  nemo: SharedNemoHandle, 
  options: { isOn: boolean; isMobileView: boolean; isTabletPortrait?: boolean; progress?: number; isRestoring?: boolean }
): { left: number; top: number; width: number; height: number } | null {
  const { INTERACTION_Z_INDEX } = registry.constants;
  const { isOn, isMobileView, progress = 0, isRestoring = false } = options;

  // [V28.Refinement] 진행도 가드: 리사이즈 복구 상황을 인지하여 동적 영점 조절을 허용합니다.
  if (progress > 0.001 && !isRestoring) return null;

  const originEl = document.getElementById('hero-nemo-origin');
  if (!nemo.nemoEl || !originEl) return null;
  
  // 실제 돔의 위치와 스타일을 캡처 (SSOT: Single Source of Truth)
  const rect = originEl.getBoundingClientRect();
  const style = window.getComputedStyle(originEl);

  // [V40.SelectiveSync] 진행도에 따른 선택적 동기화
  // progress < 0.02 (바톤 터치 구간) 일 때만 좌표와 크기를 동기화하여 '순간이동' 현상을 방지합니다.
  const shouldSyncPosition = progress < 0.02;

  // 인터랙션용 공유 네모를 캡처된 정적 네모 위치로 동기화 (리사이즈 대응을 위해 좌표는 항상 업데이트)
  gsap.set(nemo.nemoEl, {
    backgroundColor: style.backgroundColor,
    borderRadius: style.borderRadius, 
    border: style.border, 
    borderColor: style.borderColor, 
    boxShadow: style.boxShadow, 
    position: 'fixed',
    zIndex: INTERACTION_Z_INDEX.Z_SHARED_NEMO,
    // [V43] 복구 상황(isRestoring)일 때는 여기서 직접 좌표를 set하지 않습니다. (점프 방지)
    // 좌표 제어권은 전적으로 타임라인 빌더에게 위임합니다.
    ...(shouldSyncPosition && !isRestoring && {
      width: rect.width, 
      height: rect.height, 
      left: rect.left + rect.width / 2, 
      top: rect.top + rect.height / 2,
      xPercent: -50, 
      yPercent: -50, 
    })
  });

  // [V40.FlickerFix] 복구 상황이 아니고 초기 상태(0)일 때만 opacity를 0으로 리셋하여 찰나의 '깜빡임'을 방지합니다.
  if (!isRestoring && progress < 0.001) {
    gsap.set(nemo.nemoEl, { opacity: 0 });
  }

  // [V43] 실측된 픽셀 좌표를 반환하여 빌더가 동적 베이스라인으로 사용할 수 있게 합니다.
  return {
    left: rect.left + rect.width / 2,
    top: rect.top + rect.height / 2,
    width: rect.width,
    height: rect.height
  };
}

/**
 * [V11.Macro_Final] syncNemoCoordinates
 * 네모의 실시간 위치를 캡처하여 전역 CSS 변수(--nemo-t, --nemo-l 등)로 동기화합니다.
 * 이 변수들은 섹션 내부의 컷아웃(Cut-out) 효과나 텍스트 마스킹에 사용됩니다.
 */
/**
 * [V11.Macro_Final] getForWhoTargetRect
 * ForWho 캐러셀의 0번 슬라이드 이미지(nemo-target-forwho-0)의 실시간 뷰포트 좌표를 측정합니다.
 * SharedNemo가 카드로 변신하는 'Identity Morphing'의 최종 목적지로 사용됩니다.
 */
export function getForWhoTargetRect(): { left: number; top: number; width: number; height: number } | null {
  const target = document.getElementById('nemo-target-forwho-0');
  if (!target) return null;

  const rect = target.getBoundingClientRect();
  
  // [V43.Fix] 비정상적인 좌표 캡처 방지 (철벽 가드 V2)
  const isTooHigh = rect.top < window.innerHeight * 0.2;
  const isTooLow = rect.top > window.innerHeight;
  const isTooNarrow = rect.width < 300;
  
  if (isTooHigh || isTooLow || isTooNarrow) {
    return null;
  }

  return {
    left: rect.left + rect.width / 2,
    top: rect.top + rect.height / 2,
    width: rect.width,
    height: rect.height
  };
}

export function syncNemoCoordinates(nemoEl: HTMLElement | null): void {
  if (!nemoEl) return;
  
  const rect = nemoEl.getBoundingClientRect();
  const root = document.documentElement;
  
  root.style.setProperty('--nemo-t', `${rect.top}px`);
  root.style.setProperty('--nemo-r', `${window.innerWidth - rect.right}px`);
  root.style.setProperty('--nemo-b', `${window.innerHeight - rect.bottom}px`);
  root.style.setProperty('--nemo-l', `${rect.left}px`);
}

