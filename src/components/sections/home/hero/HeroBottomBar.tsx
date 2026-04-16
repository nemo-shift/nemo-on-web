'use client';

import React, { useEffect, useRef } from 'react';
import { useHeroContext } from '@/context';
import { INTERACTION_Z_INDEX } from '@/constants/interaction';

type HeroBottomBarProps = {
  isOn: boolean;
};

/**
 * HeroBottomBar — 스크롤 인디케이터
 * 
 * 사용자 제공 RAF 기반 Sine-Wave 애니메이션 엔진 적용.
 * 상하/좌우 확장이 용이한 구조를 위해 scale 변수를 사용합니다.
 */
export default function HeroBottomBar({ isOn }: HeroBottomBarProps): React.ReactElement {
  const { isScrollable } = useHeroContext();
  const visible = isOn && isScrollable;
  
  const lineRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const startRef = useRef<number | null>(null);
  const DUR = 2200; // 2.2초 주기

  useEffect(() => {
    const tick = (ts: number) => {
      if (!startRef.current) startRef.current = ts;
      const p = ((ts - startRef.current) % DUR) / DUR;
      const v = Math.sin(p * Math.PI);
      
      // 사용자가 제공한 스케일(0.05 ~ 1.0) 및 투명도(0.15 ~ 1.0) 로직
      const scale = 0.05 + v * 0.95;
      const opacity = 0.15 + v * 0.85;

      if (lineRef.current) {
        // 현재는 세로(Vertical) 스크롤 힌트이므로 scaleY를 조절합니다.
        // 향후 좌우(Horizontal) 필요 시 scaleX로 손쉽게 전환 가능한 구조입니다.
        lineRef.current.style.transform = `scaleY(${scale})`;
        lineRef.current.style.opacity = String(opacity);
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 'clamp(20px, 3vh, 36px)',
        right: 'clamp(20px, 3vw, 48px)',
        zIndex: INTERACTION_Z_INDEX.Z_CONTENT,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.8s ease',
        pointerEvents: 'none',
      }}
    >
      {/* 애니메이션 트랙 (배경 없음, 스트레칭 전용 영역) */}
      <div
        style={{
          width: 1,
          height: 48,
          position: 'relative',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <div
          ref={lineRef}
          style={{
            width: 1,
            height: '100%',
            background: 'var(--accent)',
            transformOrigin: 'center',
            willChange: 'transform, opacity',
            borderRadius: '1px',
          }}
        />
      </div>

      <span
        style={{
          fontFamily: 'var(--font-dm-mono)',
          fontSize: '9px',
          letterSpacing: '.18em',
          color: 'var(--fg)',
          opacity: 0.4,
          textTransform: 'uppercase',
        }}
      >
        SCROLL
      </span>
    </div>
  );
}
