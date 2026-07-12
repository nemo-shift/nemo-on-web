'use client';

import { useState, useEffect } from 'react';

/**
 * [Header Theme Hook]
 * body[data-header-theme="light"] 속성을 MutationObserver로 감시.
 * Offerings Studio 구간(어두운 배경) 진입 시 OfferingsStage가 attribute를 토글하면
 * Header / MenuToggle이 자동으로 흰색으로 전환됩니다.
 */
export function useHeaderTheme(): 'dark' | 'light' {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const sync = () => {
      setTheme(document.body.dataset.headerTheme === 'light' ? 'light' : 'dark');
    };

    // 초기값 동기화
    sync();

    const observer = new MutationObserver(sync);
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['data-header-theme'],
    });

    return () => observer.disconnect();
  }, []);

  return theme;
}
