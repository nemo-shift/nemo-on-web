'use client';

import React from 'react';
import HeroOffTabletView from './HeroOffTabletView';
import HeroOnTabletView from './HeroOnTabletView';
import { INTERACTION_Z_INDEX } from '@/constants/interaction';

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

      {/* [V11.51] 중앙 인터랙션 박스: 다크모드 전용 정렬 레이어 (기존 위치 고수) */}
      {!isOn && (
        <div
          style={{
            order: 3, 
            position: 'relative',
            zIndex: INTERACTION_Z_INDEX.Z_CONTENT,
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
          <HeroOffTabletView
            isOn={isOn}
            isTransitioning={isTransitioning}
            isToggleHovered={isToggleHovered}
            setIsToggleHovered={setIsToggleHovered}
            handleToggle={handleToggle}
          />
        </div>
      )}

      {/* [V11.51] 온모드 독립 레이어 (중앙 박스 감옥 밖으로 해방) */}
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

      <div className="flex-1" style={{ order: 4, minHeight: '3vh' }} />
      <div style={{ order: 11, flexShrink: 0, minHeight: '5vh' }} />
    </>
  );
}
