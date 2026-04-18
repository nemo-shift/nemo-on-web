import { STAGES, EASE, TIMING_CFG } from '@/constants/interaction';
import { JourneySectionConfig } from './types';

/**
 * 로고 애니메이션 시퀀스 정의 [Phase 4-1 Data]
 */
export const LOGO_JOURNEY_SECTIONS = [
  { label: STAGES.START_TO_PAIN, stage: STAGES.START_TO_PAIN },
  { label: STAGES.RESONANCE, stage: STAGES.RESONANCE },
  { label: STAGES.PAIN_TO_MSG, stage: STAGES.PAIN_TO_MSG },
  { label: STAGES.TO_MESSAGE, stage: STAGES.TO_MESSAGE },
  { label: STAGES.MSG_TO_FW, stage: STAGES.MSG_TO_FW },
  { label: STAGES.CORE_FUNNEL_EXPAND, stage: STAGES.TO_FORWHO }, // [V18.Fix] 팽창 시작 시점에 맞춰 + 모핑 시작
  { label: STAGES.TO_FORWHO, stage: STAGES.TO_FORWHO },
  { label: STAGES.FW_TO_STORY, stage: STAGES.FW_TO_STORY },
  { label: STAGES.TO_STORY, stage: STAGES.TO_STORY },
  { label: STAGES.TO_CTA, stage: STAGES.TO_CTA }
];

/**
 * 네모(Nemo) 상자 변형 시퀀스 정의
 */
export const NEMO_JOURNEY_SECTIONS: JourneySectionConfig[] = [
  { label: STAGES.START_TO_PAIN, stage: STAGES.START_TO_PAIN, ease: EASE.TRANSITION },
  { label: STAGES.TO_PAIN, stage: STAGES.TO_PAIN, ease: EASE.BOUNCE },
  { label: STAGES.PAIN_CONTENT, stage: STAGES.TO_PAIN, ease: EASE.SETTLE }, // 브릿지 구간까지 박스 유지
  { label: STAGES.RESONANCE, stage: STAGES.RESONANCE, ease: EASE.TRANSITION }, // 여기서 선으로 완성
  { label: STAGES.PAIN_TO_MSG, stage: STAGES.PAIN_TO_MSG, ease: EASE.TRANSITION },
  { label: STAGES.TO_MESSAGE, stage: STAGES.TO_MESSAGE, ease: TIMING_CFG.EASE_TRANS },
  { label: STAGES.MSG_TO_FW, stage: STAGES.MSG_TO_FW, ease: EASE.TRANSITION },
  { label: STAGES.TO_FORWHO, stage: STAGES.TO_FORWHO, ease: EASE.TRANSITION },
  { label: STAGES.FW_TO_STORY, stage: STAGES.FW_TO_STORY, ease: EASE.SETTLE },
  { label: STAGES.TO_STORY, stage: STAGES.TO_STORY, ease: EASE.SETTLE },
  { label: STAGES.TO_CTA, stage: STAGES.TO_CTA, ease: EASE.SETTLE }
];
