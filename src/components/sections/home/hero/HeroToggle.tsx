'use client';

import React from 'react';
import { COLORS } from '@/constants/colors';
import { cn } from '@/lib/utils';

type HeroToggleProps = {
  isOn: boolean;       // 현재 ON/OFF 상태
  onToggle: () => void; // 토글 클릭 핸들러 [Required]
  isTransitioning?: boolean; // 전환 진행 중 여부 (Knob 선반영용)
};

/**
 * HeroToggle 스위치 컴포넌트
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
          className="uppercase tracking-[0.3em] transition-colors duration-500 text-[9px] tablet-p:text-[10px] tablet:text-[11px] desktop-wide:text-[12px] desktop-cap:text-[13px]"
          style={{
            color: !showAsOn
              ? COLORS.HERO.OFF.ACCENT
              : (isOn ? '#4b5563' : '#9ca3af'),
          }}
        >
          OFF
        </span>

        {/* Pill */}
        <div
          className={cn(
            'relative rounded-full border-[1.5px] transition-all duration-500',
            'w-[50px] h-[26px] tablet-p:w-[60px] tablet-p:h-[32px] tablet:w-[65px] tablet:h-[34px] desktop-wide:w-[70px] desktop-wide:h-[36px] desktop-cap:w-[75px] desktop-cap:h-[38px]'
          )}
          style={{
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
            className={cn(
              'absolute rounded-full transition-all duration-500',
              'w-[16px] h-[16px] tablet-p:w-[18px] tablet-p:h-[18px] tablet:w-[20px] tablet:h-[20px] desktop-wide:w-[22px] desktop-wide:h-[22px] desktop-cap:w-[24px] desktop-cap:h-[24px]',
              'left-[4px] top-[5px] tablet-p:left-[6px] tablet-p:top-[7px] tablet:left-[6px] tablet:top-[7px] desktop-wide:left-[6px] desktop-wide:top-[7px] desktop-cap:left-[6px] desktop-cap:top-[7px]',
              showAsOn 
                ? 'translate-x-[26px] tablet-p:translate-x-[30px] tablet:translate-x-[33px] desktop-wide:translate-x-[36px] desktop-cap:translate-x-[39px]' 
                : 'translate-x-0'
            )}
            style={{
              background: showAsOn 
                ? isOn ? COLORS.BG.CREAM : COLORS.HERO.OFF.ACCENT 
                : '#4b5563',
              boxShadow: isOn 
                ? `0 0 12px ${COLORS.HERO.ON.ACCENT}80` // 0.5 opacity for Teal
                : (isTransitioning && !isOn) ? `0 0 12px ${COLORS.HERO.OFF.ACCENT}cc` : 'none',
            }}
          />
        </div>

        {/* ON 레이블 */}
        <span
          className="uppercase tracking-[0.3em] transition-colors duration-500 text-[9px] tablet-p:text-[10px] tablet:text-[11px] desktop-wide:text-[12px] desktop-cap:text-[13px]"
          style={{
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
