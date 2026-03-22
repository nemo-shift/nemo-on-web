import { STAGES, EASE, TIMING_CFG } from '@/constants/interaction';
import { JourneySectionConfig } from './types';

/**
 * 로고 애니메이션 시퀀스 정의 [Phase 4-1 Data]
 */
export const LOGO_JOURNEY_SECTIONS = [
  { label: STAGES.START_TO_PAIN, stage: STAGES.START_TO_PAIN },
  { label: STAGES.RESONANCE, stage: STAGES.RESONANCE },
  { label: STAGES.TO_MESSAGE, stage: STAGES.TO_MESSAGE },
  { label: STAGES.TO_FORWHO, stage: STAGES.TO_FORWHO },
  { label: STAGES.TO_CTA, stage: STAGES.TO_CTA }
];

/**
 * 네모(Nemo) 상자 변형 시퀀스 정의
 */
export const NEMO_JOURNEY_SECTIONS: JourneySectionConfig[] = [
  { label: STAGES.START_TO_PAIN, stage: STAGES.START_TO_PAIN, ease: EASE.TRANSITION },
  { label: STAGES.TO_PAIN, stage: STAGES.TO_PAIN, ease: EASE.BOUNCE },
  { label: STAGES.PAIN_CONTENT, stage: STAGES.RESONANCE, ease: EASE.SETTLE },
  { label: STAGES.TO_MESSAGE, stage: STAGES.TO_MESSAGE, ease: TIMING_CFG.EASE_TRANS },
  { label: STAGES.TO_FORWHO, stage: STAGES.TO_FORWHO, ease: EASE.TRANSITION },
  { label: STAGES.TO_CTA, stage: STAGES.TO_CTA, ease: EASE.SETTLE }
];
