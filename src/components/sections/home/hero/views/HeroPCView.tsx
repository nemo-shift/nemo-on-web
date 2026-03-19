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
  tcRef,
  shapesStageRef,
}: HeroViewProps) {
  return (
    <>
      {/* 1. 상단 스페이서 (PC Fluid: 12vh -> 20vh) */}
      <div style={{ 
        minHeight: isOn ? '20vh' : '12vh', 
        flexShrink: 0, 
        order: 0,
        transition: 'min-height 0.7s ease',
        position: 'relative' // 앵커의 기준점
      }}>
        {/* [V4.3 Editorial] 로고 빅 타이포 앵커 - 슬로건 이동과 무관하게 상단 고정 */}
        <div 
          id="hero-logo-anchor" 
          className="invisible pointer-events-none" 
          style={{ 
            position: 'absolute',
            top: '80px',
            left: '48px',
            width: '400px', 
            height: '80px' 
          }} 
        />
      </div>

      {/* 3. 슬로건 & 토글 영역 (tcRef) */}
      <div
        ref={tcRef}
        className="w-full flex-shrink-0"
        style={{
          position: isOn ? 'absolute' : 'relative',
          bottom: isOn ? '8vh' : 'auto',
          left: 0,
          zIndex: 30,
          order: isOn ? 10 : 5,
          marginTop: isOn ? '0' : '2vh',
          marginBottom: isOn ? '0' : '6vh',
          opacity: showCenteredShapes ? 0 : 1,
          transition: 'opacity 0.5s ease, order 0.7s ease, transform 0.7s ease, bottom 0.7s ease',
          minHeight: isOn ? 'auto' : '10vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          gap: '1.5vh',
          pointerEvents: 'none'
        }}
      >
        <div 
          className="px-[48px]" 
          style={{ 
            position: 'relative',
            width: '100%',
            marginTop: isOn ? '6vh' : '0',
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
              width: '600px', 
              height: '140px', // 로고 여유 공간 포함
              pointerEvents: 'auto',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-start',
              gap: '20px'
            }}
          >
            <div style={{ position: 'relative', width: '600px', height: '100%' }}>
              <HeroSlogan
                isOn={isOn}
                isMobile={false}
                onToggle={handleToggle}
                isTransitioning={isTransitioning}
                sentence="불안을 끄고, 기준을 켭니다"
              />
            </div>
          </div>

          {/* [v26.35] 히어로 다크모드 토글이 중앙으로 이동함에 따라 이곳에서는 제거 */}
        </div>
      </div>

      {/* 4. 중앙 인터랙션 영역 (도형 & 파티클) - PC 전용 Fluid Layout */}
      <div
        style={{
          order: 3, 
          position: 'relative',
          zIndex: showCenteredShapes ? 600 : 20,
          width: '100%', 
          flexShrink: 1,
          flexGrow: 1,
          minHeight: '30vh',
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
            <div className="pointer-events-auto flex flex-col items-center gap-2">
              <HeroOffCta 
                isVisible={true} 
                isToggleHovered={isToggleHovered}
                isMobile={false}
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
          isMobile={false}
          onModeRevealed={shapesOnRevealed}
          isCentered={showCenteredShapes}
          sequenceStep={sequenceStep}
          activeShape={activeShape}
        />
      </div>

      {/* 5. 하단 여백 (PC) */}
      <div className="flex-1" style={{ order: 4, minHeight: '4vh' }} />
      <div style={{ order: 11, flexShrink: 0, minHeight: '10vh' }} />
    </>
  );
}
