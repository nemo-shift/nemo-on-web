'use client';

import React, { useEffect, useRef } from 'react';
import { useNearPageBottom } from '@/hooks';
import { INTERACTION_Z_INDEX } from '@/constants/interaction';

/**
 * [V75/STEP D] About·Offerings 전용 스크롤 힌트.
 * 홈의 GlobalScrollHint와 동일한 sin 곡선 넛지 엔진을 사용하되,
 * GSAP 스크럽과 무관한 순수 브라우저 스크롤 페이지에 맞게 독립 구현한다.
 *
 * ⚠️ color: rgba(20,20,20,0.55)는 밝은 배경 기준 임시값.
 *    Offerings 배경색 모핑 구간에서 대비가 부족할 수 있음 — 발견 시 보고.
 */
export default function SubpageScrollHint(): React.ReactElement {
  const isNearBottom = useNearPageBottom(80);
  const visible = !isNearBottom;

  const iconRef = useRef<SVGSVGElement>(null);
  const rafRef = useRef<number>(0);
  const startRef = useRef<number | null>(null);
  const DUR = 2200;

  useEffect(() => {
    const tick = (ts: number) => {
      if (!startRef.current) startRef.current = ts;
      const p = ((ts - startRef.current) % DUR) / DUR;
      const v = Math.sin(p * Math.PI);
      if (iconRef.current) {
        iconRef.current.style.transform = `translateY(${v * 6}px)`;
        iconRef.current.style.opacity = String(0.4 + v * 0.6);
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 'clamp(24px, 4svh, 48px)',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: INTERACTION_Z_INDEX.Z_UI_GUIDE,
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.5s ease',
        pointerEvents: 'none',
      }}
    >
      <svg
        ref={iconRef}
        width={22}
        height={22}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        style={{ color: 'rgba(20,20,20,0.55)', display: 'inline-block' }}
      >
        <path d="M6 9l6 6 6-6" />
      </svg>
    </div>
  );
}
