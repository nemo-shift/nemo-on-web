'use client';

import React, { createContext, useContext, useMemo } from 'react';
import { useDeviceDetection } from '@/hooks/useDeviceDetection';

/**
 * 기기 및 레이아웃 정보를 관리하는 전역 Context
 */
interface DeviceContextValue {
  isMobile: boolean;
  isMobileView: boolean;
  isTabletPortrait: boolean;
  interactionMode: 'mouse' | 'touch';
  isInitialized: boolean;
}

const DeviceContext = createContext<DeviceContextValue | null>(null);

export function DeviceProvider({ children }: { children: React.ReactNode }) {
  const { isMobile, isMobileView, isTabletPortrait, interactionMode, isInitialized } = useDeviceDetection();

  // [v26.98 Performance] 
  // 기기 정보가 실제로 변했을 때만 하위 컴포넌트들을 재렌더링하도록 메모이제이션 적용
  const value = useMemo(() => ({
    isMobile, 
    isMobileView, 
    isTabletPortrait, 
    interactionMode, 
    isInitialized
  }), [
    isMobile, 
    isMobileView, 
    isTabletPortrait, 
    interactionMode, 
    isInitialized
  ]);

  return (
    <DeviceContext.Provider value={value}>
      {children}
    </DeviceContext.Provider>
  );
}

/**
 * 전역 기기 정보 사용 훅 (useDeviceDetection을 직접 부르는 대신 이 훅을 권장)
 */
export function useDevice() {
  const context = useContext(DeviceContext);
  if (!context) {
    // 만약 Provider 밖에서 사용된다면, 안전을 위해 Hook을 직접 호출하여 Fallback 제공
    // (완전한 정화 전까지 과도기적 안정성 확보)
    throw new Error('useDevice must be used within a DeviceProvider');
  }
  return context;
}
