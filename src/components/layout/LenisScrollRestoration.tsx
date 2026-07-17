'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { STORAGE_KEYS, RESTORE_TIMING } from '@/constants/storage';

/**
 * 세션 스토리지 안전 접근
 */
function safeSessionStorage(): Storage | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}


/**
 * Lenis 스크롤 복원 컴포넌트
 *
 * [V78] popstate 기반 구조 전환:
 * - 기존: "PUSH_NAV 플래그 있으면 top, 없으면 복원" → 플래그 누락 시 의도치 않은 복원
 * - 변경: "popstate(뒤로가기/앞으로가기)일 때만 복원, 그 외 모든 이동은 top:0"
 * - 기본값이 안전한 쪽(top:0)이므로 타이밍 경합이 있어도 항상 안전
 */
export default function LenisScrollRestoration(): null {
  const pathname = usePathname();
  const isPopStateRef = useRef(false);

  // history.scrollRestoration = 'manual' 설정 + popstate 감지
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    const handlePopState = () => {
      isPopStateRef.current = true;
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      if ('scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'auto';
      }
    };
  }, []);

  // pathname 변경 시 스크롤 처리
  // popstate로 인한 이동 → 저장된 위치 복원 시도
  // 그 외 모든 이동(사이드메뉴, 링크, 직접 입력 등) → top:0
  useEffect(() => {
    if (isPopStateRef.current) {
      // 뒤로가기/앞으로가기 → 저장된 위치 복원
      isPopStateRef.current = false;

      // 홈('/')은 GSAP whole-pin 구조이므로 브라우저 scrollY 복원이 무의미 → 스킵
      if (pathname !== '/') {
        const storage = safeSessionStorage();
        const timer = setTimeout(() => {
          const stored = storage?.getItem(`${STORAGE_KEYS.SCROLL_PREFIX}${pathname}`);
          const scrollPosition = stored ? parseFloat(stored) : null;

          if (scrollPosition != null && scrollPosition > 0) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const lenis = (window as any).lenis;
            if (lenis) {
              try {
                lenis.scrollTo(scrollPosition, { immediate: true, force: true, lock: false });
              } catch {
                window.scrollTo({ top: scrollPosition, behavior: 'auto' });
              }
            } else {
              window.scrollTo({ top: scrollPosition, behavior: 'auto' });
            }
          }
        }, RESTORE_TIMING.NORMAL);

        return () => clearTimeout(timer);
      }
    } else {
      // popstate가 아닌 모든 이동 → top:0
      const timer = setTimeout(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const lenis = (window as any).lenis;
        if (lenis) {
          lenis.scrollTo(0, { immediate: true });
        } else {
          window.scrollTo(0, 0);
        }
      }, RESTORE_TIMING.DIRECT);

      return () => clearTimeout(timer);
    }
  }, [pathname]);

  // 스크롤 위치 저장 (popstate 복원용)
  useEffect(() => {
    const saveScrollPosition = (): void => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const scrollY = (window as any).lenis?.scroll ??
        window.scrollY ??
        document.documentElement.scrollTop ??
        0;

      if (scrollY > 0) {
        const storage = safeSessionStorage();
        storage?.setItem(`${STORAGE_KEYS.SCROLL_PREFIX}${pathname}`, scrollY.toString());
      }
    };

    const handleBeforeUnload = (): void => saveScrollPosition();

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      saveScrollPosition();
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [pathname]);

  return null;
}
