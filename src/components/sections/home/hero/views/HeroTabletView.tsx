'use client';

import React from 'react';
import HeroOffTabletView from './HeroOffTabletView';
import HeroOnTabletView from './HeroOnTabletView';

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
 * [V11.31] HeroTabletView (View Controller)
 * 태블릿 섹션의 공통 레이아웃 뼈대 및 모드간 전환을 관제하는 최상위 뷰.
 */
export default function HeroTabletView({
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
      {/* 1. 상단 스페이서 (공통 뼈대) */}
      <div style={{ 
        minHeight: isOn ? '15vh' : '10vh', 
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
            width: '24vw', 
            height: '12vw' 
          }} 
        />
      </div>

      <div
        style={{
          order: 3, 
          position: 'relative',
          zIndex: showCenteredShapes ? 600 : 20,
          width: '100%', 
          flexShrink: 1,
          flexGrow: 1,
          minHeight: '40vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          pointerEvents: 'none',
          transition: 'flex-grow 0.7s ease, min-height 0.7s ease'
        }}
      >
        {/* [V11.31 Isolation] OFF 모드 UI 레이어 */}
        {!isOn && (
          <HeroOffTabletView
            isOn={isOn}
            isTransitioning={isTransitioning}
            isToggleHovered={isToggleHovered}
            setIsToggleHovered={setIsToggleHovered}
            handleToggle={handleToggle}
          />
        )}

        {/* [V11.31 Isolation] ON 모드 인터랙션 레이어 (전환 중 또는 온모드일 때 마운트) */}
        {(isOn || isTransitioning) && (
          <HeroOnTabletView
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

      <div className="flex-1" style={{ order: 4, minHeight: '3vh' }} />
      <div style={{ order: 11, flexShrink: 0, minHeight: '5vh' }} />
    </>
  );
}
