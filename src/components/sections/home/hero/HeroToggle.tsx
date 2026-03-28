'use client';

import React from 'react';
import { COLORS } from '@/constants/colors';

type HeroToggleProps = {
  isOn: boolean;       // 현재 ON/OFF 상태
  onToggle: () => void; // 토글 클릭 핸들러 [Required]
  isTransitioning?: boolean; // 전환 진행 중 여부 (Knob 선반영용)
  isMobile?: boolean; // 모바일 여부
};

/**
 * HeroToggle 컴포넌트
 *
 * OFF / ON 토글 pill + knob.
 */
export default function HeroToggle({
  isOn,
  onToggle,
  isTransitioning = false,
  isMobile = false,
}: HeroToggleProps): React.ReactElement {
  // 실제 ON이거나 전환 중일 때 ON의 시각적 상태를 보여줌
  const showAsOn = isOn || isTransitioning;

  return (
    <>
      <style>{`
        @keyframes togglePulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(196,168,130,0); border-color: rgba(196,168,130,.3); }
          50%      { box-shadow: 0 0 0 6px rgba(196,168,130,0.1); border-color: rgba(196,168,130,.65); }
        }
      `}</style>

      <div
        onClick={isTransitioning ? undefined : onToggle}
        data-cursor="pointer"
        className="flex items-center gap-3 mt-5 select-none"
        style={{
          cursor: isTransitioning ? 'default' : 'pointer',
          width: 'fit-content',
          pointerEvents: isTransitioning ? 'none' : 'auto',
        }}
      >
        {/* OFF 레이블 */}
        <span
          className="uppercase tracking-[0.3em] transition-colors duration-500"
          style={{
            fontSize: isMobile ? '9px' : '12px',
            color: !showAsOn
              ? COLORS.HERO.OFF.ACCENT
              : (isOn ? '#4b5563' : '#9ca3af'),
          }}
        >
          OFF
        </span>

        {/* Pill */}
        <div
          className="relative rounded-full border-[1.5px] transition-all duration-500"
          style={{
            width: isMobile ? '50px' : '68px',
            height: isMobile ? '26px' : '34px',
            borderColor: showAsOn
              ? isOn ? COLORS.HERO.ON.ACCENT : COLORS.HERO.OFF.ACCENT
              : '#4b5563',
            background: showAsOn 
              ? isOn ? COLORS.HERO.ON.ACCENT : 'rgba(196,168,130,0.15)' 
              : 'transparent',
            animation: showAsOn ? 'none' : 'togglePulse 2.2s ease infinite',
          }}
        >
          {/* Knob */}
          <div
            className="absolute rounded-full transition-all duration-500"
            style={{
              left: isMobile ? '4px' : '6px',
              top: isMobile ? '4px' : '6px',
              width: isMobile ? '16px' : '20px',
              height: isMobile ? '16px' : '20px',
              background: showAsOn 
                ? isOn ? COLORS.BG.CREAM : COLORS.HERO.OFF.ACCENT 
                : '#4b5563',
              transform: showAsOn 
                ? `translateX(${isMobile ? '24px' : '34px'})` 
                : 'translateX(0)',
              boxShadow: isOn 
                ? `0 0 12px ${COLORS.HERO.ON.ACCENT}80` // 0.5 opacity for Teal
                : (isTransitioning && !isOn) ? `0 0 12px ${COLORS.HERO.OFF.ACCENT}cc` : 'none',
            }}
          />
        </div>

        {/* ON 레이블 */}
        <span
          className="uppercase tracking-[0.3em] transition-colors duration-500"
          style={{
            fontSize: isMobile ? '9px' : '12px',
            color: showAsOn
              ? isOn ? COLORS.TEXT.DARK : COLORS.HERO.OFF.ACCENT 
              : COLORS.TEXT.LIGHT,
          }}
        >
          ON
        </span>
      </div>
    </>
  );
}
