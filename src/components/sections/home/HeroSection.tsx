'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useParticles } from '@/hooks';
import { PointRingCursor } from '@/components/ui';
import HeroSlogan from './hero/HeroSlogan';
import HeroToggle from './hero/HeroToggle';
import ShapesStage from './hero/ShapesStage';
import HeroPhraseLayer from './hero/HeroPhraseLayer';
import HeroBigTypo from './hero/HeroBigTypo';
import HeroBottomBar from './hero/HeroBottomBar';

type HeroSectionProps = {
  isOn: boolean;
  onToggle: () => void;
};

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
export default function HeroSection({ isOn, onToggle }: HeroSectionProps): React.ReactElement {
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // 캔버스 ref
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useParticles(canvasRef, isOn);

  // 사이징 ref (HeroBigTypo에 전달)
  const tcRef = useRef<HTMLDivElement>(null);
  const [phraseVisible, setPhraseVisible] = useState(true);
  const [shapesOffColonHidden, setShapesOffColonHidden] = useState(false);
  const [shapesOffHovered, setShapesOffHovered] = useState(false);
  const [shapesOnRevealed, setShapesOnRevealed] = useState(false);
  const shapesStageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOn) setShapesOnRevealed(false);
  }, [isOn]);

  // 모바일 OFF 모드: 도형모음 터치 후 2초 뒤 자동 숨김
  const mobileOffTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => {
    if (!isMobile || isOn || !shapesOffHovered) return;
    clearTimeout(mobileOffTimerRef.current);
    mobileOffTimerRef.current = setTimeout(() => {
      setShapesOffHovered(false);
      setShapesOffColonHidden(false);
    }, 2000);
    return () => clearTimeout(mobileOffTimerRef.current);
  }, [isMobile, isOn, shapesOffHovered]);

  // 플래시 오버레이
  const flashTextRef = useRef<HTMLDivElement>(null);
  const flashTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const flashMessage = (text: string) => {
    if (!isOn) return;
    const el = flashTextRef.current;
    if (!el) return;

    setPhraseVisible(false);
    clearTimeout(flashTimerRef.current);

    let displayText = text;
    if (isMobile && text.length >= 5) {
      displayText = text.slice(0, 3) + '\n' + text.slice(3);
    }
    el.textContent = displayText;
    el.style.whiteSpace = 'pre-line';
    el.style.animation = 'none';
    void (el as HTMLDivElement).offsetWidth;
    el.style.animation = 'flashIn 1.2s ease-out forwards';

    flashTimerRef.current = setTimeout(() => {
      setPhraseVisible(true);
    }, 1200);
  };

  // 와이프 박스 ref
  const wipeRef = useRef<HTMLDivElement>(null);

  /**
   * 와이프 전환: 틸 사각형이 중앙에서 확장 → 배경 전환 → 박스 fade out
   */
  const runWipeTransition = (onDone: () => void) => {
    const box = wipeRef.current;
    if (!box) { onDone(); return; }

    const maxSize = Math.max(window.innerWidth, window.innerHeight) * 1.6;
    box.style.cssText = `
      position:fixed; top:50%; left:50%;
      transform:translate(-50%,-50%);
      transition:none;
      width:0; height:0; opacity:1;
      background:#0891b2;
      border-radius:0;
      z-index:500;
      pointer-events:none;
    `;

    const dur1 = 480;
    const start = performance.now();

    const expand = () => {
      const t = Math.min((performance.now() - start) / dur1, 1);
      const e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      const s = e * maxSize;
      box.style.width = `${s}px`;
      box.style.height = `${s}px`;

      if (t < 1) {
        requestAnimationFrame(expand);
      } else {
        onDone();
        setTimeout(() => {
          box.style.transition = 'opacity 0.4s ease';
          box.style.opacity = '0';
          setTimeout(() => {
            box.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);width:0;height:0;opacity:0;background:#0891b2;border-radius:0;z-index:500;pointer-events:none;';
          }, 420);
        }, 140);
      }
    };

    requestAnimationFrame(expand);
  };

  // 토글 핸들러: OFF→ON 시 와이프 전환 후 상태 변경
  const handleToggle = () => {
    if (!isOn) {
      runWipeTransition(onToggle);
    } else {
      onToggle();
    }
  };

  // CSS 변수 주입 (ON/OFF에 따른 색상 토큰)
  const cssVars = {
    '--bg': isOn ? '#faf7f2' : '#0a0a0a',
    '--fg': isOn ? '#0d1a1f' : '#f0ebe3',
    '--accent': isOn ? '#0891b2' : '#e8d5b0',
    '--sub': isOn ? '#0e7490' : '#c4a882',
  } as React.CSSProperties;

  // 와이프 오버레이 — 마운트 후 body에 포탈 (하이드레이션 불일치 방지, Lenis transform 부모 영향 제거)
  const wipeOverlay = mounted && typeof document !== 'undefined' ? (
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
  ) : null;

  return (
    <div style={cssVars}>
      {/* 커스텀 커서 */}
      <PointRingCursor isOn={isOn} />

      {/* 와이프 오버레이 — document.body에 포탈 */}
      {mounted && wipeOverlay && createPortal(wipeOverlay, document.body)}

      {/* 스크롤 인디케이터 — body 포탈 (transform 부모 영향 제거) */}
      {mounted && typeof document !== 'undefined' && createPortal(
        <div style={cssVars}>
          <HeroBottomBar isOn={isOn} />
        </div>,
        document.body
      )}

      {/* 플래시 오버레이 — body 포탈 */}
      {mounted && typeof document !== 'undefined' && createPortal(
        <div
          style={{
            ...cssVars,
            position: 'fixed',
            inset: 0,
            zIndex: 300,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}
        >
          <div
            ref={flashTextRef}
            style={{
              fontFamily: 'var(--font-bebas)',
              fontSize: 'clamp(90px, 14vw, 200px)',
              color: 'var(--accent)',
              opacity: 0,
              transform: 'scale(0.7)',
              transition: 'none',
              textAlign: 'center',
            }}
          />
        </div>,
        document.body
      )}

      {/* 히어로 섹션 */}
      <section
        style={{
          ...cssVars,
          position: 'relative',
          zIndex: 10,
          width: '100vw',
          height: '100dvh',
          display: 'flex',
          flexDirection: 'column',
          padding: isMobile ? '24px 20px' : '36px 48px',
          background: 'var(--bg)',
          color: 'var(--fg)',
          transition: 'background 0.7s ease, color 0.7s ease',
          overflow: 'hidden',
        }}
      >
        {/* 배경 파티클 캔버스 */}
        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 0,
            pointerEvents: 'none',
          }}
        />

        {/* 노이즈 텍스처 */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 5,
            pointerEvents: 'none',
            opacity: 0.025,
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundSize: '200px',
          }}
        />

        {/* 1. 상단 여백 (공통 헤더 높이 유지 — 레이아웃 쏠림 방지) */}
        <div style={{ minHeight: '64px', flexShrink: 0 }} />

        {/* 2. 슬로건 + 스위치 */}
        <div ref={tcRef} style={{ position: 'relative', zIndex: 20, maxWidth: '54%', flexShrink: 0 }}>
          <HeroSlogan isOn={isOn} />
          <HeroToggle isOn={isOn} onToggle={handleToggle} />
        </div>

        {/* 3. 메시지 (프레이즈 + ShapesStage) — minHeight 확대로 화면 중앙에 가깝게 */}
        <div
          style={{
            position: 'relative',
            zIndex: 20,
            flexShrink: 0,
            minHeight: 'clamp(200px, 32vh, 380px)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <HeroPhraseLayer isOn={isOn} visible={phraseVisible} />
          <ShapesStage
            ref={shapesStageRef}
            isOn={isOn}
            isMobile={isMobile}
            offModeVisible={shapesOffHovered}
            onModeRevealed={shapesOnRevealed}
          />
        </div>

        {/* 4. 여백 — 메인타이틀을 뷰포트 하단으로 밀어냄 (메시지 아래 공간) */}
        <div style={{ flex: 1, minHeight: 0 }} />

        {/* 5. 메인타이틀 (뷰포트 하단) */}
        <div style={{ display: 'flex', flexDirection: 'column', zIndex: 20, flexShrink: 0 }}>
          <HeroBigTypo
            isOn={isOn}
            isMobile={isMobile}
            tcRef={tcRef}
            shapesStageRef={shapesStageRef}
            shapesOffColonHidden={shapesOffColonHidden}
            shapesOffHovered={shapesOffHovered}
            onFlash={flashMessage}
            onColonHideInOff={setShapesOffColonHidden}
            onTriCirHover={setShapesOffHovered}
            onExplodeComplete={() => setShapesOnRevealed(true)}
          />
        </div>
      </section>
    </div>
  );
}
