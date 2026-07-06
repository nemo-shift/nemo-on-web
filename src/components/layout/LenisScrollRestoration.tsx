'use client';

import { useEffect } from 'react';
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
 */
export default function LenisScrollRestoration(): null {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    return () => {
      if ('scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'auto';
      }
    };
  }, []);

  // pathname 변경 시 스크롤 복원 또는 상단 이동
  // [V72] getNavigationType() 제거 — SideMenu.navigateTo()가 심은 PUSH_NAV 플래그만 본다.
  // 플래그 있음(메뉴/링크 명시적 이동) → top:0 강제.
  // 플래그 없음(뒤로가기·새로고침·직접 입력) → 저장된 위치 복원 시도.
  useEffect(() => {
    const storage = safeSessionStorage();
    const isPushNav = storage?.getItem('PUSH_NAV') === '1';

    if (isPushNav) {
      storage?.removeItem('PUSH_NAV');
      setTimeout(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const lenis = (window as any).lenis;
        if (lenis) {
          lenis.scrollTo(0, { immediate: true });
        } else {
          window.scrollTo(0, 0);
        }
      }, RESTORE_TIMING.DIRECT);
      return;
    }

    // 플래그 없음: 뒤로가기·새로고침·직접 입력 → 저장된 위치 복원
    if (pathname !== '/') {
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
  }, [pathname]);

  // 스크롤 위치 저장
  useEffect(() => {
    const saveScrollPosition = (): void => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const scrollY = (window as any).lenis?.scroll ??
        window.pageYOffset ??
        document.documentElement.scrollTop ??
        0;

      if (scrollY > 0) {
        const storage = safeSessionStorage();
        storage?.setItem(`${STORAGE_KEYS.SCROLL_PREFIX}${pathname}`, scrollY.toString());
      }
    };

    const handleBeforeUnload = (): void => saveScrollPosition();
    const handlePopState = (): void => saveScrollPosition();

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);

    return () => {
      saveScrollPosition();
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [pathname]);

  return null;
}
