import { gsap } from 'gsap';
import { STAGES } from '@/constants/interaction';
import { ForWhoSectionHandle } from '../forwho/ForWhoSection';
import { GlobalBuilderOptions } from '../types';

import { SharedNemoHandle } from '../SharedNemo';

/**
 * [V11.75] buildForWhoTimeline
 * 포후 섹션의 시네마틱 오프닝(Step B)과 캐러셀 전환(Step C)을 관장합니다.
 */
export function buildForWhoTimeline(
  tl: gsap.core.Timeline,
  L: Record<string, number>,
  forwho: ForWhoSectionHandle | null,
  nemo: SharedNemoHandle | null, // 네모 핸들 추가
  options: GlobalBuilderOptions
) {
  if (!forwho || !nemo?.nemoEl) return;

  const { constants, data } = options.registry;
  const { NEMO_RESPONSIVE_LAYOUT, EASE, TIMING_CFG } = constants;
  const FORWHO_FRAME = NEMO_RESPONSIVE_LAYOUT.FORWHO_FRAME;
  const { JOURNEY_MASTER_CONFIG } = data;

  // 1. 레이블 기반 구간 설정
  const start = L[STAGES.TO_FORWHO];        // 도착 (Full-bleed 상태)
  const content = L[STAGES.FW_CONTENT];      // 내부 전이 구간 시작
  const end = L[STAGES.FW_TO_STORY];         // 다음 섹션 이동 전
  
  // [Architecture] 레이아웃 모드 결정 원칙
  // - options.isMobileView: 화면 너비 기반 (폰 전용 레이아웃 수치 선택용)
  // - options.isMobile: 터치 기기 여부 기반 (스크롤 감도/무게 조절용)
  // 여기서는 프레임의 '크기'를 결정하므로 너비 기반(View) 변수를 사용합니다.
  const mode = options.isMobileView ? 'MOBILE' : 
               options.isTabletPortrait ? 'TABLET_P' : 'PC';
               
  const r = TIMING_CFG.TRANSITION_FINISH_RATIO;
  
  const duration = (end - start);
  const introEnd = start + (duration * 0.4); // 40% 지점까지 인트로(Step B)
  const frameMorphStart = introEnd;           // 이후 캐러셀 프레임 변환(Step C)

  // --- STEP B: Intro Reveal ---
  if (forwho.introTextRef.current) {
    tl.to(forwho.introTextRef.current, {
      opacity: 1,
      y: 0,
      duration: (introEnd - start) * r,
      ease: EASE.TRANSITION
    }, start);
  }

  // --- STEP C: Carousel Transformation ---
  
  // 1) Nemo Morphing (Full-bleed -> Frame)
  const frame = FORWHO_FRAME[mode];
  tl.to(nemo.nemoEl, {
    width: frame.w,
    height: frame.h,
    left: frame.left,
    top: frame.top,
    borderRadius: frame.borderRadius,
    duration: (end - frameMorphStart) * r,
    ease: EASE.TRANSITION
  }, frameMorphStart);

  // 2) Intro Text Migration (Center-Right -> Top-Header)
  // [Detail] 텍스트가 단순히 사라지는 게 아니라 캐러셀의 타이틀 좌측 상단으로 이동하는 느낌
  if (forwho.introTextRef.current) {
    tl.to(forwho.introTextRef.current, {
      top: '12%', 
      left: mode === 'PC' ? '14%' : '5%',
      right: 'auto',
      x: 0,
      scale: 0.6,
      opacity: 0.8,
      duration: (end - frameMorphStart) * r,
      ease: EASE.TRANSITION
    }, frameMorphStart);
  }

  // 3) Carousel Frame Reveal
  if (forwho.contentWrapperRef.current) {
    tl.to(forwho.contentWrapperRef.current, {
      opacity: 1,
      pointerEvents: 'auto',
      duration: (end - frameMorphStart) * r,
      ease: EASE.TRANSITION
    }, frameMorphStart);
  }
}
