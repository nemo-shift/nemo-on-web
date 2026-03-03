'use client';

import React from 'react';
import { useHeroContext } from '@/context/HeroContext';

type HeroBottomBarProps = {
  isOn: boolean;
};

/**
 * HeroBottomBar — 스크롤 인디케이터
 *
 * ON 모드에서 스크롤이 가능해질 때(isScrollable) 우측 하단 고정 표시.
 */
export default function HeroBottomBar({ isOn }: HeroBottomBarProps): React.ReactElement {
  const { isScrollable } = useHeroContext();
  const visible = isOn && isScrollable;
  return (
    <>
      <style>{`
        @keyframes scrollIndicatorDot {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(20px); }
        }
      `}</style>
      <div
        style={{
          position: 'fixed',
          bottom: 'clamp(20px, 3vh, 36px)',
          right: 'clamp(20px, 3vw, 48px)',
          zIndex: 100,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '6px',
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.8s ease',
          pointerEvents: 'none',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-dm-mono)',
            fontSize: '8px',
            letterSpacing: '.3em',
            color: 'var(--fg)',
            opacity: 0.4,
            textTransform: 'uppercase',
          }}
        >
          SCROLL
        </span>
        <div
          style={{
            width: 1,
            height: 28,
            background: 'var(--fg)',
            opacity: 0.25,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: 1,
              height: 8,
              background: 'var(--accent)',
              animation: 'scrollIndicatorDot 1.8s ease-in-out infinite',
            }}
          />
        </div>
      </div>
    </>
  );
}
