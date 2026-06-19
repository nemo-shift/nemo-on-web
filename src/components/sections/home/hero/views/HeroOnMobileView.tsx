'use client';

import React, { useEffect } from 'react';
import HeroSloganOn from '../HeroSloganOn';
import HeroOnPhraseLayer from '../HeroOnPhraseLayer';
import HeroOnShapesStage from '../HeroOnShapesStage';
import { INTERACTION_Z_INDEX } from '@/constants/interaction';
import { COLORS } from '@/constants/colors';
import { cn } from '@/lib/utils';

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
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: INTERACTION_Z_INDEX.Z_CONTENT }}>
        {isOn && !isTransitioning && sequenceStep === 5 && (
          <div
            id="hero-on-center-phrase"
            className="absolute pointer-events-auto"
            style={{
              zIndex: INTERACTION_Z_INDEX.Z_CONTENT,
              top: 'auto',
              bottom: '16vh',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: '8px'
            }}
          >
            <HeroSloganOn isSmall />
            <div
              className={cn(
                'font-bold tracking-tight leading-[1.1] select-none pointer-events-none',
                'text-[1.5rem] tablet-p:text-[2.5rem] tablet:text-[3.0rem] desktop-wide:text-[3.6rem] desktop-cap:text-[4.0rem]'
              )}
              style={{ fontFamily: 'var(--font-suit), sans-serif', color: COLORS.TEXT.DARK, whiteSpace: 'nowrap' }}
            >
              <span className="block">사업의 기준을 설계하고,</span>
              <span className="block">브랜드와 웹으로 구현합니다</span>
            </div>
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
