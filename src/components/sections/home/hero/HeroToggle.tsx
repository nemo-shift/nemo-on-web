'use client';

import React from 'react';

type HeroToggleProps = {
  isOn: boolean;       // 현재 ON/OFF 상태 [Required]
  onToggle: () => void; // 토글 클릭 핸들러 [Required]
};

/**
 * HeroToggle 컴포넌트
 *
 * OFF / ON 토글 pill + knob.
 * - OFF 상태: togglePulse 애니메이션으로 pill 테두리 맥동
 * - ON 상태: knob 이동, pill 배경 채움
 *
 * @param {boolean} isOn - 현재 상태 [Required]
 * @param {function} onToggle - 토글 핸들러 [Required]
 *
 * Example usage:
 * <HeroToggle isOn={isOn} onToggle={toggle} />
 */
export default function HeroToggle({ isOn, onToggle }: HeroToggleProps): React.ReactElement {
  return (
    <>
      {/* 토글 pulse 애니메이션 키프레임 */}
      <style>{`
        @keyframes togglePulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(196,168,130,0); border-color: rgba(196,168,130,.3); }
          50%      { box-shadow: 0 0 0 6px rgba(196,168,130,0.1); border-color: rgba(196,168,130,.65); }
        }
      `}</style>

      <div
        onClick={onToggle}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginTop: '20px',
          cursor: 'pointer',
          width: 'fit-content',
          userSelect: 'none',
        }}
      >
        {/* OFF 레이블 */}
        <span
          style={{
            fontSize: '9px',
            letterSpacing: '.3em',
            textTransform: 'uppercase',
            color: !isOn
              ? 'var(--accent)'
              : isOn
                ? 'rgba(13,26,31,.25)'
                : 'rgba(240,235,227,.2)',
            transition: 'color .5s',
          }}
        >
          OFF
        </span>

        {/* Pill — .pill 커서 호버 감지용 */}
        <div
          className="pill"
          style={{
            width: '50px',
            height: '26px',
            borderRadius: '13px',
            border: isOn
              ? `1.5px solid var(--accent)`
              : '1.5px solid rgba(196,168,130,.3)',
            position: 'relative',
            background: isOn ? 'var(--accent)' : 'transparent',
            transition: 'border-color .5s, background .5s',
            animation: isOn ? 'none' : 'togglePulse 2.2s ease infinite',
          }}
        >
          {/* Knob */}
          <div
            style={{
              position: 'absolute',
              left: '4px',
              top: '4px',
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              background: isOn ? '#faf7f2' : 'rgba(240,235,227,.18)',
              transform: isOn ? 'translateX(24px)' : 'translateX(0)',
              boxShadow: isOn ? '0 0 12px rgba(8,145,178,.5)' : 'none',
              transition: 'transform .5s cubic-bezier(.34,1.56,.64,1), background .5s, box-shadow .5s',
            }}
          />
        </div>

        {/* ON 레이블 */}
        <span
          style={{
            fontSize: '9px',
            letterSpacing: '.3em',
            textTransform: 'uppercase',
            color: isOn
              ? '#0d1a1f'
              : 'rgba(240,235,227,.2)',
            transition: 'color .5s',
          }}
        >
          ON
        </span>
      </div>
    </>
  );
}
