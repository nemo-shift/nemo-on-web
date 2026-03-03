'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

const SESSION_KEY_PREFIX = 'scroll-';
const NAV_TYPE_KEY = 'lenis-nav-type';

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

  // Navigation API (최신) - 표준 타입에 없을 수 있음
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

  // sessionStorage 폴백 (popstate에서 'normal' 설정)
  const storage = safeSessionStorage();
  if (storage) {
    const stored = storage.getItem(NAV_TYPE_KEY);
    if (stored === 'normal') {
      storage.removeItem(NAV_TYPE_KEY);
      return 'normal';
    }
  }

  return 'direct';
}

/**
 * Lenis 스크롤 복원 컴포넌트
 * 뒤로가기/앞으로가기 시 Lenis로 스크롤 위치 복원
 * 페이지 이동 시 스크롤 위치를 세션 스토리지에 저장
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
      storage?.setItem(NAV_TYPE_KEY, 'normal');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // pathname 변경 시 스크롤 복원 또는 상단 이동
  useEffect(() => {
    const navType = popStateFlagRef.current ? 'normal' : getNavigationType();
    popStateFlagRef.current = false;

    if (navType === 'normal') {
      const timer = setTimeout(() => {
        const storage = safeSessionStorage();
        const stored = storage?.getItem(`${SESSION_KEY_PREFIX}${pathname}`);
        const scrollPosition = stored ? parseFloat(stored) : null;

        if (
          scrollPosition != null &&
          typeof scrollPosition === 'number' &&
          scrollPosition > 0
        ) {
          if (window.lenis) {
            try {
              window.lenis.scrollTo(scrollPosition, {
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
      }, 150);

      return () => clearTimeout(timer);
    }

    if (navType === 'direct') {
      setTimeout(() => {
        if (window.lenis) {
          window.lenis.scrollTo(0, { immediate: true });
        } else {
          window.scrollTo(0, 0);
        }
      }, 50);
    }
  }, [pathname]);

  // 스크롤 위치 저장
  useEffect(() => {
    const saveScrollPosition = (): void => {
      const scrollY =
        window.lenis?.scroll ??
        window.pageYOffset ??
        document.documentElement.scrollTop ??
        0;

      if (scrollY > 0) {
        const storage = safeSessionStorage();
        storage?.setItem(`${SESSION_KEY_PREFIX}${pathname}`, scrollY.toString());
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
