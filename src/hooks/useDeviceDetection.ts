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
} {
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkTouchDevice = (): boolean =>
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      (navigator as Navigator & { msMaxTouchPoints?: number }).msMaxTouchPoints > 0;

    const checkMobileDevice = (): boolean =>
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );

    setIsTouchDevice(checkTouchDevice());
    setIsMobile(checkMobileDevice());

    const handleResize = (): void => {
      setIsMobile(window.innerWidth <= 768 || checkMobileDevice());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return { isTouchDevice, isMobile };
}
