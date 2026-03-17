'use client';

import { useEffect, useState } from 'react';

/**
 * 스크롤 방향 감지 훅
 * Lenis scroll 이벤트 기반으로 스크롤 방향을 반환
 *
 * @param threshold - 방향 변경 판정 최소 픽셀 차이 [기본값: 10]
 * @returns scrollDirection - 'up' | 'down' | null (초기/정지 시 null)
 */
export default function useScrollDirection(
  threshold = 10
): { scrollDirection: 'up' | 'down' | null } {
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down' | null>(
    null
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let lastScrollY = 0;
    let ticking = false;

    const updateDirection = () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const lenis = (window as any).lenis;
      const currentScroll =
        lenis && typeof lenis.scroll === 'number' ? lenis.scroll : window.scrollY;

      const diff = currentScroll - lastScrollY;
      if (Math.abs(diff) >= threshold) {
        setScrollDirection(diff > 0 ? 'down' : 'up');
        lastScrollY = currentScroll;
      }
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(updateDirection);
        ticking = true;
      }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const lenis = (window as any).lenis;
    if (lenis && typeof lenis.on === 'function') {
      const unsubscribe = lenis.on('scroll', handleScroll);
      return () => {
        if (typeof unsubscribe === 'function') {
          unsubscribe();
        }
      };
    }

    // Lenis 미준비 시 window scroll fallback
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold]);

  return { scrollDirection };
}
