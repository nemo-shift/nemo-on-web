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
  isTablet: boolean;
  isPC: boolean;
  isInitialized: boolean;
} {
  const [device, setDevice] = useState({
    isTouchDevice: false,
    isMobile: false, // 서버에서는 기본적으로 PC(false)로 가정하거나 안전값 유지
    isTablet: false,
    isPC: false,
    isInitialized: false,
  });

  useEffect(() => {
    const checkTouchDevice = (): boolean =>
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      ((navigator as any).msMaxTouchPoints ?? 0) > 0;

    const updateDevice = (): void => {
      const width = window.innerWidth;
      setDevice({
        isTouchDevice: checkTouchDevice(),
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isPC: width >= 1024,
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
