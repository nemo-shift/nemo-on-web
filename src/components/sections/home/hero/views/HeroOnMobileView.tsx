'use client';

import React, { useEffect } from 'react';
import HeroSloganOn from '../HeroSloganOn';
import HeroOnPhraseLayer from '../HeroOnPhraseLayer';
import HeroOnShapesStage from '../HeroOnShapesStage';
import { INTERACTION_Z_INDEX } from '@/constants/interaction';

type HeroOnMobileViewProps = {
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
 * [V11.31] HeroOnMobileView
 * 모바일 전용 온모드 인터랙션 레이어
 */
export default function HeroOnMobileView({
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
}: HeroOnMobileViewProps) {

  return (
    <>
      {/* [V11.41 Separation] 레이어 1: 슬로건 독립 레이어 (중앙 박스 flex 간섭 완전 차단) */}
      <div className="absolute inset-0 pointer-events-none z-[100]">
        {isOn && !isTransitioning && sequenceStep === 5 && (
          <div 
            id="hero-on-center-phrase"
            className="absolute pointer-events-auto"
            style={{ 
              zIndex: INTERACTION_Z_INDEX.Z_CONTENT,
              top: 'auto',
              bottom: '16vh', // [V11.51 Fix] 도화지 확장을 통해 이제 음수값 없이 깨끗한 양수값으로 하단 배치
              left: '50%',
              transform: 'translateX(-50%)',
              width: '100%',
              padding: '0 24px'
            }}
          >
            <HeroSloganOn />
          </div>
        )}
      </div>

      {/* [V11.41 Separation] 레이어 2: 중앙 컨텐츠 레이어 (프레이즈, 도형) */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        {/* [V11.51 Fix] 프레이즈 단독 상향 및 미세 우측 이동 (-4vh, +5px) */}
        <div id="hero-on-center-stage" style={{ transform: 'translate(40px, 1vh)', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
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
