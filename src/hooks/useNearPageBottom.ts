'use client';

import { useEffect, useState } from 'react';

/**
 * [V75/STEP D] 페이지 하단 근접 여부를 감지하는 훅.
 * About/Offerings 전용 스크롤 힌트의 소멸 조건으로 사용한다.
 */
export function useNearPageBottom(thresholdPx = 80): boolean {
  const [isNearBottom, setIsNearBottom] = useState(false);

  useEffect(() => {
    let rafId = 0;

    const check = () => {
      const scrollY = window.scrollY;
      const viewport = window.innerHeight;
      const fullHeight = document.documentElement.scrollHeight;
      setIsNearBottom(scrollY + viewport >= fullHeight - thresholdPx);
    };

    const onScroll = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(check);
    };

    check();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [thresholdPx]);

  return isNearBottom;
}
