import { useState, useEffect } from 'react';

/**
 * 터치 기기 감지 훅
 * 
 * @returns {Object} { isTouchDevice, isMobile }
 */
export function useDeviceDetection() {
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // 터치 기기 감지
    const checkTouchDevice = () => {
      return 'ontouchstart' in window || 
             navigator.maxTouchPoints > 0 || 
             navigator.msMaxTouchPoints > 0;
    };

    // 모바일 기기 감지
    const checkMobileDevice = () => {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    };

    setIsTouchDevice(checkTouchDevice());
    setIsMobile(checkMobileDevice());

    // 리사이즈 이벤트로 추가 체크
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768 || checkMobileDevice());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return { isTouchDevice, isMobile };
} 