'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useDeviceDetection } from '@/hooks/useDeviceDetection';

type HeroContextType = {
  isOn: boolean;
  isTransitioning: boolean;
  toggle: () => void;
  setIsTransitioning: (val: boolean) => void;
  isScrollable: boolean;
  setIsScrollable: (val: boolean) => void;
  isTimelineReady: boolean;
  setIsTimelineReady: (val: boolean) => void;
  isMobile: boolean;
  isTablet: boolean;
  isPC: boolean;
  footerHeight: number;
  setFooterHeight: (val: number) => void;
};

const HeroContext = createContext<HeroContextType>({
  isOn: false,
  isTransitioning: false,
  toggle: () => {},
  setIsTransitioning: () => {},
  isScrollable: false,
  setIsScrollable: () => {},
  isTimelineReady: false,
  setIsTimelineReady: () => {},
  isMobile: false,
  isTablet: false,
  isPC: false,
  footerHeight: 0,
  setFooterHeight: () => {},
});

export function HeroProvider({ children }: { children: React.ReactNode }): React.ReactElement {
  const { isMobile, isTablet, isPC } = useDeviceDetection();
  const [isOn, setIsOn] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isScrollable, setIsScrollable] = useState(false);
  const [isTimelineReady, setIsTimelineReady] = useState(false);
  const [footerHeight, setFooterHeight] = useState(0);
  const pathname = usePathname();

  // 전역 토글 핸들러 (일방향: OFF -> ON만 허용)
  const toggle = useCallback(() => {
    setIsOn((prev) => {
      if (prev) return prev; // 이미 ON이면 리턴값 유지 (변경 없음)
      
      // 처음 ON으로 전환될 때만 실행
      setIsScrollable(false); // 인트로 시퀀스 완료 전까지 스크롤 잠금
      return true;
    });
  }, []);

  /* [v26.34] 지능형 자동 ON 엔진 영구 제거 (사용자 요청: 수동 진입만 허용) */

  // [V5.4 Fix] 홈('/') 복귀 시 모바일 한정 엔진 핸드셰이크 + 영점 강제 동기화 (V5)
  useEffect(() => {
    if (pathname === '/' && isMobile && isOn) {
      setIsTimelineReady(false);
      setIsScrollable(false);
      
      // [V5.4] 브라우저 표준 API를 활용하여 GSAP 빌드 전 영점 보정
      if (typeof window !== 'undefined') {
        window.history.scrollRestoration = 'manual';
        window.scrollTo(0, 0);
      }
    }
  }, [pathname, isMobile, isOn]);

  // [v26.34] 전역 스크롤 잠금 로직 (Hero ON 인트로 완료 전까지 잠금)
  // [v5.4 Fix] 서브 페이지에서는 스크롤 잠금이 발생하지 않도록 경로 조건(pathname === '/') 추가
  useEffect(() => {
    if (typeof document === 'undefined') return;

    if (pathname !== '/' || isScrollable) {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      document.body.style.paddingRight = ''; 
    } else {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    }
    
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [isScrollable, pathname]);

  return (
    <HeroContext.Provider value={{ 
      isOn, 
      isTransitioning, 
      toggle, 
      setIsTransitioning, 
      isScrollable, 
      setIsScrollable,
      isTimelineReady,
      setIsTimelineReady,
      isMobile,
      isTablet,
      isPC,
      footerHeight,
      setFooterHeight
    }}>
      {children}
    </HeroContext.Provider>
  );
}


export function useHeroContext(): HeroContextType {
  const ctx = useContext(HeroContext);
  if (!ctx) {
    throw new Error('useHeroContext must be used within HeroProvider');
  }
  return ctx;
}
