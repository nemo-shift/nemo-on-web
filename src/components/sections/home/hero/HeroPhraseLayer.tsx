'use client';

import React, { useEffect } from 'react';
import { COLORS } from '@/constants/colors';

type HeroPhraseLayerProps = {
  isOn: boolean;
  visible?: boolean;
  isMobile?: boolean;
  sequenceStep?: number;
  onCopyVisible?: () => void;
  onActiveShapeChange?: (shape: 'all' | 'circle' | 'triangle' | 'square') => void;
  isInteractionActive?: boolean;
};

/**
 * PhraseLine 멤버 컴포넌트 (내부용)
 */
const PhraseLine = ({ 
  visible, 
  baseColor, 
  children, 
  isMobile = false,
  isOn = false
}: { 
  visible: boolean; 
  baseColor: string; 
  children: React.ReactNode; 
  isMobile?: boolean;
  isOn?: boolean;
}) => (
  <div
    style={{
      fontFamily: 'var(--font-suit), sans-serif',
      fontSize: isMobile ? 'clamp(44px, min(9vw, 14vh), 130px)' : 'clamp(32px, min(6.5vw, 12vh), 100px)',
      lineHeight: 1,
      letterSpacing: '-.01em',
      color: baseColor,
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(28px)',
      transition: 'opacity 1.2s ease, transform 1.2s cubic-bezier(0.16,1,0.3,1)',
      whiteSpace: 'nowrap',
      display: 'flex',
      alignItems: 'center',
      gap: '0.1em',
      pointerEvents: isOn ? 'auto' : 'none',
    }}
  >
    {children}
  </div>
);

/**
 * HeroPhraseLayer — 프레이즈 3줄 (도형 포함)
 * 
 * [V11.21 JIT] 오프모드에서는 DOM에서 완전 제거, 전환 시작 또는 온모드에서만 마운트
 * nemo-origin id로 네모 도형을 식별
 * 감성위에 구조를 더해 당신의 결로
 * 
 */
