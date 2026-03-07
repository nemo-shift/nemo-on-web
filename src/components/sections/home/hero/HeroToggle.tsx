'use client';

import React from 'react';
import { COLORS } from '@/constants/colors';

type HeroToggleProps = {
  isOn: boolean;       // 현재 ON/OFF 상태 [Required]
  onToggle: () => void; // 토글 클릭 핸들러 [Required]
  isTransitioning?: boolean; // 전환 진행 중 여부 (Knob 선반영용)
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
          className="text-[9px] uppercase tracking-[0.3em] transition-colors duration-500"
          style={{
            color: !showAsOn
              ? COLORS.BRAND.GOLD
              : (isOn ? COLORS.TEXT.DIM_DARK : COLORS.TEXT.DIM_LIGHT),
          }}
        >
          OFF
        </span>

        {/* Pill */}
        <div
          className="relative w-[50px] h-[26px] rounded-[13px] border-[1.5px] transition-all duration-500"
          style={{
            borderColor: showAsOn
              ? isOn ? COLORS.BRAND.TEAL : COLORS.BRAND.GOLD
              : COLORS.EFFECTS.TRI_DIM,
            background: showAsOn 
              ? isOn ? COLORS.BRAND.TEAL : 'rgba(196,168,130,0.15)' 
              : 'transparent',
            animation: showAsOn ? 'none' : 'togglePulse 2.2s ease infinite',
          }}
        >
          {/* Knob */}
          <div
            className="absolute left-1 top-1 w-4 h-4 rounded-full transition-all duration-500"
            style={{
              background: showAsOn 
                ? isOn ? COLORS.BG.CREAM : COLORS.BRAND.GOLD 
                : COLORS.EFFECTS.NEMO_HOVER_DIM,
              transform: showAsOn ? 'translateX(24px)' : 'translateX(0)',
              boxShadow: isOn 
                ? `0 0 12px ${COLORS.BRAND.TEAL}80` // 0.5 opacity for Teal
                : (isTransitioning && !isOn) ? `0 0 12px ${COLORS.BRAND.GOLD}cc` : 'none',
            }}
          />
        </div>

        {/* ON 레이블 */}
        <span
          className="text-[9px] uppercase tracking-[0.3em] transition-colors duration-500"
          style={{
            color: showAsOn
              ? isOn ? COLORS.TEXT.DARK : COLORS.BRAND.GOLD 
              : COLORS.TEXT.DIM_LIGHT,
          }}
        >
          ON
        </span>
      </div>
    </>
  );
}
