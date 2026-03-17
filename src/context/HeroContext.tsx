'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useDeviceDetection } from '@/hooks/useDeviceDetection';

type HeroContextType = {
  isOn: boolean;
  isTransitioning: boolean;
  toggle: () => void;
  setIsTransitioning: (val: boolean) => void;
  isScrollable: boolean;
  setIsScrollable: (val: boolean) => void;
  isMobile: boolean;
  isTablet: boolean;
  isPC: boolean;
};

const HeroContext = createContext<HeroContextType>({
  isOn: false,
  isTransitioning: false,
  toggle: () => {},
  setIsTransitioning: () => {},
  isScrollable: false,
  setIsScrollable: () => {},
  isMobile: false,
  isTablet: false,
  isPC: false,
});

export function HeroProvider({ children }: { children: React.ReactNode }): React.ReactElement {
  const { isMobile, isTablet, isPC } = useDeviceDetection();
  const [isOn, setIsOn] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isScrollable, setIsScrollable] = useState(false);
  
  // 유저가 직접 수동으로 조작했는지 여부 (한 번이라도 조작하면 자동화 영구 정지)
  const [isManualInteracted, setIsManualInteracted] = useState(false);
  const autoOnTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  // 전역 토글 핸들러
  const toggle = useCallback(() => {
    // 유저가 직접 조작했음을 기록
    setIsManualInteracted(true);
    
    // 자동 타이머 즉시 폐기
    if (autoOnTimerRef.current) {
      clearTimeout(autoOnTimerRef.current);
      autoOnTimerRef.current = null;
    }

    setIsOn((prev) => {
      const next = !prev;
      // 수동 조작 시에도 초기에는 스크롤을 막고, 시퀀스 완료 후 수동 해제함
      setIsScrollable(false);
      return next;
    });
  }, []);

  // [v26.34] 지능형 자동 ON 엔진 비활성화 (사용자 요청: 개발 및 테스트 편의성)
  /*
  useEffect(() => {
    if (isOn || isTransitioning || isManualInteracted) {
      if (autoOnTimerRef.current) clearTimeout(autoOnTimerRef.current);
      return;
    }

    const resetTimer = () => {
      if (autoOnTimerRef.current) clearTimeout(autoOnTimerRef.current);
      autoOnTimerRef.current = setTimeout(() => {
        setIsTransitioning(true);
      }, 7000); 
    };

    resetTimer();

    const handleActivity = () => {
      resetTimer();
    };

    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('scroll', handleActivity);
    window.addEventListener('keydown', handleActivity);

    return () => {
      if (autoOnTimerRef.current) clearTimeout(autoOnTimerRef.current);
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('scroll', handleActivity);
      window.removeEventListener('keydown', handleActivity);
    };
  }, [isOn, isTransitioning, isManualInteracted, setIsTransitioning]);
  */

  // [v26.34] 전역 스크롤 잠금 로직 (Hero ON 인트로 완료 전까지 잠금)
  useEffect(() => {
    if (typeof document === 'undefined') return;

    if (isScrollable) {
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
  }, [isScrollable]);

  return (
    <HeroContext.Provider value={{ 
      isOn, 
      isTransitioning, 
      toggle, 
      setIsTransitioning, 
      isScrollable, 
      setIsScrollable,
      isMobile,
      isTablet,
      isPC
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
