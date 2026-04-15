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
 * 네비게이션 타입 감지
 * - 'navigate' → direct (URL 직접 입력, Link 클릭)
 * - 'traverse' (back_forward) → normal (뒤로/앞으로가기)
 * window.navigation API 없으면 sessionStorage 폴백
 */
function getNavigationType(): 'direct' | 'normal' {
  if (typeof window === 'undefined') return 'direct';

  // Navigation API (최신)
  const nav = (window as Window & { navigation?: { type?: string } }).navigation;
  if (nav?.type) {
    if (nav.type === 'navigate' || nav.type === 'reload') return 'direct';
    if (nav.type === 'traverse') return 'normal';
  }

  // PerformanceNavigationTiming (초기 로드 시)
  const perfEntries = performance.getEntriesByType?.('navigation');
  const navEntry = perfEntries?.[0] as { type?: string } | undefined;
  if (navEntry?.type) {
    if (navEntry.type === 'navigate' || navEntry.type === 'reload')
      return 'direct';
    if (navEntry.type === 'back_forward') return 'normal';
  }

  // sessionStorage 폴백
  const storage = safeSessionStorage();
  if (storage) {
    const stored = storage.getItem(STORAGE_KEYS.NAV_TYPE);
    if (stored === 'normal') {
      storage.removeItem(STORAGE_KEYS.NAV_TYPE);
      return 'normal';
    }
  }

  return 'direct';
}

/**
 * Lenis 스크롤 복원 컴포넌트
 */
export default function LenisScrollRestoration(): null {
  const pathname = usePathname();
  const popStateFlagRef = useRef(false);

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

  // popstate 시 'normal' 플래그 설정
  useEffect(() => {
    const handlePopState = () => {
      popStateFlagRef.current = true;
      const storage = safeSessionStorage();
      storage?.setItem(STORAGE_KEYS.NAV_TYPE, 'normal');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // pathname 변경 시 스크롤 복원 또는 상단 이동
  useEffect(() => {
    const navType = popStateFlagRef.current ? 'normal' : getNavigationType();
    popStateFlagRef.current = false;

    // 홈('/') 제외 - 항상 0에서 시작
    if (navType === 'normal' && pathname !== '/') {
      const timer = setTimeout(() => {
        const storage = safeSessionStorage();
        const stored = storage?.getItem(`${STORAGE_KEYS.SCROLL_PREFIX}${pathname}`);
        const scrollPosition = stored ? parseFloat(stored) : null;

        if (
          scrollPosition != null &&
          typeof scrollPosition === 'number' &&
          scrollPosition > 0
        ) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          if ((window as any).lenis) {
            try {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (window as any).lenis.scrollTo(scrollPosition, {
                immediate: true,
                force: true,
                lock: false,
              });
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

    if (getNavigationType() === 'direct') {
      setTimeout(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((window as any).lenis) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (window as any).lenis.scrollTo(0, { immediate: true });
        } else {
          window.scrollTo(0, 0);
        }
      }, RESTORE_TIMING.DIRECT);
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
