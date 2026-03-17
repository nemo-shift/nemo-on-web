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
  } {
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isPC, setIsPC] = useState(false);

  useEffect(() => {
    const checkTouchDevice = (): boolean =>
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      ((navigator as Navigator & { msMaxTouchPoints?: number }).msMaxTouchPoints ?? 0) > 0;

    const updateDevice = (): void => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
      setIsPC(width >= 1024);
    };

    requestAnimationFrame(() => {
      setIsTouchDevice(checkTouchDevice());
      updateDevice();
    });

    const handleResize = (): void => updateDevice();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return { isTouchDevice, isMobile, isTablet, isPC };
}
