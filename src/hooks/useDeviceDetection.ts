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
      ((navigator as Navigator & { msMaxTouchPoints?: number }).msMaxTouchPoints ?? 0) > 0;

    const updateMobile = (): void => setIsMobile(window.innerWidth < 768);

    requestAnimationFrame(() => {
      setIsTouchDevice(checkTouchDevice());
      updateMobile();
    });

    const handleResize = (): void => updateMobile();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return { isTouchDevice, isMobile };
}
