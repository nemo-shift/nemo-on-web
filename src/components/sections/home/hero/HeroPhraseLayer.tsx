'use client';

import React, { useEffect } from 'react';
import PhraseLine from './PhraseLine';
import { COLORS } from '@/constants/colors';

type HeroPhraseLayerProps = {
  isOn: boolean;
  visible?: boolean;
  isMobile?: boolean;
  sequenceStep?: number;
  onCopyVisible?: () => void;
  onActiveShapeChange?: (shape: 'all' | 'circle' | 'triangle' | 'square') => void;
  isInteractionActive?: boolean; // 추가: 인터랙션 메시지 표시 여부
};

/**
 * HeroPhraseLayer — 프레이즈 3줄 (도형 포함)
 * 줄1: ○ 감성위에 / 줄2: 구조 △를 더해 / 줄3: 당신의 □로
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
  
  // sequenceStep에 따라 각 줄의 가시성 결정
  const lineVisible = [
    sequenceStep >= 1,
    sequenceStep >= 2,
    sequenceStep >= 3,
  ];

  // 메시지 3줄 다 나온 뒤 콜백 실행 (4단계 진입 시)
  useEffect(() => {
    if (!isOn || sequenceStep < 4) return;
    
    const t1 = setTimeout(() => {
      onCopyVisible?.();
    }, 400);
    return () => clearTimeout(t1);
  }, [isOn, sequenceStep, onCopyVisible]);

  const circleColor = isOn ? COLORS.BRAND.TEAL : COLORS.BRAND.BROWN;
  const triColor = isOn ? COLORS.BRAND.DEEP_TEAL : COLORS.BRAND.GOLD;
  const squareColor = isOn ? COLORS.BRAND.TEAL : COLORS.TEXT.LIGHT; 
  const baseColor = isOn ? COLORS.TEXT.DIM_DARK : COLORS.TEXT.DIM_LIGHT;

  const containerStyle: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: isMobile ? 'flex-start' : 'center',
    gap: isMobile ? '.24em' : '1vh',
    fontSize: isMobile ? 'inherit' : 'clamp(0.8rem, 3.5vh, 1.8vw)',
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
        <PhraseLine isMobile={isMobile} visible={lineVisible[0]} baseColor={baseColor}>
          <span 
            onMouseEnter={() => !isMobile && sequenceStep >= 4 && onActiveShapeChange?.('circle')}
            onMouseLeave={() => !isMobile && onActiveShapeChange?.('all')}
            onTouchStart={() => isMobile && sequenceStep >= 4 && onActiveShapeChange?.('circle')}
            data-cursor={!isMobile && sequenceStep >= 4 ? 'pointer' : undefined}
            style={{ 
              color: circleColor, 
              transition: 'color .7s ease',
              pointerEvents: 'auto',
              cursor: sequenceStep >= 4 ? 'pointer' : 'default',
              padding: isMobile ? '0 4px' : '0'
            }}
          >
              감성
          </span>
          <span>위에</span>
        </PhraseLine>

        <PhraseLine isMobile={isMobile} visible={lineVisible[1]} baseColor={baseColor}>
          <span 
            onMouseEnter={() => !isMobile && sequenceStep >= 4 && onActiveShapeChange?.('triangle')}
            onMouseLeave={() => !isMobile && onActiveShapeChange?.('all')}
            onTouchStart={() => isMobile && sequenceStep >= 4 && onActiveShapeChange?.('triangle')}
            data-cursor={!isMobile && sequenceStep >= 4 ? 'pointer' : undefined}
            style={{ 
              color: triColor, 
              transition: 'color .7s ease',
              pointerEvents: 'auto',
              cursor: sequenceStep >= 4 ? 'pointer' : 'default',
              padding: isMobile ? '0 4px' : '0'
            }}
          >
              구조
          </span>
          <span>를 더해</span>
        </PhraseLine>

        <PhraseLine isMobile={isMobile} visible={lineVisible[2]} baseColor={baseColor}>
          <span>당신의</span>
          <span
            onMouseEnter={() => {
              if (!isMobile && sequenceStep >= 4) onActiveShapeChange?.('square');
            }}
            onMouseLeave={() => {
              if (!isMobile) onActiveShapeChange?.('all');
            }}
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
              pointerEvents: 'auto',
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

      {/* [v25.23] 인터랙션 시 등장하는 통합 메시지 */}
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
            fontFamily: 'var(--font-ibm-plex)',
            fontSize: isMobile ? '1.8rem' : 'clamp(1.8rem, 4vh, 2.6rem)', // [v25.60] 변주 메시지도 높이에 맞게 조절
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
