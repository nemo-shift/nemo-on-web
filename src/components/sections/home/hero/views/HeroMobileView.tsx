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

export default function HeroMobileView({
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
  return (
    <>
      {/* 1. 상단 스페이서 (Mobile: 고정 위치 확보용) */}
      <div style={{ 
        minHeight: isOn ? '16vh' : '10vh', 
        flexShrink: 0, 
        order: 0,
        transition: 'min-height 0.7s ease',
        position: 'relative'
      }}>
        {/* [V4.3 Editorial] 모바일 로고 빅 타이포 앵커 - 슬로건 이동과 상관없이 상단 고정 */}
        <div 
          id="hero-logo-anchor" 
          className="invisible pointer-events-none" 
          style={{ 
            position: 'absolute',
            top: '40px',
            left: '20px',
            width: '280px', 
            height: '60px' 
          }} 
        />
      </div>

      {/* 2. 슬로건 영역 (tcRef) */}
      <div
        ref={tcRef}
        className="w-full flex-shrink-0 px-5"
        style={{
          position: isOn ? 'absolute' : 'relative',
          bottom: isOn ? '60px' : 'auto',
          left: 0,
          zIndex: 30,
          order: isOn ? 10 : 2,
          opacity: showCenteredShapes ? 0 : 1,
          transition: 'opacity 0.5s ease',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          gap: '24px',
          pointerEvents: 'none'
        }}
      >
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
          <HeroSlogan
            isOn={isOn}
            isMobile={true}
            onToggle={handleToggle}
            isTransitioning={isTransitioning}
            sentence="불안을 끄고, 기준을 켭니다"
          />
        </div>
      </div>

      {/* 3. 중앙 인터랙션 영역 */}
      <div
        style={{
          order: 3, 
          position: 'relative',
          zIndex: showCenteredShapes ? 600 : 20,
          width: '100%', 
          flexShrink: 1,
          flexGrow: 1,
          minHeight: '320px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          pointerEvents: 'none',
          transform: isOn ? 'translateY(-20px)' : 'none',
          transition: 'flex-grow 0.7s ease, min-height 0.7s ease'
        }}
      >
        <HeroPhraseLayer
          isOn={isOn}
          visible={!showCenteredShapes}
          isMobile={true}
          sequenceStep={sequenceStep}
          onActiveShapeChange={handleActiveShapeChange}
          onCopyVisible={() => setShapesOnRevealed(true)}
          isInteractionActive={isInteractionActive}
        />
        {!isOn && (
          <div 
            className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none"
            style={{ transform: 'translateY(-30px)' }}
          >
            <div className="pointer-events-auto flex flex-col items-center gap-2">
              <HeroOffCta 
                isVisible={true} 
                isToggleHovered={isToggleHovered}
                isMobile={true}
                isTransitioning={isTransitioning}
                onToggle={handleToggle}
              />
              <div
                onMouseEnter={() => setIsToggleHovered(true)}
                onMouseLeave={() => setIsToggleHovered(false)}
              >
                <HeroToggle
                  isOn={isOn}
                  onToggle={handleToggle}
                  isTransitioning={isTransitioning}
                />
              </div>
            </div>
          </div>
        )}
        <ShapesStage
          ref={shapesStageRef}
          isOn={isOn} 
          isMobile={true}
          onModeRevealed={shapesOnRevealed}
          isCentered={showCenteredShapes}
          sequenceStep={sequenceStep}
          activeShape={activeShape}
        />
      </div>

      <div className="flex-1" style={{ order: 4, minHeight: '20px' }} />
      <div style={{ order: 5, flexShrink: 0, minHeight: '60px', height: '60px' }} />
    </>
  );
}