export default function HeroPhraseLayer({
  isOn,
  visible = true,
  isMobile = false,
  sequenceStep = 0,
  onCopyVisible,
  onActiveShapeChange,
  isInteractionActive = false,
}: HeroPhraseLayerProps): React.ReactElement {
  
  const lineVisible = [
    sequenceStep >= 1,
    sequenceStep >= 2,
    sequenceStep >= 3,
  ];

  useEffect(() => {
    if (!isOn || sequenceStep < 4) return;
    const t1 = setTimeout(() => {
      onCopyVisible?.();
    }, 400);
    return () => clearTimeout(t1);
  }, [isOn, sequenceStep, onCopyVisible]);

  const circleColor = isOn ? COLORS.HERO.ON.ACCENT : COLORS.HERO.OFF.SUB_ACCENT;
  const triColor = isOn ? COLORS.HERO.ON.SUB_ACCENT : COLORS.HERO.OFF.ACCENT;
  const squareColor = isOn ? COLORS.HERO.ON.ACCENT : COLORS.TEXT.LIGHT; 
  const baseColor = isOn ? '#1a1a1a' : '#9ca3af';

  const containerStyle: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: isMobile ? 'flex-start' : 'center',
    gap: isMobile ? '.24em' : 'min(1vw, 1.5vh)',
    fontSize: isMobile ? 'inherit' : 'clamp(0.8rem, min(3.5vh, 1.8vw), 1.8vw)',
    transform: isMobile ? 'translateX(8%) translateY(-5%)' : 'translateX(-8%) translateY(5vh)',
    pointerEvents: 'none',
    zIndex: 20,
    visibility: (isOn && visible) ? 'visible' : 'hidden',
    opacity: visible ? 1 : 0,
    transition: visible ? 'opacity 0.4s ease' : 'opacity 0s',
  };

  const innerWrapperStyle: React.CSSProperties = {
    position: 'relative',
    zIndex: 2,
    display: 'flex',
    flexDirection: 'column',
    alignItems: isMobile ? 'flex-start' : 'center',
    gap: '.24em',
    opacity: isInteractionActive ? 0 : 1,
    transform: isInteractionActive ? 'translateY(10px)' : 'translateY(0)',
    transition: 'all 0.4s cubic-bezier(0.16,1,0.3,1)',
    visibility: isInteractionActive ? 'hidden' : 'visible',
  };

  return (
    <div style={containerStyle}>
      <div style={innerWrapperStyle}>
        <PhraseLine isMobile={isMobile} isOn={isOn} visible={lineVisible[0]} baseColor={baseColor}>
          <span 
            onMouseEnter={() => !isMobile && sequenceStep >= 4 && onActiveShapeChange?.('circle')}
            onMouseLeave={() => !isMobile && onActiveShapeChange?.('all')}
            onTouchStart={() => isMobile && sequenceStep >= 4 && onActiveShapeChange?.('circle')}
            data-cursor={!isMobile && sequenceStep >= 4 ? 'pointer' : undefined}
            style={{ 
              color: circleColor, 
              transition: 'color .7s ease',
              pointerEvents: isOn ? 'auto' : 'none',
              cursor: sequenceStep >= 4 ? 'pointer' : 'default',
              padding: isMobile ? '0 4px' : '0'
            }}
          >
              감성
          </span>
          <span>위에</span>
        </PhraseLine>

        <PhraseLine isMobile={isMobile} isOn={isOn} visible={lineVisible[1]} baseColor={baseColor}>
          <span 
            onMouseEnter={() => !isMobile && sequenceStep >= 4 && onActiveShapeChange?.('triangle')}
            onMouseLeave={() => !isMobile && onActiveShapeChange?.('all')}
            onTouchStart={() => isMobile && sequenceStep >= 4 && onActiveShapeChange?.('triangle')}
            data-cursor={!isMobile && sequenceStep >= 4 ? 'pointer' : undefined}
            style={{ 
              color: triColor, 
              transition: 'color .7s ease',
              pointerEvents: isOn ? 'auto' : 'none',
              cursor: sequenceStep >= 4 ? 'pointer' : 'default',
              padding: isMobile ? '0 4px' : '0'
            }}
          >
              구조
          </span>
          <span>를 더해</span>
        </PhraseLine>

        <PhraseLine isMobile={isMobile} isOn={isOn} visible={lineVisible[2]} baseColor={baseColor}>
          <span>당신의</span>
          <span
            id="hero-nemo-origin"
            onMouseEnter={() => !isMobile && sequenceStep >= 4 && onActiveShapeChange?.('square')}
            onMouseLeave={() => !isMobile && onActiveShapeChange?.('all')}
            onTouchStart={() => isMobile && sequenceStep >= 4 && onActiveShapeChange?.('square')}
            data-cursor={!isMobile && sequenceStep >= 4 ? 'pointer' : undefined}
            style={{
              display: 'inline-flex',
              width: '1.2em',
              height: '1.2em',
              border: '0.04em solid',
              borderRadius: '0.05em',
              borderColor: isOn ? '#0D1A1F' : squareColor,
              background: isOn ? '#0D1A1F' : 'transparent',
              color: isOn ? '#FFFFFF' : squareColor,
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              position: 'relative',
              overflow: 'hidden',
              transition: 'background 0.3s ease, color 0.3s ease',
              cursor: sequenceStep >= 4 ? 'pointer' : 'default',
              pointerEvents: isOn ? 'auto' : 'none',
              margin: isMobile ? '0 4px' : '0'
            }}
          >
            <span
              style={{ 
                fontFamily: 'Noto Serif KR, serif', 
                fontSize: '0.65em',
                fontWeight: 'bold',
                color: 'inherit',
                transition: 'color 0.3s ease',
                lineHeight: 1,
                marginTop: '-0.05em'
              }}
            >
                결
            </span>
          </span>
          <span>로</span>
        </PhraseLine>
      </div>

      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: isMobile ? '0' : '50%',
          transform: isMobile 
            ? `translateY(${isInteractionActive ? '-50%' : '0'})` 
            : `translate(-50%, ${isInteractionActive ? '-50%' : '0'})`,
          opacity: isInteractionActive ? 1 : 0,
          visibility: isInteractionActive ? 'visible' : 'hidden',
          transition: 'all 0.6s cubic-bezier(0.16,1,0.3,1)',
          width: '100%',
          textAlign: isMobile ? 'left' : 'center',
          pointerEvents: 'none',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-suit)',
            fontSize: isMobile ? '1.8rem' : 'clamp(1.8rem, 4vh, 2.6rem)',
            fontWeight: 500,
            color: '#1a1a1a',
            whiteSpace: 'nowrap',
            letterSpacing: '-0.02em',
            display: 'block',
          }}
        >
            브랜드의 결을 켭니다
        </span>
      </div>
    </div>
  );
}
