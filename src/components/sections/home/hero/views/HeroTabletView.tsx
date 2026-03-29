'use client';

import React from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
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
  
  // [V11.6 Tablet Entry] - 태블릿 시네마틱 입차 애니메이션
  useGSAP(() => {
    if (isOn) return;

    const tl = gsap.timeline({ delay: 0.4 });
    
    tl.fromTo([
      "#hero-tablet-central-action-group",
      "#hero-tablet-bottom-message-layer"
    ], 
    { 
      opacity: 0, 
      y: -15 
    },
    {
      opacity: 1,
      y: 0,
      duration: 1.2,
      stagger: 0.3,
      ease: "power3.out"
    }, 0.2);

  }, { dependencies: [isOn] });

  return (
    <>
      <div style={{ 
        minHeight: isOn ? '15vh' : '10vh', 
        flexShrink: 0, 
        order: 0,
        transition: 'min-height 0.7s ease'
      }} />

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
        <HeroPhraseLayer
          isOn={isOn}
          visible={!showCenteredShapes}
          isMobile={false}
          sequenceStep={sequenceStep}
          onActiveShapeChange={handleActiveShapeChange}
          onCopyVisible={() => setShapesOnRevealed(true)}
          isInteractionActive={isInteractionActive}
        />

        {/* [V11.6 3-Tier Layering] - 태블릿 독립 레이아웃 */}
        {!isOn && (
          <>
            {/* 1. 중앙 액션 그룹 (로테이팅 프레이즈 + 토글) - 화면 정중앙 50% 정박 */}
            <div 
              id="hero-tablet-central-action-group"
              className="absolute flex flex-col items-center gap-[4vh] pointer-events-auto opacity-0"
              style={{ 
                top: '65%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '100%',
                padding: '0 40px',
                zIndex: 100
              }}
              onMouseEnter={() => setIsToggleHovered(true)}
              onMouseLeave={() => setIsToggleHovered(false)}
            >
              <HeroSlogan
                isOn={isOn}
                isMobile={false}
                isTablet={true}
                onToggle={handleToggle}
                isTransitioning={isTransitioning}
              />
              
              <div 
                className="relative z-50"
                style={{ marginTop: '4vh' }}
              >
                <HeroToggle
                  isOn={isOn}
                  onToggle={handleToggle}
                  isTransitioning={isTransitioning}
                  isTablet={true}
                />
              </div>
            </div>

            {/* 2. 하단 베이스라인 레이어 (영어 슬로건) - 화면 하단 12vh 정박 */}
            <div 
              id="hero-tablet-bottom-message-layer"
              className="absolute flex flex-col items-center pointer-events-auto opacity-0"
              style={{ 
                bottom: '-30vh', 
                left: '50%', 
                transform: 'translateX(-50%)'
              }}
            >
              <HeroOffCta 
                isVisible={true} 
                isToggleHovered={isToggleHovered}
                isMobile={false}
                isTablet={true}
                isTransitioning={isTransitioning}
                onToggle={handleToggle}
              />
            </div>
          </>
        )}

        {/* [온모드 전용] - 오직 트루 포커스 프레이즈만 정중앙 노출 */}
        {isOn && (
          <div 
            id="hero-tablet-on-center-phrase"
            className="absolute pointer-events-auto"
            style={{ 
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '100%',
              padding: '0 40px'
            }}
          >
            <HeroSlogan
              isOn={isOn}
              isMobile={false}
              isTablet={true}
              onToggle={handleToggle}
              isTransitioning={isTransitioning}
              sentence="불안을 끄고, 기준을 켭니다"
            />
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
