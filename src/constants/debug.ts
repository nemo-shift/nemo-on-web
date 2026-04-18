/**
 * // [DEPLOY-DELETE] : 배포 전 반드시 삭제하거나 USE_DEBUG: false로 설정할 것
 * 개발 중 특정 섹션으로 즉시 점프하기 위한 디버그 설정입니다.
 * 
 * HERO: 'hero',
  HERO_STILL_START: 'hero_still_start',
  HERO_STILL_LOGO_EJECT: 'hero_still_logo_eject',
  HERO_STILL_CONTENT_RISE: 'hero_still_content_rise',
  HERO_STILL_NEMO_REVEAL: 'hero_still_nemo_reveal',
  HERO_STILL_END: 'hero_still_end',
  START_TO_PAIN: 'start_to_pain',
  TO_PAIN: 'to_pain',
  PAIN_CONTENT: 'pain_content',
  PAIN_SHIFT: 'pain_shift',
  RESONANCE: 'resonance',
  PAIN_TO_MSG: 'pain_to_msg',
  TO_MESSAGE: 'to_msg',
  MSG_CONTENT: 'msg_content',
  MSG_TO_FW: 'msg_to_fw',
  TO_FORWHO: 'to_fw',
  FW_CONTENT: 'fw_content',
  FW_TO_STORY: 'fw_to_story',
  TO_STORY: 'to_story',
  STORY_CONTENT: 'story_content',
  TO_CTA: 'to_cta',
  CTA_CONTENT: 'cta_content',
  TO_FOOTER: 'to_footer',
 */
export const DEBUG_CONFIG = {
  USE_DEBUG: true,             // 디버그 모드 활성화 여부
  START_STAGE: 'to_msg',      // 새로고침 시 점프할 섹션 라벨 (interaction.ts의 STAGES 키값)
  FORCE_ON: true               // 히어로 섹션을 건너뛰고 즉시 ON 상태로 시작할지 여부
};
