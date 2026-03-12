'use client';

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { useHeroState, useParticles } from '@/hooks';
import { PointRingCursor } from '@/components/ui';
import { runWipeTransition } from '@/lib';
import type { HeroSectionProps } from '@/types';
import Header from '@/components/layout/Header';
import HeroTrueFocusSlogan from './hero/HeroTrueFocusSlogan';
import HeroOffSlogan from './hero/HeroOffSlogan';
import HeroToggle from './hero/HeroToggle';
import ShapesStage from './hero/ShapesStage';
import HeroPhraseLayer from './hero/HeroPhraseLayer';
import HeroOffCta from './hero/HeroOffCta';
import HeroBigTypo from './hero/HeroBigTypo';
import HeroBottomBar from './hero/HeroBottomBar';
import { COLORS } from '@/constants/colors';

/**
 * HeroSection 컴포넌트
 *
 * 홈페이지 메인 히어로 영역.
 * - OFF 상태: 어두운 배경 #0a0a0a, 크림 텍스트 #f0ebe3
 * - ON 상태: 밝은 크림 배경 #faf7f2, 다크 텍스트 #0d1a1f
 * - 와이프 전환 효과 (틸 원 확장 후 배경 전환)
 * - 파티클 캔버스 배경 (useParticles)
 * - PointRingCursor 커스텀 커서
 *
 * @param {boolean} isOn - 현재 ON/OFF 상태
 * @param {() => void} onToggle - 토글 애니메이션 포함 핸들러
 *
 * Example usage:
 * <HeroSection isOn={isOn} onToggle={handleToggle} />
 */
