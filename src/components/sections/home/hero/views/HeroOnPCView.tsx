'use client';

import React from 'react';
import HeroSloganOn from '../HeroSloganOn';
import HeroOnPhraseLayer from '../HeroOnPhraseLayer';
import HeroOnShapesStage from '../HeroOnShapesStage';

type HeroOnPCViewProps = {
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
 * [V11.31] HeroOnPCView
 * 온모드 전역 인터랙션 레이어 (물리적 격리 레이어)
 * 온모드(ON) 상태 또는 전환(Transition) 중에만 DOM에 유지되어 리소스 낭비를 방지함.
 */
export default function HeroOnPCView({
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
}: HeroOnPCViewProps) {

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
      {/* 1. 온모드 전용 슬로건 - 트루 포커스 프레이즈 */}
      {isOn && (
        <div 
          id="hero-on-center-phrase"
          className="absolute z-50 pointer-events-auto"
          style={{ 
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)'
          }}
        >
          <HeroSloganOn
            sentence="불안을 끄고, 기준을 켭니다"
          />
        </div>
      )}

      {/* 2. 배경 인터랙션 레이어 (프레이즈, 도형) */}
      {/* 프레이즈 레이어: 감성위에 구조를 더해 당신의 결로 */}
      <HeroOnPhraseLayer
        isOn={isOn}
        visible={!showCenteredShapes}
        sequenceStep={sequenceStep}
        onActiveShapeChange={handleActiveShapeChange}
        onCopyVisible={() => setShapesOnRevealed(true)}
        isInteractionActive={isInteractionActive}
      />

      {/* 도형 스테이지: 실제 애니메이션되는 SVG 도형들 */}
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
