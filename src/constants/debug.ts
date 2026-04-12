/**
 * 🔥 [DEBUG-DELETE] : 배포 전 반드시 삭제하거나 USE_DEBUG: false로 설정할 것
 * 개발 중 특정 섹션으로 즉시 점프하기 위한 디버그 설정입니다.
 */
export const DEBUG_CONFIG = {
  USE_DEBUG: true,             // 디버그 모드 활성화 여부
  START_STAGE: 'to_pain',      // 새로고침 시 점프할 섹션 라벨 (interaction.ts의 STAGES 키값)
  FORCE_ON: true               // 히어로 섹션을 건너뛰고 즉시 ON 상태로 시작할지 여부
};
