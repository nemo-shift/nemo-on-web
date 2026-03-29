'use client';

import React from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import HeroSloganOff from '../HeroSloganOff';
import HeroSloganOn from '../HeroSloganOn';
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

  // [V11.6 Mobile Entry] - 모바일 시네마틱 입차 애니메이션
  useGSAP(() => {
    if (isOn) return;

    const tl = gsap.timeline({ delay: 0.3 });
    
    tl.fromTo([
      "#hero-mobile-central-action-group",
      "#hero-mobile-bottom-message-layer"
    ], 
    { 
      opacity: 0, 
      y: -10 
    },
    {
      opacity: 1,
      y: 0,
      duration: 1.0,
      stagger: 0.2,
      ease: "power2.out"
    }, 0.2);

  }, { dependencies: [isOn] });

  return (
    <>
      {/* 1. 상단 스페이서 (Mobile: 로고 앵커 보존) */}
      <div style={{ 
        minHeight: isOn ? '16vh' : '10vh', 
        flexShrink: 0, 
        order: 0,
        transition: 'min-height 0.7s ease',
        position: 'relative'
      }}>
        {/* [V4.3 Editorial] 모바일 로고 빅 타이포 앵커 - 기존 위치 고수 */}
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

      {/* 2. 중앙 인터랙션 영역 (독립 레이어 구조) */}
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
        {/* [V11.21 JIT] 오프모드에서는 DOM에서 완전 제거, 전환 시작 또는 온모드에서만 마운트 */}
        {(isOn || isTransitioning) && (
          <HeroPhraseLayer
            isOn={isOn}
            visible={!showCenteredShapes}
            isMobile={true}
            sequenceStep={sequenceStep}
            onActiveShapeChange={handleActiveShapeChange}
            onCopyVisible={() => setShapesOnRevealed(true)}
            isInteractionActive={isInteractionActive}
          />
        )}

        {/* [V11.6 3-Tier Layering] - 모바일 독립 레이아웃 */}
        {!isOn && (
          <>
            {/* 1. 중앙 액션 그룹 (로테이팅 프레이즈 + 토글) - 화면 정중앙 50% 정박 */}
            <div 
              id="hero-mobile-central-action-group"
              className="absolute flex flex-col items-center gap-[0.5vh] pointer-events-auto opacity-0"
              style={{ 
                top: '48%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '100%',
                padding: '0 20px',
                zIndex: 100
              }}
              onMouseEnter={() => setIsToggleHovered(true)}
              onMouseLeave={() => setIsToggleHovered(false)}
            >
              <HeroSloganOff
                isMobile={true}
              />
              
              <div
                className="relative z-50"
                style={{ marginTop: '0vh' }}
              >
                <HeroToggle
                  isOn={isOn}
                  onToggle={handleToggle}
                  isTransitioning={isTransitioning}
                  isMobile={true}
                />
              </div>
            </div>

            {/* 2. 하단 메시지 레이어 (영어 슬로건) - 화면 하단 8vh 정박 */}
            <div 
              id="hero-mobile-bottom-message-layer"
              className="absolute flex flex-col items-center pointer-events-auto opacity-0"
              style={{ 
                bottom: '-25vh', 
                left: '50%', 
                transform: 'translateX(-50%)',
                width: '100%'
              }}
            >
              <HeroOffCta 
                isVisible={true} 
                isToggleHovered={isToggleHovered}
                isMobile={true}
                isTransitioning={isTransitioning}
                onToggle={handleToggle}
              />
            </div>
          </>
        )}

        {/* [온모드 전용] - 오직 트루 포커스 프레이즈만 정중앙 노출 */}
        {isOn && (
          <div 
            id="hero-mobile-on-center-phrase"
            className="absolute pointer-events-auto"
            style={{ 
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '100%',
              padding: '0 20px'
            }}
          >
            <HeroSloganOn
              isMobile={true}
              sentence="불안을 끄고, 기준을 켭니다"
            />
          </div>
        )}

        {/* [V11.21 JIT] 오프모드에서는 DOM에서 완전 제거, 온모드에서만 마운트 */}
        {(isOn || isTransitioning) && (
          <ShapesStage
            ref={shapesStageRef}
            isOn={isOn} 
            isMobile={true}
            onModeRevealed={shapesOnRevealed}
            isCentered={showCenteredShapes}
            sequenceStep={sequenceStep}
            activeShape={activeShape}
          />
        )}
      </div>

      <div className="flex-1" style={{ order: 4, minHeight: '10px' }} />
      <div style={{ order: 5, flexShrink: 0, minHeight: '40px', height: '40px' }} />
    </>
  );
}
