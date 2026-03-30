'use client';

import { useState, useCallback, useRef } from 'react';
import { useHeroSequence } from './useHeroSequence';
import { useDevice } from '@/context/DeviceContext';
import { HERO_TIMING } from '@/constants/hero';

/**
 * HeroSection의 복잡한 상태를 통합 관리하는 훅
 */
export function useHeroState(
  isOn: boolean, 
  onToggle: () => void, 
  isTransitioning: boolean, 
  setIsTransitioning: (val: boolean) => void
) {
  // 디바이스 감지 상태 가져오기
  const { 
    isMobile, 
    isMidRange, 
    isPC, 
    isTouchDevice, 
    isMobileView, 
    isTabletPortrait, 
    interactionMode,
    isInitialized 
  } = useDevice();
  
  // 기본 애니메이션 시퀀스 관리
  const { sequenceStep, setSequenceStep } = useHeroSequence(isOn);

  // 전환 관련 상태
  const [isGathering, setIsGathering] = useState(false);
  
  // UI 요소 노출 관련 상태
  const [shapesOnRevealed, setShapesOnRevealed] = useState(false);
  const [showCenteredShapes, setShowCenteredShapes] = useState(false);
  const [isToggleHovered, setIsToggleHovered] = useState(false);
  
  // 인터랙션 관련 상태
  const [activeShape, setActiveShape] = useState<'all' | 'circle' | 'triangle' | 'square'>('all');
  const [isInteractionActive, setIsInteractionActive] = useState(false);
  
  const activeShapeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 토글 핸들러 (Business Logic)
  const handleToggle = useCallback(() => {
    if (!isOn) {
      setIsTransitioning(true);
    } else {
      onToggle();
    }
  }, [isOn, onToggle, setIsTransitioning]);

  // 스크램블 완료 시 동작
  const finalizeTransition = useCallback((runWipe: (callback: () => void) => void) => {
    setIsGathering(true);
    setTimeout(() => {
      runWipe(onToggle);
    }, HERO_TIMING.WIPE_TRANSITION_DELAY);
  }, [onToggle]);


  // 도형 강조 상태 변경
  const handleActiveShapeChange = useCallback((shape: 'all' | 'circle' | 'triangle' | 'square') => {
    setActiveShape(shape);
    // [v26.23] 터치 기기일 경우 일정 시간 후 리셋 (너비와 무관하게 동작 기반으로 판정)
    if ((isTouchDevice || interactionMode === 'touch') && shape !== 'all') {
      if (activeShapeTimerRef.current) clearTimeout(activeShapeTimerRef.current);
      activeShapeTimerRef.current = setTimeout(() => {
        setActiveShape('all');
      }, HERO_TIMING.MOBILE_INTERACTION_RESET);
    }
  }, [isTouchDevice, interactionMode]);

  // 초기화 및 리셋 (isOn 변경 시)
  const resetHeroState = useCallback(() => {
    setShapesOnRevealed(false);
    if (isOn) {
      setIsGathering(false);
      setShowCenteredShapes(false);
      setIsTransitioning(false);
    } else {
      setActiveShape('all');
    }
  }, [isOn, setIsTransitioning]);

  return {
    isMobile,
    isMidRange,
    isPC,
    isMobileView,
    isTabletPortrait,
    isTouchDevice,
    interactionMode,
    isInitialized,
    sequenceStep,
    setSequenceStep,
    isGathering,
    setIsGathering,
    isTransitioning,
    setIsTransitioning,
    shapesOnRevealed,
    setShapesOnRevealed,
    showCenteredShapes,
    setShowCenteredShapes,
    isToggleHovered,
    setIsToggleHovered,
    activeShape,
    isInteractionActive,
    handleToggle,
    finalizeTransition,
    handleActiveShapeChange,
    resetHeroState
  };
}
