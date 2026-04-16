'use client';

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { useHeroContext, useDevice } from '@/context';
import { useHeroState, useParticles } from '@/hooks';
import { runWipeTransition } from '@/lib';
import type { HeroSectionProps } from '@/types';
import Header from '@/components/layout/Header';
import { INTERACTION_Z_INDEX } from '@/constants/interaction';
import HeroBottomBar from './HeroBottomBar';
import HeroPCView from './views/HeroPCView';
import HeroTabletView from './views/HeroTabletView';
import HeroMobileView from './views/HeroMobileView';

import { COLORS } from '@/constants/colors';
import { cn } from '@/lib/utils';

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
  id,
  isOn,
  onToggle,
}: HeroSectionProps): React.ReactElement {
  const [mounted, setMounted] = useState(false);
  const { isTransitioning, setIsTransitioning, isScrollable, setIsScrollable } = useHeroContext();
  const { isMobile, isMobileView, isTabletPortrait, isInitialized } = useDevice();
  const isFirstMount = useRef(true);

  useEffect(() => {
    requestAnimationFrame(() => setMounted(true));
  }, []);

  const {
    sequenceStep,
    isGathering,
    shapesOnRevealed,
    setShapesOnRevealed,
    showCenteredShapes,
    isToggleHovered,
    setIsToggleHovered,
    activeShape,
    isInteractionActive,
    handleToggle,
    finalizeTransition,
    handleActiveShapeChange,
    resetHeroState,
    setSequenceStep
  } = useHeroState(isOn, onToggle, isTransitioning, setIsTransitioning);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tcRef = useRef<HTMLDivElement | null>(null);
  const shapesStageRef = useRef<HTMLDivElement | null>(null);
  const wipeRef = useRef<HTMLDivElement>(null);

  // [V11.17 Global Touch Management - Intelligent Hold]
  const touchTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  const handleGlobalTouchStart = useCallback(() => {
    if (isOn || isTransitioning) return;
    if (touchTimerRef.current) clearTimeout(touchTimerRef.current);
    setIsToggleHovered(true);
  }, [isOn, isTransitioning, setIsToggleHovered]);

  const handleGlobalTouchEnd = useCallback(() => {
    if (isOn || isTransitioning) return;
    
    // 떼는 순간부터 0.8초 뒤에 꺼짐 (여운 효과)
    if (touchTimerRef.current) clearTimeout(touchTimerRef.current);
    touchTimerRef.current = setTimeout(() => {
      setIsToggleHovered(false);
    }, 800);
  }, [isOn, isTransitioning, setIsToggleHovered]);

  useParticles(canvasRef, isOn, isGathering);

  // 초기화 및 리셋 (isOn 변경 시)
  useEffect(() => {
    requestAnimationFrame(resetHeroState);
  }, [isOn, resetHeroState]);

  // 스크램블 완료 핸들러 (와이프 효과 시작)
  const handleScrambleComplete = useCallback(() => {
    // [V11.16 교훈] 여기서 명시적으로 넘기는 색상이 wipeTransition의 기본값(red 등)보다 우선함. 
    // 색상 수정 시 반드시 이곳의 wipeColor를 함께 확인해야 함.
    const wipeColor = '#0891b2';
    finalizeTransition((callback: () => void) => runWipeTransition(wipeRef.current, callback, wipeColor));
  }, [finalizeTransition]);

  // [v25.80] 시퀀스 완독 후 스크롤 해제 보정 (수직적 통합)
  useEffect(() => {
    if (isOn && sequenceStep === 5) {
      // 슬로건 애니메이션 시간을 고려하여 약간의 여유(0.5초)를 두고 해제
      const timer = setTimeout(() => setIsScrollable(true), 1200);
      return () => clearTimeout(timer);
    }
  }, [isOn, sequenceStep, setIsScrollable]);

  // [V5.4 Fix] 진짜 '복귀(Return)'인 경우(마운트 시점에 이미 ON)만 5단계 점프 적용
  useEffect(() => {
    if (isFirstMount.current && isOn) {
      setSequenceStep(5);
    }
    // 마운트 직후 바로 플래그를 꺼서, 이후 발생하는 모든 토글(OFF->ON)은 정상 순차 로직을 타게 함
    isFirstMount.current = false;
  }, []); // 의존성 배열을 비워 마운트 시 1회만 판정

  // [전문가 제안] 전환(isTransitioning) 상태 감시 및 자동 시퀀스 실행
  useEffect(() => {
    if (isTransitioning && !isOn) {
      // 0.8초 정도 스크램블이 도는 시간을 벌어준 뒤 배경 와이프 실행
      const timer = setTimeout(() => {
        handleScrambleComplete();
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [isTransitioning, isOn, handleScrambleComplete]);

  // CSS 변수 주입 (ON/OFF에 따른 색상 토큰)
  const cssVars = useMemo(() => ({
    '--bg': isOn ? COLORS.HERO.ON.BG : COLORS.HERO.OFF.BG,
    '--fg': isOn ? COLORS.HERO.ON.TEXT : COLORS.HERO.OFF.TEXT,
    '--accent': isOn ? COLORS.HERO.ON.ACCENT : COLORS.HERO.OFF.ACCENT,
    '--sub': isOn ? COLORS.HERO.ON.SUB_ACCENT : COLORS.HERO.OFF.SUB_ACCENT,
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
          background: !isMobileView ? COLORS.HERO.OFF.ACCENT : '#0891b2',
          zIndex: INTERACTION_Z_INDEX.Z_SYSTEM_WIPE, 
          pointerEvents: 'none',
          borderRadius: 0,
        }}
      />
    ) : null, [mounted, isMobileView]);


  // 공통 Props 묶음
  const viewProps = {
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
    shapesStageRef
  };

  return (
    <div 
      className="relative flex flex-col w-full min-h-screen overflow-hidden transition-colors duration-1000"
      style={cssVars}
    >
      
      {mounted && typeof document !== 'undefined' && createPortal(
        <>
          {wipeOverlay}
          <Header />
          <div style={cssVars}>
            {/* HeroBottomBar는 Portal에 유지하되, 내부 스타일링은 각 뷰에서 처리 */}
            <HeroBottomBar isOn={isOn} />
          </div>
        </>,
        document.body
      )}

      <section
        id={id}
        className="hero-content-layer"
        onTouchStart={handleGlobalTouchStart}
        onTouchEnd={handleGlobalTouchEnd}
        style={{
          ...cssVars,
          position: 'relative',
          zIndex: INTERACTION_Z_INDEX.Z_CONTENT,
          width: '100vw',
          height: '100svh',
          display: 'flex',
          flexDirection: 'column',
          // padding은 각 뷰에서 처리
          background: isOn ? 'transparent' : 'var(--bg)', // ON일 때 SharedNemo 노출
          color: 'var(--fg)',
          transition: 'background 0.7s ease, color 0.7s ease',
          overflow: 'hidden',
        }}
      >
        {/* [V11.21] 파티클 캔버스: 오프모드에서만 렌더링, 온모드 진입 시 DOM에서 완전 제거하여 GPU 부하 해소 */}
        {!isOn && (
          <canvas
            ref={canvasRef}
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: INTERACTION_Z_INDEX.Z_BASE_BG,
              pointerEvents: 'none',
            }}
          />
        )}

        {/* [v26.98 UI Detail] 램프 이펙트 (다중 레이어 시네마틱 보정) */}
        {!isOn && (
          <div
            style={{
              position: 'absolute',
              top: isMobileView ? '-10%' : '-15%',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '100vw',
              height: isMobileView ? '60vh' : '90vh',
              zIndex: INTERACTION_Z_INDEX.Z_BASE_BG + 1,
              pointerEvents: 'none',
              filter: 'blur(60px)',
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            {/* Core Glow: 중심부의 따뜻한 빛 */}
            <div
              className={isMobile ? 'animate-lamp-pulse-mobile' : ''}
              style={{
                width: isMobile ? '70%' : '50%',
                height: '100%',
                background: 'radial-gradient(circle at center, rgba(240, 235, 227, 0.12) 0%, rgba(240, 235, 227, 0.04) 45%, transparent 75%)',
                opacity: isMobile ? 1 : 0.9, // PC는 정적인 상태에서 최적의 농도로 고정
              }}
            />
            {/* Ambient Glow: 배경 전체로 은은하게 퍼지는 빛 */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'radial-gradient(circle at center, rgba(240, 235, 227, 0.03) 0%, transparent 80%)',
                opacity: 0.5,
              }}
            />
          </div>
        )}

        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: INTERACTION_Z_INDEX.Z_SHARED_NEMO + 1,
            pointerEvents: 'none',
            opacity: isOn ? 0.02 : 0.06, 
            backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")',
            backgroundSize: '200px',
            transition: 'opacity 1s ease',
          }}
        />

        {/* [v26.98 UI Detail] 초기화 보호 가드: 기기 판정(isInitialized)이 완료된 후에만 정확한 뷰를 노출하여 새로고침 시 위치 튐 방지 */}
        {/* [V11.51] 뷰 컨테이너 래퍼: 뷰 영역을 화면 전체(100svh)로 강제 확장하여 슬로건이 부모 flex에 쪼그라들지 않도록 함 */}
        {!isInitialized ? (
          <div className="flex-1 w-full bg-[var(--bg)]" />
        ) : (
          <div className="absolute inset-0 pointer-events-none" style={{ zIndex: INTERACTION_Z_INDEX.Z_CONTENT }}>
            {isMobile ? (
              <HeroMobileView {...viewProps} />
            ) : isTabletPortrait ? (
              <HeroTabletView {...viewProps} />
            ) : (
              <HeroPCView {...viewProps} />
            )}
          </div>
        )}

        
      </section>
    </div>
  );
}
