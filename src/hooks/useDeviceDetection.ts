'use client';

import { useState, useEffect } from 'react';

/**
 * 터치 기기 감지 훅
 *
 * @returns { isTouchDevice, isMobile }
 */
export function useDeviceDetection(): {
  isTouchDevice: boolean;
  isMobile: boolean;
  isMidRange: boolean;
  isPC: boolean;
  interactionMode: 'mouse' | 'touch';
  isMobileView: boolean;
  isTabletPortrait: boolean; // [v1.6] 768px~991px 구간 보정용
  isInitialized: boolean;
} {
  const [device, setDevice] = useState<{
    isTouchDevice: boolean;
    isMobile: boolean;
    isMidRange: boolean;
    isPC: boolean;
    interactionMode: 'mouse' | 'touch';
    isMobileView: boolean;
    isTabletPortrait: boolean;
    isInitialized: boolean;
  }>({
    isTouchDevice: false,
    isMobile: false,
    isMidRange: false,
    isPC: false,
    interactionMode: 'mouse',
    isMobileView: false,
    isTabletPortrait: false,
    isInitialized: false,
  });

  useEffect(() => {
    const checkTouchDevice = (): boolean =>
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      ((navigator as any).msMaxTouchPoints ?? 0) > 0;

    const updateDevice = (): void => {
      const width = window.innerWidth;
      const hasFinePointer = window.matchMedia('(pointer: fine) and (hover: hover)').matches;
      
      setDevice({
        isTouchDevice: checkTouchDevice(),
        // [v1.6] Level 1: Mobile (0~767)
        isMobile: width < 744,
        // [v1.6] Level 2: Tablet Portrait (768~991)
        isTabletPortrait: width >= 744 && width < 992,
        // [v1.6] Level 3-A: Mid Range (Tablet Landscape + Small PC) (992~1199)
        isMidRange: width >= 992 && width < 1200,
        // [v1.6] Level 3-B: Desktop (Wide) (1200~)
        isPC: width >= 1200,
        interactionMode: hasFinePointer ? 'mouse' : 'touch',
        isMobileView: width < 992, 
        isInitialized: true,
      });
    };

    // 초기 마운트 시 즉시 실행 (Next.js 하이드레이션 이후 타이밍)
    updateDevice();

    const handleResize = (): void => updateDevice();
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return device;
}
