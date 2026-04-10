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
    <>
      {/* [V11.41 Separation] 레이어 1: 슬로건 독립 레이어 (중앙 박스 flex 간섭 완전 차단) */}
      <div className="absolute inset-0 pointer-events-none z-[100]">
        {isOn && sequenceStep === 5 && (
          <div 
            id="hero-on-center-phrase"
            className="absolute z-50 pointer-events-auto"
            style={{ 
              top: 'auto',
              bottom: '13vh',
              left: '50%',
              transform: 'translateX(-50%)'
            }}
          >
            <HeroSloganOn />
          </div>
        )}
      </div>

      {/* [V11.41 Separation] 레이어 2: 중앙 컨텐츠 레이어 (프레이즈, 도형) */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        {/* [V11.51 Fix] 프레이즈 단독 상향 및 미세 우측 이동 조절 핸들 (기본값) */}
        <div id="hero-on-center-stage" style={{ transform: 'translate(0px, 0vh)', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <HeroOnPhraseLayer
            isOn={isOn}
            visible={!showCenteredShapes}
            sequenceStep={sequenceStep}
            onActiveShapeChange={handleActiveShapeChange}
            onCopyVisible={() => setShapesOnRevealed(true)}
            isInteractionActive={isInteractionActive}
          />
        </div>

        <HeroOnShapesStage
          ref={shapesStageRef}
          isOn={isOn} 
          onModeRevealed={shapesOnRevealed}
          isCentered={showCenteredShapes}
          sequenceStep={sequenceStep}
          activeShape={activeShape}
        />
      </div>
    </>
  );
}
