import { DEBUG_CONFIG } from '@/constants/debug';

/**
 * // [DEPLOY-DELETE] : 배포 전 삭제 예정
 * 디버그 모드에서만 컬러풀한 로그를 출력하는 유틸리티입니다.
 * 일반 시스템 로그와 시각적으로 분리하여 실수를 방지합니다.
 */
export const debugLog = (message: string, data?: any) => {
  if (!DEBUG_CONFIG.USE_DEBUG) return;
  
  const style = 'background: #0891b2; color: white; padding: 2px 5px; border-radius: 3px; font-weight: bold;';
  if (data) {
    console.log(`%c[DEBUG]%c ${message}`, style, '', data);
  } else {
    console.log(`%c[DEBUG]%c ${message}`, style, '');
  }
};
