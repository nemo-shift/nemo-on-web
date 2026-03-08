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

        <div style={{ minHeight: '64px', flexShrink: 0 }} />

        <div
          ref={tcRef}
          className="relative z-30 w-full flex-shrink-0"
          style={{
            marginTop: isMobile ? '0px' : '0', 
            opacity: showCenteredShapes ? 0 : 1, 
            transition: 'opacity 0.5s ease',
            minHeight: isMobile ? '220px' : '10vh', // [v25.61] 최소 높이 더 하향
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            gap: isMobile ? '24px' : '1.5vh' // [v25.61] 간격 축소
          }}
        >
          {/* Header Area (Slogan & Toggle) - 절대 흔들리지 않는 프레임 */}
          <div 
            className={isMobile ? 'px-5' : 'px-[48px]'} 
            style={{ 
              position: 'relative',
              width: '100%',
              marginTop: isMobile ? '5px' : '6vh', 
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'column', // [v25.43] PC/모바일 모두 세로 배치이나 분리 유지
              justifyContent: isMobile ? 'flex-start' : 'flex-start',
              alignItems: isMobile ? 'flex-start' : 'flex-start',
              pointerEvents: 'none',
              zIndex: 100,
              flexShrink: 0 // 상단 영역 크기 고수
            }}
          >
            {/* 슬로건 영역 (Editorial Grid) - 고정 높이로 스위치 위치 박제 */}
            <div 
              className="relative flex-shrink-0" 
              style={{ 
                width: isMobile ? '100%' : 'auto',
                height: '120px', // [v25.32] PC도 고정 높이 적용하여 ON/OFF 시 Toggle 상하 움직임 방지
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
                position: isMobile ? 'absolute' : 'relative', // [v25.43] 모바일 절대 좌표 복구
                top: isMobile ? '115px' : 'auto',
                left: isMobile ? '20px' : 'auto',
                marginTop: isMobile ? '0px' : '-15px', // [v25.34] PC만 상향 밀착
                zIndex: 50,
                pointerEvents: 'auto',
                transform: isMobile ? 'none' : 'none' 
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

        <div
          style={{
            position: 'relative',
            zIndex: showCenteredShapes ? 600 : 20,
            width: '100%', 
            flexShrink: 1, // [v25.51] 창이 줄어들 때 함께 축소되도록 허용
            marginTop: '0px', 
            flexGrow: 1,   // [v25.51] 가용 공간 최대한 점유
            minHeight: isMobile ? '220px' : '25vh', // [v25.51] 고정 픽셀 대신 뷰포트 비례로 변경
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            pointerEvents: 'none',
            transform: (isMobile && isOn) ? 'translateY(-35px)' : 'none'
          }}
        >
          <HeroPhraseLayer
            isOn={isOn}
            visible={!showCenteredShapes}
            isMobile={isMobile}
            sequenceStep={sequenceStep}
            onActiveShapeChange={handleActiveShapeChange}
            onCopyVisible={() => setShapesOnRevealed(true)}
            isInteractionActive={isInteractionActive} // [v25.23] 변주 메시지 활성화 여부
          />
          {/* [v25.16] PC/모바일 공통 중앙 CTA 복원 (isMobile 필터 해제) */}
          {!isOn && (
            <div 
              className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none"
              style={{
                transform: isMobile ? 'translateY(-55px)' : 'none' 
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
            activeShape={activeShape} // [v25.21] 필터링용 상태 전달
          />
        </div>

        {/* [v12] 완충 공간 (Spacer Buffer): 상단 시프트를 하단 타이틀에 전달하지 않음 */}
        <div className="flex-1 min-h-[20px]" />

        <div
          style={
            isMobile
              ? { flexShrink: 0, minHeight: '40px', height: '40px' } // 하단 여백 추가하여 옹기종기 해결
              : { flex: 1, minHeight: 0 }
          }
        />

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            zIndex: 20,
            flexShrink: 0,
            gap: isMobile ? '40px' : '2vh', // [v25.51] 가변 간격
            marginBottom: isMobile ? '145px' : '4vh', // [v25.51] 고정 60px에서 가변 4vh로 변경
            transition: 'none'
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

          {/* [v25.32] PC 오프 모드용 정밀 스크롤 힌트 (전문가 제안) */}
          {!isMobile && !isOn && (
            <div 
              style={{
                position: 'absolute',
                left: '50%',
                bottom: '-35px',
                transform: 'translateX(-50%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                opacity: 0.3,
              }}
            >
              <div 
                style={{
                  width: '1px',
                  height: '20px',
                  background: 'var(--fg)',
                  animation: 'scrollLine 2s ease-in-out infinite',
                }}
              />
            </div>
          )}
        </div>
        
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
