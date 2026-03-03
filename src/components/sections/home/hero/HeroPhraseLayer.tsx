'use client';

import React, { useEffect, useState } from 'react';
import { homeContent } from '@/data/homeContent';
import PhraseLine from './PhraseLine';

type HeroPhraseLayerProps = {
  isOn: boolean;
  visible?: boolean;
};

/**
 * HeroPhraseLayer — 프레이즈 3줄 (도형 포함)
 * 줄1: ○ 감성위에 / 줄2: 구조 △를 더해 / 줄3: 당신의 □로
 */
export default function HeroPhraseLayer({
  isOn,
  visible = true,
}: HeroPhraseLayerProps): React.ReactElement {
  const { phrases } = homeContent.hero;
  const [lineVisible, setLineVisible] = useState([false, false, false]);
  const [circleHover, setCircleHover] = useState(false);
  const [triHover, setTriHover] = useState(false);
  const [squareHover, setSquareHover] = useState(false);

  useEffect(() => {
    if (isOn) {
      const DELAY_AFTER_PARTICLES = 800;
      const INTERVAL = 700;
      const timers = phrases.map((_, i) =>
        setTimeout(
          () =>
            setLineVisible((prev) => {
              const next = [...prev];
              next[i] = true;
              return next;
            }),
          DELAY_AFTER_PARTICLES + i * INTERVAL
        )
      );
      return () => timers.forEach(clearTimeout);
    } else {
      setLineVisible([false, false, false]);
    }
  }, [isOn, phrases]);

  const circleColor = isOn ? '#0891b2' : 'rgba(196,168,130,.9)';
  const triColor = isOn ? '#0e7490' : 'rgba(232,213,176,.9)';
  const squareColor = isOn ? 'rgba(13,26,31,.6)' : 'rgba(240,235,227,.75)';
  const baseColor = isOn ? 'rgba(13,26,31,.28)' : 'rgba(240,235,227,.22)';

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '.24em',
        transform: 'translateX(-15%) translateY(15%)',
        pointerEvents: 'none',
        zIndex: 20,
        visibility: isOn ? 'visible' : 'hidden',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.4s ease',
      }}
    >
      <PhraseLine visible={lineVisible[0]} baseColor={baseColor}>
        <span
          onMouseEnter={() => setCircleHover(true)}
          onMouseLeave={() => setCircleHover(false)}
          style={{
            display: 'inline-block',
            width: '0.58em',
            height: '0.58em',
            borderRadius: '50%',
            border: '0.035em solid currentColor',
            background: circleHover ? 'currentColor' : 'transparent',
            transition: 'background 0.3s ease',
            color: circleColor,
            verticalAlign: 'middle',
            flexShrink: 0,
            cursor: 'pointer',
          }}
        />
        <span style={{ color: circleColor, transition: 'color .7s ease' }}>감성</span>
        <span>위에</span>
      </PhraseLine>

      <PhraseLine visible={lineVisible[1]} baseColor={baseColor}>
        <span style={{ color: triColor, transition: 'color .7s ease' }}>구조</span>
        <svg
          width="0.62em"
          height="0.58em"
          viewBox="0 0 24 22"
          style={{ flexShrink: 0, cursor: 'pointer' }}
          onMouseEnter={() => setTriHover(true)}
          onMouseLeave={() => setTriHover(false)}
        >
          <polygon
            points="12,2 22,20 2,20"
            fill={triHover ? triColor : 'none'}
            stroke={triColor}
            strokeWidth="1.5"
            style={{ transition: 'fill 0.3s ease' }}
          />
        </svg>
        <span>를 더해</span>
      </PhraseLine>

      <PhraseLine visible={lineVisible[2]} baseColor={baseColor}>
        <span>당신의</span>
        <span
          onMouseEnter={() => setSquareHover(true)}
          onMouseLeave={() => setSquareHover(false)}
          style={{
            display: 'inline-flex',
            width: '1em',
            height: '1em',
            border: '0.04em solid',
            borderColor: squareColor,
            background: squareHover ? squareColor : 'transparent',
            color: squareHover ? 'var(--bg)' : squareColor,
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            position: 'relative',
            overflow: 'hidden',
            transition: 'background 0.3s ease, color 0.3s ease',
            cursor: 'pointer',
          }}
        >
          <span style={{ fontFamily: 'Noto Serif KR, serif', fontSize: '0.55em' }}>결</span>
        </span>
        <span>로</span>
      </PhraseLine>
    </div>
  );
}
