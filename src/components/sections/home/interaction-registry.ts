import { InteractionRegistry } from './types';
import { 
  STAGES, 
  COLORS, 
  TIMING_CFG, 
  EASE, 
  ANIMS_CFG, 
  LAYOUT_SPEC, 
  NEMO_SIZE, 
  LOGO_SIZE, 
  SECTION_SCROLL_HEIGHT, 
  NEMO_RESPONSIVE_LAYOUT,
  HEADER_POS,
  INTERACTION_Z_INDEX 
} from '@/constants/interaction';
import { JOURNEY_MASTER_CONFIG } from '@/data/home/journey';
import { LOGO_JOURNEY_SECTIONS, NEMO_JOURNEY_SECTIONS } from '@/data/home/interaction-journey';
import { PAIN_POINTS, RESONANCE_MESSAGE } from '@/data/home/pain';
import { MESSAGE_COLORS } from '@/data/home/message';

/**
 * // [V11.20] 전역 인터랙션 레지스트리 (중앙 보급 기지)
 * 
 * 모든 빌더들이 직접 상수를 import하지 않고 이 레지스트리를 통해 값을 공급받도록 함으로써,
 * 빌더의 순수성(Purity)과 관제탑(GlobalInteractionStage)의 제어권을 확보합니다.
 */
export const INTERACTION_REGISTRY: InteractionRegistry = {
  constants: {
    STAGES,
    COLORS,
    TIMING_CFG,
    EASE,
    ANIMS_CFG,
    LAYOUT_SPEC,
    NEMO_SIZE,
    LOGO_SIZE,
    SECTION_SCROLL_HEIGHT,
    NEMO_RESPONSIVE_LAYOUT,
    HEADER_POS,
    INTERACTION_Z_INDEX,
  },
  data: {
    JOURNEY_MASTER_CONFIG,
    LOGO_JOURNEY_SECTIONS,
    NEMO_JOURNEY_SECTIONS,
    PAIN_POINTS,
    RESONANCE_MESSAGE,
    MESSAGE_COLORS,
  }
};
