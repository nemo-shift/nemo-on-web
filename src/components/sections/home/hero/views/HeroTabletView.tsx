'use client';

import React from 'react';
import HeroSlogan from '../HeroSlogan';
import HeroToggle from '../HeroToggle';
import ShapesStage from '../ShapesStage';
import HeroPhraseLayer from '../HeroPhraseLayer';
import HeroOffCta from '../HeroOffCta';

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
  tcRef,
  shapesStageRef,
}: HeroViewProps) {
  // 태블릿은 PC 레이아웃을 기반으로 하되, 여백과 크기를 조정함
  return (
    <>
      <div style={{ 
        minHeight: isOn ? '15vh' : '10vh', 
        flexShrink: 0, 
        order: 0,
        transition: 'min-height 0.7s ease'
      }} />

      <div
        ref={tcRef}
        className="w-full flex-shrink-0"
        style={{
          position: isOn ? 'absolute' : 'relative',
          bottom: isOn ? '10vh' : 'auto',
          left: 0,
          zIndex: 30,
          order: isOn ? 10 : 5,
          marginTop: isOn ? '0' : '2vh',
          marginBottom: isOn ? '0' : '4vh',
          opacity: showCenteredShapes ? 0 : 1,
          transition: 'opacity 0.5s ease, order 0.7s ease, transform 0.7s ease, bottom 0.7s ease',
          minHeight: isOn ? 'auto' : '8vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          gap: '1.5vh',
          pointerEvents: 'none'
        }}
      >
        <div 
          className="px-[40px]" 
          style={{ 
            position: 'relative',
            width: '100%',
            marginTop: isOn ? '4vh' : '0',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            alignItems: 'flex-start',
            pointerEvents: 'none',
            zIndex: 100,
            flexShrink: 0
          }}
        >
          <div 
            className="relative flex-shrink-0" 
            style={{ 
              width: '100%', 
              maxWidth: '550px',
              height: '110px',
              pointerEvents: 'auto',
              display: 'flex',
              justifyContent: 'flex-start'
            }}
          >
            <div style={{ position: 'relative', width: '100%', height: '100%' }}>
              <HeroSlogan
                isOn={isOn}
                isMobile={false} // 태블릿은 텍스트 줄바꿈 등 PC형 유지
                onToggle={handleToggle}
                isTransitioning={isTransitioning}
                sentence="불안을 끄고, 기준을 켭니다"
              />
            </div>
          </div>

          {!isOn && (
            <div 
              className="flex-shrink-0" 
              style={{ 
                position: 'relative',
                marginTop: '-10px',
                zIndex: 50,
                pointerEvents: 'auto',
              }}
              onMouseEnter={() => setIsToggleHovered(true)}
              onMouseLeave={() => setIsToggleHovered(false)}
            >
              <HeroToggle
                isOn={isOn}
                onToggle={handleToggle}
                isTransitioning={isTransitioning}
              />
            </div>
          )}
        </div>
      </div>

      <div
        style={{
          order: 3, 
          position: 'relative',
          zIndex: showCenteredShapes ? 600 : 20,
          width: '100%', 
          flexShrink: 1,
          flexGrow: 1,
          minHeight: '25vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          pointerEvents: 'none',
          transition: 'flex-grow 0.7s ease, min-height 0.7s ease'
        }}
      >
        <HeroPhraseLayer
          isOn={isOn}
          visible={!showCenteredShapes}
          isMobile={false}
          sequenceStep={sequenceStep}
          onActiveShapeChange={handleActiveShapeChange}
          onCopyVisible={() => setShapesOnRevealed(true)}
          isInteractionActive={isInteractionActive}
        />
        {!isOn && (
          <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none">
            <div className="pointer-events-auto">
              <HeroOffCta 
                isVisible={true} 
                isToggleHovered={isToggleHovered}
                isMobile={false}
                isTransitioning={isTransitioning}
                onToggle={handleToggle}
              />
            </div>
          </div>
        )}
        <ShapesStage
          ref={shapesStageRef}
          isOn={isOn} 
          isMobile={false}
          onModeRevealed={shapesOnRevealed}
          isCentered={showCenteredShapes}
          sequenceStep={sequenceStep}
          activeShape={activeShape}
        />
      </div>

      <div className="flex-1" style={{ order: 4, minHeight: '3vh' }} />
      <div style={{ order: 11, flexShrink: 0, minHeight: '5vh' }} />
    </>
  );
}
