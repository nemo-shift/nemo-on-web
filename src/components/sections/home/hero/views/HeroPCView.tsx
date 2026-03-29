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

  // [V11.1 Fluid Entry] - 중앙 집중형 스택의 시네마틱 시차 등장
  useGSAP(() => {
    if (isOn) return;

    const tl = gsap.timeline({ delay: 0.5 });
    
    // 1. 배경 아우라 먼저 슬며시 등장
    tl.to("#hero-central-aura", {
      opacity: 1,
      duration: 1.5,
      ease: "sine.inOut"
    }, 0);

    // 2. 중앙 액션 그룹 -> 하단 메시지 레이어 순차 등장
    tl.fromTo([
      "#hero-central-action-group",
      "#hero-bottom-message-layer"
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
    }, 0.3);

  }, { dependencies: [isOn] });

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
            top: '2vw', // 헤더 아이콘(2.5vw)과 수평을 맞추기 위한 상향 조정
            left: '3.333vw', // HEADER_POS.PC.x 동기화
            width: '20vw', 
            height: '10vw' 
          }} 
        />
      </div>

      {/* 4. 중앙 인터랙션 영역 (도형 & 파티클 & 중앙 집중형 스택) */}
      <div
        style={{
          order: 3, 
          position: 'relative',
          zIndex: showCenteredShapes ? 600 : 20,
          width: '100%', 
          flexShrink: 1,
          flexGrow: 1,
          minHeight: '60vh', // 중앙 스택을 위한 높이 확보
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          pointerEvents: 'none',
          transition: 'flex-grow 0.7s ease, min-height 0.7s ease'
        }}
      >
        {/* [V11 Central Spine Engine] - PC 전용 수직 레이아웃 */}
        <div 
          className="absolute inset-0 flex flex-col items-center justify-center z-50 pointer-events-none"
        >
          {/* [V11.1 Luminous Aura] - 중앙 스택을 감싸는 신비로운 광배 */}
          {!isOn && (
            <div 
              id="hero-central-aura"
              className="absolute pointer-events-none opacity-0"
              style={{
                width: '100vw',
                height: '80vh',
                background: `radial-gradient(circle at center, rgba(240, 235, 227, 0.04) 0%, rgba(240, 235, 227, 0.01) 40%, transparent 75%)`,
                transform: 'translateY(15vh)',
                filter: 'blur(60px)',
                zIndex: -1
              }}
            />
          )}

          {/* [V11.4 3-Tier Layering] - 3단계 독립 레이어링 개편 */}
          {!isOn && (
            <>
              {/* 1. 중앙 액션 그룹 (로테이팅 프레이즈 + 토글) - 화면 정중앙 50% 정박 */}
              <div 
                id="hero-central-action-group"
                className="absolute flex flex-col items-center gap-[4vh] pointer-events-auto opacity-0"
                style={{ 
                  top: '45%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  marginTop: '0vh' 
                }}
                onMouseEnter={() => setIsToggleHovered(true)}
                onMouseLeave={() => setIsToggleHovered(false)}
              >
                {/* [다크모드 로테이팅 프레이즈] */}
                <HeroSloganOff
                  isMobile={false}
                />
                
                {/* [토글 버튼] */}
                <div className="relative z-20">
                  <HeroToggle
                    isOn={isOn}
                    onToggle={handleToggle}
                    isTransitioning={isTransitioning}
                    isMobile={false}
                  />
                </div>
              </div>

              {/* 2. 하단 베이스라인 레이어 (영어 슬로건) - 화면 하단 12vh 정박 */}
              <div 
                id="hero-bottom-message-layer"
                className="absolute flex flex-col items-center pointer-events-auto opacity-0"
                style={{ 
                  bottom: '-20vh', 
                  left: '50%', 
                  transform: 'translateX(-50%)'
                }}
                onMouseEnter={() => setIsToggleHovered(true)}
                onMouseLeave={() => setIsToggleHovered(false)}
              >
                <HeroOffCta 
                  isVisible={!isOn} 
                  isToggleHovered={isToggleHovered}
                  isMobile={false}
                  isTransitioning={isTransitioning}
                  onToggle={handleToggle}
                />
              </div>
            </>
          )}

          {/* [온모드 전용] - 오직 트루 포커스 프레이즈만 정중앙 노출 */}
          {isOn && (
            <div 
              id="hero-on-center-phrase"
              className="absolute pointer-events-auto"
              style={{ 
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)'
              }}
            >
              <HeroSloganOn
                isMobile={false}
                sentence="불안을 끄고, 기준을 켭니다"
              />
            </div>
          )}
        </div>

        {/* 배경 인터랙션 레이어 (프레이즈, 도형) */}
        {/* [V11.21 JIT] 오프모드에서는 DOM에서 완전 제거, 전환 시작 또는 온모드에서만 마운트 */}
        {(isOn || isTransitioning) && (
          <HeroPhraseLayer
            isOn={isOn}
            visible={!showCenteredShapes}
            isMobile={false}
            sequenceStep={sequenceStep}
            onActiveShapeChange={handleActiveShapeChange}
            onCopyVisible={() => setShapesOnRevealed(true)}
            isInteractionActive={isInteractionActive}
          />
        )}
        {/* [V11.21 JIT] 오프모드에서는 DOM에서 완전 제거, 온모드에서만 마운트 */}
        {(isOn || isTransitioning) && (
          <ShapesStage
            ref={shapesStageRef}
            isOn={isOn} 
            isMobile={false}
            onModeRevealed={shapesOnRevealed}
            isCentered={showCenteredShapes}
            sequenceStep={sequenceStep}
            activeShape={activeShape}
          />
        )}
      </div>

      {/* 5. 하단 여백 (PC) */}
      <div className="flex-1" style={{ order: 4, minHeight: '4vh' }} />
      <div style={{ order: 11, flexShrink: 0, minHeight: '10vh' }} />
    </>
  );
}
