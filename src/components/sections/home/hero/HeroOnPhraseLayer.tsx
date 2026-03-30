'use client';

import React, { useEffect } from 'react';
import { COLORS } from '@/constants/colors';
import { useDevice } from '@/context/DeviceContext';
import { cn } from '@/lib/utils';

type HeroPhraseLayerProps = {
  isOn: boolean;
  visible?: boolean;
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
  isOn = false
}: { 
  visible: boolean; 
  baseColor: string; 
  children: React.ReactNode; 
  isOn?: boolean;
}) => (
  <div
    className={cn(
      "font-[family-name:var(--font-suit)] leading-none -tracking-[0.01em] transition-all duration-1000 ease-out whitespace-nowrap flex items-center gap-[0.1em]",
      "text-[44px] tablet:text-[32px] desktop-wide:text-[48px]",
      visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-7"
    )}
    style={{
      color: baseColor,
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
export default function HeroOnPhraseLayer({
  isOn,
  visible = true,
  sequenceStep = 0,
  onCopyVisible,
  onActiveShapeChange,
  isInteractionActive = false,
}: HeroPhraseLayerProps): React.ReactElement {
  const { isMobileView, interactionMode } = useDevice();
  const isTouch = interactionMode === 'touch';
  
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

  return (
    <div 
      className={cn(
        "absolute inset-0 flex flex-col justify-center z-20 pointer-events-none transition-opacity duration-400",
        isMobileView ? "items-start gap-[0.24em] translate-x-[8%] -translate-y-[5%]" : "items-center gap-[min(1vw,1.5vh)] -translate-x-[8%] translate-y-[5vh]",
        isOn && visible ? "visible opacity-100" : "hidden opacity-0"
      )}
    >
      <div 
        className={cn(
          "relative z-[2] flex flex-col transition-all duration-400 ease-out gap-[0.24em]",
          isMobileView ? "items-start" : "items-center",
          isInteractionActive ? "translate-y-[10px] invisible opacity-0" : "translate-y-0 visible opacity-100"
        )}
      >
        <PhraseLine isOn={isOn} visible={lineVisible[0]} baseColor={baseColor}>
          <span 
            onMouseEnter={() => !isTouch && sequenceStep >= 4 && onActiveShapeChange?.('circle')}
            onMouseLeave={() => !isTouch && onActiveShapeChange?.('all')}
            onTouchStart={() => isTouch && sequenceStep >= 4 && onActiveShapeChange?.('circle')}
            data-cursor={!isTouch && sequenceStep >= 4 ? 'pointer' : undefined}
            className="transition-colors duration-700"
            style={{ 
              color: circleColor, 
              pointerEvents: isOn ? 'auto' : 'none',
              cursor: sequenceStep >= 4 ? 'pointer' : 'default',
              padding: isMobileView ? '0 4px' : '0'
            }}
          >
              감성
          </span>
          <span>위에</span>
        </PhraseLine>

        <PhraseLine isOn={isOn} visible={lineVisible[1]} baseColor={baseColor}>
          <span 
            onMouseEnter={() => !isTouch && sequenceStep >= 4 && onActiveShapeChange?.('triangle')}
            onMouseLeave={() => !isTouch && onActiveShapeChange?.('all')}
            onTouchStart={() => isTouch && sequenceStep >= 4 && onActiveShapeChange?.('triangle')}
            data-cursor={!isTouch && sequenceStep >= 4 ? 'pointer' : undefined}
            className="transition-colors duration-700"
            style={{ 
              color: triColor, 
              pointerEvents: isOn ? 'auto' : 'none',
              cursor: sequenceStep >= 4 ? 'pointer' : 'default',
              padding: isMobileView ? '0 4px' : '0'
            }}
          >
              구조
          </span>
          <span>를 더해</span>
        </PhraseLine>

        <PhraseLine isOn={isOn} visible={lineVisible[2]} baseColor={baseColor}>
          <span>당신의</span>
          <span
            id="hero-nemo-origin"
            onMouseEnter={() => !isTouch && sequenceStep >= 4 && onActiveShapeChange?.('square')}
            onMouseLeave={() => !isTouch && onActiveShapeChange?.('all')}
            onTouchStart={() => isTouch && sequenceStep >= 4 && onActiveShapeChange?.('square')}
            data-cursor={!isTouch && sequenceStep >= 4 ? 'pointer' : undefined}
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
              margin: isMobileView ? '0 4px' : '0'
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
        className={cn(
          "absolute top-1/2 w-full transition-all duration-600 ease-out pointer-events-none",
          isMobileView ? "left-0 text-left" : "left-1/2 -translate-x-1/2 text-center",
          isInteractionActive ? "-translate-y-1/2 opacity-100 visible" : "translate-y-0 opacity-0 invisible"
        )}
      >
        <span
          className={cn(
            "font-[family-name:var(--font-suit)] font-medium text-[#1a1a1a] whitespace-nowrap -tracking-[0.02em] block",
            isMobileView ? "text-[1.8rem]" : "text-[clamp(1.8rem,4vh,2.6rem)]"
          )}
        >
            브랜드의 결을 켭니다
        </span>
      </div>
    </div>
  );
}
