import { gsap } from 'gsap';
import { 
  COLORS, STAGES, TIMING_CFG, LOGO_SIZE, HEADER_POS, INTERACTION_Z_INDEX 
} from '@/constants/interaction';
import { JOURNEY_MASTER_CONFIG } from '@/data/home/journey';
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
export function calculateLabels(mode: 'mouse' | 'touch' = 'mouse') {
  const isTouch = mode === 'touch';
  const w = TIMING_CFG.SECTION_WEIGHT;
  const t = TIMING_CFG.TRANSITION_WEIGHT;

  let curr = 0;
  const offsets: Record<string, number> = {};

  // ... (상단 히어로 및 페인 로직 유지)
  offsets[STAGES.HERO] = curr;
  offsets[STAGES.HERO_STILL_START] = curr;
  curr += w.HERO_STILL * 0.4; offsets[STAGES.HERO_STILL_LOGO_EJECT] = curr;
  curr += w.HERO_STILL * 0.35; offsets[STAGES.HERO_STILL_CONTENT_RISE] = curr;
  curr += w.HERO_STILL * 0.2; offsets[STAGES.HERO_STILL_NEMO_REVEAL] = curr;
  curr += w.HERO_STILL * 0.05; offsets[STAGES.HERO_STILL_END] = curr;

  offsets[STAGES.START_TO_PAIN] = curr;
  curr += t;
  offsets[STAGES.TO_PAIN] = curr; 

  curr += w.PAIN_STILL * 0.5; offsets[STAGES.PAIN_CONTENT] = curr;
  curr += w.PAIN_STILL * 0.5; offsets[STAGES.PAIN_SHIFT] = curr;

  // 공명 지평선 모핑 구간 (터치 기기는 호흡을 짧게 가져감)
  const morphGap = isTouch ? 0.4 : 1.5;
  curr += morphGap;
  offsets[STAGES.RESONANCE] = curr;

  // 공명 마퀴 스튜디오 구간 (초스피드 반응 대응: 5.0 -> 4.0 추가 하향)
  const resonanceStill = isTouch ? 2.0 : w.RESONANCE_STILL;
  curr += resonanceStill;

  // 페인 -> 메시지 브릿지 (전이 호흡 최적화)
  const transGap = isTouch ? 0.8 : 1.5;
  curr += transGap;
  offsets[STAGES.PAIN_TO_MSG] = curr;

  curr += transGap;
  offsets[STAGES.TO_MESSAGE] = curr;

  // 메시지 섹션 정지 가중치 (마우스 환경에서 리빌 디테일 감상을 위해 상향: 12.0 -> 18.0)
  const messageStill = isTouch ? w.MESSAGE_STILL : 30.0;
  curr += messageStill;
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

// [V11.34-P5] 모드(ON/OFF) 및 기기(isMobile)에 따른 전역 CSS 변수를 '동기적으로' 즉시 주입.
// [V11.18 Fix] 리사이즈 시 현재 진행도를 무시하고 히어로 색상으로 초기화되는 현상을 방지하기 위해 가드 추가.
export function initGlobalStyles(isOn: boolean, isMobile: boolean) {
  // [V11.18 교훈] 타임라인이 이미 구축되어 진행 중이라면, 외부 함수가 배경색을 함부로 건드리지 못하게 함.
  // 이 가드가 없으면 리사이즈 시 다크 배경이 찰나의 순간에 크림색으로 튀는 현상이 발생함.
  if (typeof window !== 'undefined') {
    const stageContainer = document.getElementById('home-stage');
    // 타임라인이 이미 빌드되어 특정 위치에 있다면 초기화 생략 (타임라인의 권한 존중)
    // 0.001은 아주 미미한 스크롤이라도 진행된 상태를 의미함.
    if ((window as any)._masterTlProgress > 0.001) return;
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
  logo: JourneyLogoHandle, 
  options: { isOn: boolean; isMobile: boolean; isTabletPortrait?: boolean }
): void {
  const { isOn, isMobile } = options;
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

  // 로고 컨테이너 초기 정렬: 상단 좌측 고정 (Editorial Layout)
  gsap.set(container, {
    x: 0,
    y: 0,
    scale: 1, 
    transformOrigin: 'top left',
    visibility: 'visible',
    opacity: 1
  });

  // 하위 엘리먼트 가시성 설정
  gsap.set(logo.nemoKrEl, { opacity: logoCfg.nemoKr ? 1 : 0, visibility: logoCfg.nemoKr ? 'visible' : 'hidden' });
  gsap.set(logo.shapesEl, { opacity: logoCfg.shapes ? 0.8 : 0, visibility: logoCfg.shapes ? 'visible' : 'hidden' });
  gsap.set(logo.statusEl, { opacity: logoCfg.status ? 1 : 0, visibility: logoCfg.status ? 'visible' : 'hidden' });
  gsap.set(logo.rectangleEl, { opacity: logoCfg.rectangle ? 1 : 0, visibility: logoCfg.rectangle ? 'visible' : 'hidden' });
  
  // [+] 형태에서 [-] 형태로의 모핑 포인트를 픽셀 단위로 정밀 제어
  if (logo.tLines.h && logo.tLines.v) {
    const isPlus = logoCfg.morph === '+';
    // [v26.98 UI Detail] 고해상도 소스에 맞춘 좌표 스케일 업 (12px -> 60px)
    gsap.set(logo.tLines.h, { width: '100%', top: isPlus ? '60px' : '20px', left: 0 });
    gsap.set(logo.tLines.v, { height: '100%', top: isPlus ? '20px' : '20px' });
  }
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
  nemo: SharedNemoHandle, 
  options?: { isOn: boolean; isMobileView: boolean; isTabletPortrait?: boolean }
): void {
  const originEl = document.getElementById('hero-nemo-origin');
  if (!nemo.nemoEl || !originEl) return;
  
  // 실제 돔의 위치와 스타일을 캡처 (SSOT: Single Source of Truth)
  const rect = originEl.getBoundingClientRect();
  const style = window.getComputedStyle(originEl);
  
  // 인터랙션용 공유 네모를 캡처된 정적 네모 위치로 동기화
  gsap.set(nemo.nemoEl, {
    width: rect.width, height: rect.height, 
    left: rect.left + rect.width / 2, top: rect.top + rect.height / 2,
    xPercent: -50, yPercent: -50, 
    borderRadius: style.borderRadius, 
    backgroundColor: style.backgroundColor,
    border: style.border, 
    borderColor: style.borderColor, 
    boxShadow: style.boxShadow, 
    opacity: 0, // 초기에는 숨김 처리 후 히어로 스왑 시퀀스에서 노출
    position: 'fixed',
    zIndex: INTERACTION_Z_INDEX.SHARED_NEMO,
  });
}
