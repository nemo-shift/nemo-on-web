'use client';

import { useState, useCallback, useRef } from 'react';
import { useHeroSequence } from './useHeroSequence';
import { useDeviceDetection } from './useDeviceDetection';
import { HERO_TIMING } from '@/constants/hero';

/**
 * HeroSection의 복잡한 상태를 통합 관리하는 훅
 */
export function useHeroState(isOn: boolean, onToggle: () => void) {
  const { isMobile } = useDeviceDetection();
  
  // 기본 애니메이션 시퀀스 관리
  const { sequenceStep, setSequenceStep } = useHeroSequence(isOn);

  // 전환 관련 상태
  const [isGathering, setIsGathering] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isTitleDown, setIsTitleDown] = useState(false);
  
  // UI 요소 노출 관련 상태
  const [shapesOnRevealed, setShapesOnRevealed] = useState(false);
  const [showCenteredShapes, setShowCenteredShapes] = useState(false);
  const [isToggleHovered, setIsToggleHovered] = useState(false);
  
  // 인터랙션 관련 상태
  const [activeShape, setActiveShape] = useState<'all' | 'circle' | 'triangle' | 'square'>('all');
  const [isInteractionActive, setIsInteractionActive] = useState(false);
  
  const interactionTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const activeShapeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 토글 핸들러 (Business Logic)
  const handleToggle = useCallback(() => {
    if (!isOn) {
      setIsTransitioning(true);
      setIsTitleDown(true);
    } else {
      onToggle();
    }
  }, [isOn, onToggle]);

  // 스크램블 완료 시 동작
  const finalizeTransition = useCallback((runWipe: (callback: () => void) => void) => {
    setIsGathering(true);
    setTimeout(() => {
      setIsTitleDown(false);
      runWipe(onToggle);
    }, HERO_TIMING.WIPE_TRANSITION_DELAY);
  }, [onToggle]);

  // 타이틀(BigTypo) 상호작용
  const handleTitleInteraction = useCallback((active: boolean) => {
    if (!isOn || sequenceStep < 4) return;
    
    if (isMobile) {
      if (active) {
        setIsInteractionActive(true);
        if (interactionTimerRef.current) clearTimeout(interactionTimerRef.current);
        interactionTimerRef.current = setTimeout(() => {
          setIsInteractionActive(false);
        }, HERO_TIMING.MOBILE_INTERACTION_RESET);
      }
    } else {
      setIsInteractionActive(active);
    }
  }, [isOn, sequenceStep, isMobile]);

  // 도형 강조 상태 변경
  const handleActiveShapeChange = useCallback((shape: 'all' | 'circle' | 'triangle' | 'square') => {
    setActiveShape(shape);
    if (isMobile && shape !== 'all') {
      if (activeShapeTimerRef.current) clearTimeout(activeShapeTimerRef.current);
      activeShapeTimerRef.current = setTimeout(() => {
        setActiveShape('all');
      }, HERO_TIMING.MOBILE_INTERACTION_RESET);
    }
  }, [isMobile]);

  // 초기화 및 리셋 (isOn 변경 시)
  const resetHeroState = useCallback(() => {
    setShapesOnRevealed(false);
    if (isOn) {
      setIsGathering(false);
      setShowCenteredShapes(false);
      setIsTransitioning(false);
      setIsTitleDown(false);
    } else {
      setActiveShape('all');
    }
  }, [isOn]);

  return {
    isMobile,
    sequenceStep,
    setSequenceStep,
    isGathering,
    setIsGathering,
    isTransitioning,
    setIsTransitioning,
    isTitleDown,
    setIsTitleDown,
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
    handleTitleInteraction,
    handleActiveShapeChange,
    resetHeroState
  };
}
