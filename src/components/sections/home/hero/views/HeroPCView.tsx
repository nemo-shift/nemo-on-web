'use client';

import React from 'react';
import HeroOffPCView from './HeroOffPCView';
import HeroOnPCView from './HeroOnPCView';

type HeroViewProps = {
  isOn: boolean;
  isTransitioning: boolean;
  sequenceStep: number;
  shapesOnRevealed: boolean;
  setShapesOnRevealed: (val: boolean) => void;
  showCenteredShapes: boolean;
  isToggleHovered: boolean;
  setIsToggleHovered: (val: boolean) => void;
  activeShape: 'all' | 'circle' | 'triangle' | 'square';
  isInteractionActive: boolean;
  handleToggle: () => void;
  handleActiveShapeChange: (shape: 'all' | 'circle' | 'triangle' | 'square') => void;
  tcRef: React.RefObject<HTMLDivElement | null>;
  shapesStageRef: React.RefObject<HTMLDivElement | null>;
};

/**
 * [V11.31] HeroPCView (View Controller)
 * 히어로 섹션의 공통 레이아웃 뼈대 및 모드간 전환을 관제하는 최상위 뷰.
 * 모든 구체적인 UI는 HeroOffPCView와 HeroOnPCView로 물리적 격리함.
 */
export default function HeroPCView({
  isOn,
  isTransitioning,
  sequenceStep,
  shapesOnRevealed,
  setShapesOnRevealed,
  showCenteredShapes,
  isToggleHovered,
  setIsToggleHovered,
  activeShape,
  isInteractionActive,
  handleToggle,
  handleActiveShapeChange,
  shapesStageRef,
}: HeroViewProps) {

  return (
    <>
      {/* 1. 상단 스페이서 (공통 뼈대: 12vh -> 20vh) */}
      <div style={{ 
        minHeight: isOn ? '20vh' : '12vh', 
        flexShrink: 0, 
        order: 0,
        transition: 'min-height 0.7s ease',
        position: 'relative'
      }}>
        {/* [V4.3 Editorial] 로고 빅 타이포 앵커 - 상단 고정 위치 보존 */}
        <div 
          id="hero-logo-anchor" 
          className="invisible pointer-events-none" 
          style={{ 
            position: 'absolute',
            top: '2vw', 
            left: '3.333vw', 
            width: '20vw', 
            height: '10vw' 
          }} 
        />
      </div>

      {/* 2. 중앙 인터랙션 박스 (물리적 격리 관제 영역) */}
      <div
        style={{
          order: 3, 
          position: 'relative',
          zIndex: showCenteredShapes ? 600 : 20,
          width: '100%', 
          flexShrink: 1,
          flexGrow: 1,
          minHeight: '60vh', 
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          pointerEvents: 'none',
          transition: 'flex-grow 0.7s ease, min-height 0.7s ease'
        }}
      >
        {/* [V11.31 Isolation] OFF 모드 UI 레이어 */}
        {!isOn && (
          <HeroOffPCView
            isOn={isOn}
            isTransitioning={isTransitioning}
            isToggleHovered={isToggleHovered}
            setIsToggleHovered={setIsToggleHovered}
            handleToggle={handleToggle}
          />
        )}

        {/* [V11.31 Isolation] ON 모드 인터랙션 레이어 (전환 중 또는 온모드일 때 마운트) */}
        {(isOn || isTransitioning) && (
          <HeroOnPCView
            isOn={isOn}
            isTransitioning={isTransitioning}
            sequenceStep={sequenceStep}
            shapesOnRevealed={shapesOnRevealed}
            setShapesOnRevealed={setShapesOnRevealed}
            showCenteredShapes={showCenteredShapes}
            activeShape={activeShape}
            isInteractionActive={isInteractionActive}
            handleActiveShapeChange={handleActiveShapeChange}
            shapesStageRef={shapesStageRef}
          />
        )}
      </div>

      {/* 3. 하단 여백 (공통 뼈대) */}
      <div className="flex-1" style={{ order: 4, minHeight: '4vh' }} />
      <div style={{ order: 11, flexShrink: 0, minHeight: '10vh' }} />
    </>
  );
}
