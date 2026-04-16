import { gsap } from 'gsap';
import { GlobalBuilderOptions } from '../types';
import { JourneyLogoHandle } from '../JourneyLogo';
import { SharedNemoHandle } from '../SharedNemo';

/**
 * [V11.Macro_Final] buildWarmupTimeline
 * 타임라인 시작 직후, 기기 환경에 따른 개별 요소들의 '히어로 기준 좌표'를 강제 설정합니다.
 * 이 시퀀스를 분리함으로써 GlobalInteractionStage의 코드 비대화를 방지합니다.
 */
export function buildWarmupTimeline(
  tl: gsap.core.Timeline,
  logo: JourneyLogoHandle,
  nemo: SharedNemoHandle,
  options: GlobalBuilderOptions,
  L: Record<string, number>
) {
  const { isMobile, isTabletPortrait, registry } = options;
  const { STAGES, HEADER_POS } = registry.constants;
  const { JOURNEY_MASTER_CONFIG } = registry.data;

  // 1. 모바일 환경 로고 Y 오프셋 보정
  if (isMobile && logo.containerEl) {
    tl.to(logo.containerEl, { 
      y: -JOURNEY_MASTER_CONFIG[STAGES.HERO].logo.y,
      duration: 0 
    }, L[STAGES.HERO_STILL_START]);
  }

  // 2. Nemo 초기 형태(헤더 위치/크기) 리셋
  if (nemo.nemoEl) {
    tl.to(nemo.nemoEl, { 
      borderRadius: isMobile 
        ? HEADER_POS.MOBILE.OFFSET_BT 
        : (isTabletPortrait ? HEADER_POS.TABLET.OFFSET_BT : HEADER_POS.PC.OFFSET_BT),
      width: isMobile 
        ? HEADER_POS.MOBILE.WIDTH 
        : (isTabletPortrait ? HEADER_POS.TABLET.WIDTH : HEADER_POS.PC.WIDTH),
      height: isMobile 
        ? HEADER_POS.MOBILE.HEIGHT 
        : (isTabletPortrait ? HEADER_POS.TABLET.HEIGHT : HEADER_POS.PC.HEIGHT),
      duration: 0 
    }, L[STAGES.HERO_STILL_START]);
  }
}