export default function HeroSection({
  isOn,
  onToggle,
}: HeroSectionProps): React.ReactElement {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    requestAnimationFrame(() => setMounted(true));
  }, []);

  const {
    isMobile,
    sequenceStep,
    isGathering,
    isTransitioning,
    isTitleDown,
    shapesOnRevealed,
    setShapesOnRevealed,
    showCenteredShapes,
    isToggleHovered,
    setIsToggleHovered,
    activeShape,
    isInteractionActive,
    handleToggle,
    finalizeTransition,
    handleTitleInteraction,
    handleActiveShapeChange,
    resetHeroState
  } = useHeroState(isOn, onToggle);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tcRef = useRef<HTMLDivElement>(null);
  const shapesStageRef = useRef<HTMLDivElement>(null);
  const wipeRef = useRef<HTMLDivElement>(null);

  useParticles(canvasRef, isOn, isGathering);

  // 초기화 및 리셋 (isOn 변경 시)
  useEffect(() => {
    requestAnimationFrame(resetHeroState);
  }, [isOn, resetHeroState]);

  // 스크램블 완료 핸들러
  const handleScrambleComplete = useCallback(() => {
    finalizeTransition((callback: () => void) => runWipeTransition(wipeRef.current, callback));
  }, [finalizeTransition]);

  // CSS 변수 주입 (ON/OFF에 따른 색상 토큰)
  const cssVars = useMemo(() => ({
    '--bg': isOn ? COLORS.BG.CREAM : COLORS.BG.DARK,
    '--fg': isOn ? COLORS.TEXT.DARK : COLORS.TEXT.LIGHT,
    '--accent': isOn ? COLORS.BRAND.TEAL : COLORS.BRAND.GOLD,
    '--sub': isOn ? COLORS.BRAND.DEEP_TEAL : COLORS.BRAND.BROWN,
  } as React.CSSProperties), [isOn]);

  const wipeOverlay = useMemo(() => 
    mounted && typeof document !== 'undefined' ? (
      <div
        ref={wipeRef}
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 0,
          height: 0,
          opacity: 0,
          background: '#0891b2',
          zIndex: 500,
          pointerEvents: 'none',
          borderRadius: 0,
        }}
      />
    ) : null, [mounted]);

  const pointCursor = useMemo(() =>
    mounted && typeof document !== 'undefined' ? (
      <PointRingCursor isOn={isOn} />
    ) : null, [mounted, isOn]);

  return (
    <div 
      className="relative flex flex-col w-full min-h-screen overflow-hidden transition-colors duration-1000"
      style={cssVars}
    >
      {pointCursor}
      
      {mounted && typeof document !== 'undefined' && createPortal(
        <>
          {wipeOverlay}
          <Header />
          <div style={cssVars}>
            <HeroBottomBar isOn={isOn} />
          </div>
        </>,
        document.body
      )}

      <section
        style={{
          ...cssVars,
          position: 'relative',
          zIndex: 10,
          width: '100vw',
          height: '100svh',
          display: 'flex',
          flexDirection: 'column',
          padding: isMobile ? '24px 20px' : '36px 48px',
          background: 'var(--bg)',
          color: 'var(--fg)',
          transition: 'background 0.7s ease, color 0.7s ease',
          overflow: 'hidden',
        }}
      >
        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 0,
            pointerEvents: 'none',
          }}
        />

        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 5,
            pointerEvents: 'none',
            opacity: isOn ? 0.02 : 0.06, // OFF 모드에서 노이즈 질감 강화
            backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")',
            backgroundSize: '200px',
            transition: 'opacity 1s ease',
          }}
        />

        {/* [v25.70] 레이아웃 가변 영역 시작 (Editorial Frame) */}
        
        {/* 1. 상단 스페이서 (PC OFF 모드에서 넓은 여백 확보) */}
        <div style={{ 
          minHeight: (!isOn && !isMobile) ? '12vh' : '64px', 
          flexShrink: 0, 
          order: 0,
          transition: 'min-height 0.7s ease'
        }} />

        {/* 2. 빅 타이포 (NEMO ON 메인 타이틀) */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            zIndex: 40,
            flexShrink: 0,
            gap: isMobile ? '20px' : '2vh',
            marginBottom: (!isOn && isMobile) ? '8vh' : '2vh',
            transition: 'order 0.7s ease, margin 0.7s ease',
            // PC: OFF(1), ON(10) | 모바일: OFF(1), ON(10)
            order: isOn ? 10 : 1
          }}
        >
          <HeroBigTypo
            isOn={isOn}
            isMobile={isMobile}
            tcRef={tcRef}
            shapesStageRef={shapesStageRef}
            sequenceStep={sequenceStep}
            onInteraction={handleTitleInteraction}
            isTransitioning={isTransitioning}
            isTitleDown={isTitleDown}
            onScrambleComplete={handleScrambleComplete}
          />

          {/* PC 오프 모드 스크롤 힌트 (타이틀 바로 아래 배치) */}
          {!isMobile && !isOn && (
            <div 
              style={{
                position: 'relative',
                left: '50%',
                marginTop: '2vh',
                transform: 'translateX(-50%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                opacity: 0.2,
              }}
            >
              <div 
                style={{
                  width: '1px',
                  height: '30px',
                  background: 'var(--fg)',
                  animation: 'scrollLine 2s ease-in-out infinite',
                }}
              />
            </div>
          )}
        </div>

        {/* 3. 슬로건 & 토글 영역 (tcRef) */}
        <div
          ref={tcRef}
          className="relative z-30 w-full flex-shrink-0"
          style={{
            // PC: OFF(5), ON(1) | 모바일: OFF(2), ON(1)
            order: isOn ? 1 : (isMobile ? 2 : 5),
            marginTop: isMobile ? '0px' : (isOn ? '0' : '2vh'),
            marginBottom: (!isOn && !isMobile) ? '6vh' : '0', 
            opacity: showCenteredShapes ? 0 : 1, 
            transition: 'opacity 0.5s ease, order 0.7s ease, margin 0.7s ease',
            minHeight: isMobile ? '220px' : '10vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            gap: isMobile ? '24px' : '1.5vh'
          }}
        >
          <div 
            className={isMobile ? 'px-5' : 'px-[48px]'} 
            style={{ 
              position: 'relative',
              width: '100%',
              marginTop: isMobile ? '5px' : (isOn ? '6vh' : '0'), 
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
                width: isMobile ? '100%' : 'auto',
                height: '120px',
                pointerEvents: 'auto',
                display: 'flex',
                justifyContent: 'flex-start',
                transform: isMobile ? 'translateY(55px)' : 'none' 
              }}
            >
              <div style={{ position: 'relative', width: isMobile ? '100%' : '600px', height: '100%' }}>
                <div className="absolute top-0 left-0 w-full flex justify-start">
                  <HeroTrueFocusSlogan 
                    isOn={isOn && (isMobile ? sequenceStep >= 4 : sequenceStep >= 1)} 
                    sentence="불안을 끄고, 기준을 켭니다" 
                  />
                </div>
                <div className="absolute top-0 left-0 w-full flex justify-start">
                  <HeroOffSlogan 
                    isVisible={!isOn} 
                    isToggleHovered={isToggleHovered}
                    isMobile={isMobile}
                    isTransitioning={isTransitioning}
                    onToggle={handleToggle}
                  />
                </div>
              </div>
            </div>

            <div 
              className="flex-shrink-0" 
              style={{ 
                position: isMobile ? 'absolute' : 'relative',
                top: isMobile ? '115px' : 'auto',
                left: isMobile ? '20px' : 'auto',
                marginTop: isMobile ? '0px' : '-15px',
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
          </div>
        </div>

        {/* 4. 중앙 인터랙션 영역 (도형 & 파티클) */}
        <div
          style={{
            // PC/모바일 공통 OFF(3), ON(3) - 중간 영역 고수
            order: 3, 
            position: 'relative',
            zIndex: showCenteredShapes ? 600 : 20,
            width: '100%', 
            flexShrink: 1,
            flexGrow: 1, // 가용 공간 최대한 점유 (Editorial 핵심)
            minHeight: isMobile ? '280px' : '30vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            pointerEvents: 'none',
            transform: (isMobile && isOn) ? 'translateY(-35px)' : 'none',
            transition: 'flex-grow 0.7s ease, min-height 0.7s ease'
          }}
        >
          <HeroPhraseLayer
            isOn={isOn}
            visible={!showCenteredShapes}
            isMobile={isMobile}
            sequenceStep={sequenceStep}
            onActiveShapeChange={handleActiveShapeChange}
            onCopyVisible={() => setShapesOnRevealed(true)}
            isInteractionActive={isInteractionActive}
          />
          {!isOn && (
            <div 
              className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none"
              style={{
                transform: isMobile ? 'translateY(-30px)' : 'none' 
              }}
            >
              <div className="pointer-events-auto">
                <HeroOffCta 
                  isVisible={true} 
                  isToggleHovered={isToggleHovered}
                  isMobile={isMobile}
                  isTransitioning={isTransitioning}
                  onToggle={handleToggle}
                />
              </div>
            </div>
          )}
          <ShapesStage
            ref={shapesStageRef}
            isOn={isOn} 
            isMobile={isMobile}
            onModeRevealed={shapesOnRevealed}
            isCentered={showCenteredShapes}
            sequenceStep={sequenceStep}
            activeShape={activeShape}
          />
        </div>

        {/* 5. 하단 시각적 완충 및 최종 여백 */}
        <div className="flex-1" style={{ order: isOn ? 4 : 4, minHeight: isMobile ? '20px' : '4vh' }} />

        <div
          style={
            isMobile
              ? { order: isOn ? 5 : 6, flexShrink: 0, minHeight: '60px', height: '60px' }
              : { order: isOn ? 11 : 11, flexShrink: 0, minHeight: '10vh' }
          }
        />
        
        <style>{`
          @keyframes scrollLine {
            0% { transform: scaleY(0); transform-origin: top; }
            50% { transform: scaleY(1); transform-origin: top; }
            50.1% { transform: scaleY(1); transform-origin: bottom; }
            100% { transform: scaleY(0); transform-origin: bottom; }
          }
        `}</style>
      </section>
    </div>
  );
}
