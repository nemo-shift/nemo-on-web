'use client';

import { useState, useEffect } from 'react';

/**
 * 터치 기기 감지 훅
 *
 * @returns { isTouchDevice, isMobile }
 */
export function useDeviceDetection(): {
  isMobile: boolean;
  isMobileView: boolean;
  isTabletPortrait: boolean;
  interactionMode: 'mouse' | 'touch';
  isInitialized: boolean;
  } {
  const [device, setDevice] = useState<{
    isMobile: boolean;
    isMobileView: boolean;
    isTabletPortrait: boolean;
    interactionMode: 'mouse' | 'touch';
    isInitialized: boolean;
  }>({
    isMobile: false,
    isMobileView: false,
    isTabletPortrait: false,
    interactionMode: 'mouse',
    isInitialized: false,
  });

  useEffect(() => {
    const updateDevice = (): void => {
      const width = window.innerWidth;
      const hasFinePointer = window.matchMedia('(pointer: fine) and (hover: hover)').matches;
      
      setDevice({
        // [v11.32] UI 브레이크포인트 축
        isMobile: width < 744,
        isTabletPortrait: width >= 744 && width < 992,
        isMobileView: width < 992, 

        // [v11.32] UX 인터랙션 축
        interactionMode: hasFinePointer ? 'mouse' : 'touch',
        
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
