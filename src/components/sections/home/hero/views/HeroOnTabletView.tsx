'use client';

import React from 'react';
import HeroSloganOn from '../HeroSloganOn';
import HeroOnPhraseLayer from '../HeroOnPhraseLayer';
import HeroOnShapesStage from '../HeroOnShapesStage';

type HeroOnTabletViewProps = {
  isOn: boolean;
  isTransitioning: boolean;
  sequenceStep: number;
  shapesOnRevealed: boolean;
  setShapesOnRevealed: (val: boolean) => void;
  showCenteredShapes: boolean;
  activeShape: 'all' | 'circle' | 'triangle' | 'square';
  isInteractionActive: boolean;
  handleActiveShapeChange: (shape: 'all' | 'circle' | 'triangle' | 'square') => void;
  shapesStageRef: React.RefObject<HTMLDivElement | null>;
};

/**
 * [V11.31] HeroOnTabletView
 * 태블릿 전용 온모드 인터랙션 레이어
 */
export default function HeroOnTabletView({
  isOn,
  isTransitioning,
  sequenceStep,
  shapesOnRevealed,
  setShapesOnRevealed,
  showCenteredShapes,
  activeShape,
  isInteractionActive,
  handleActiveShapeChange,
  shapesStageRef,
}: HeroOnTabletViewProps) {

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
      {/* 1. 온모드 전용 슬로건 */}
      {isOn && (
        <div 
          id="hero-tablet-on-center-phrase"
          className="absolute z-50 pointer-events-auto"
          style={{ 
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '100%',
            padding: '0 40px'
          }}
        >
          <HeroSloganOn
            sentence="불안을 끄고, 기준을 켭니다"
          />
        </div>
      )}

      {/* 2. 배경 인터랙션 레이어 (프레이즈, 도형) */}
      <HeroOnPhraseLayer
        isOn={isOn}
        visible={!showCenteredShapes}
        sequenceStep={sequenceStep}
        onActiveShapeChange={handleActiveShapeChange}
        onCopyVisible={() => setShapesOnRevealed(true)}
        isInteractionActive={isInteractionActive}
      />

      <HeroOnShapesStage
        ref={shapesStageRef}
        isOn={isOn} 
        onModeRevealed={shapesOnRevealed}
        isCentered={showCenteredShapes}
        sequenceStep={sequenceStep}
        activeShape={activeShape}
      />
    </div>
  );
}
