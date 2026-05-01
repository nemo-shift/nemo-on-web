'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useHeroContext, useDevice } from '@/context';
import { INTERACTION_Z_INDEX } from '@/constants/interaction';

/**
 * GlobalScrollHint — 통합 전역 스크롤 가이드
 * 
 * - 화면 중앙 하단 고정
 * - 수학 공식(Math.sin) 기반의 숨 쉬는 엔진 탑재
 * - '--scroll-hint-fg' 전역 변수를 구독하여 배경에 맞춰 색상 자동 반전
 */
export default function GlobalScrollHint(): React.ReactElement {
  const { isOn, isScrollable, isTransitioning } = useHeroContext();
  const { isMobileView, isTabletPortrait } = useDevice();
  
  // 노출 조건: 히어로 온(ON) 모드 안착 + 스크롤 가능 상태
  const visible = isOn && isScrollable && !isTransitioning;
  
  // [V12] 기기별 스타일 최적화 매트릭스
  // 태블릿 세로는 PC와 동일한 크기를 선호하시므로 분기 유지, 모바일만 축소
  const isPureMobile = isMobileView && !isTabletPortrait;
  const fontSize = isPureMobile ? '9px' : '10px';
  const lineHeight = isPureMobile ? 36 : 48;
  const gap = isPureMobile ? '6px' : '8px';
  
  const lineRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const startRef = useRef<number | null>(null);
  const DUR = 2200; // 2.2초 주기

  useEffect(() => {
    // 렌더링 부하를 줄이기 위해 보이지 않을 때는 애니메이션을 일시 정지할 수 있습니다.
    // 하지만 심리스한 재개를 위해 일단 계속 돌리거나 조건부로 돌립니다.
    const tick = (ts: number) => {
      if (!startRef.current) startRef.current = ts;
      const p = ((ts - startRef.current) % DUR) / DUR;
      const v = Math.sin(p * Math.PI);
      
      // 사용자가 제공한 스케일(0.05 ~ 1.0) 및 투명도(0.15 ~ 1.0) 로직
      const scale = 0.05 + v * 0.95;
      const opacity = 0.15 + v * 0.85;

      if (lineRef.current) {
        // [V11] 상단 고정(transformOrigin: top) 상태에서 아래로 늘어나는 디자인
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
      id="global-scroll-hint"
      style={{
        position: 'fixed',
        bottom: isPureMobile ? '32px' : 'clamp(24px, 4vh, 48px)', // 모바일은 하단바 고려하여 고정값
        left: '50%',
        transform: 'translateX(-50%)', // 중앙 정렬
        zIndex: INTERACTION_Z_INDEX.Z_UI_GUIDE,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: gap,
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.8s ease',
        pointerEvents: 'none',
      }}
    >
      {/* 1. 상단 텍스트 (SCROLL) */}
      <span
        style={{
          fontFamily: 'var(--font-dm-mono)',
          fontSize: fontSize,
          fontWeight: 500,
          letterSpacing: '.3em',
          textTransform: 'uppercase',
          color: 'var(--scroll-hint-fg)', // 전역 색상 변수 연동
          transition: 'color 0.7s ease',
        }}
      >
        SCROLL
      </span>

      {/* 2. 하단 애니메이션 트랙 (스트레칭 라인) */}
      <div
        style={{
          width: 1,
          height: lineHeight,
          position: 'relative',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start', // 위에서 아래로 자라나도록 top 정렬
        }}
      >
        <div
          ref={lineRef}
          style={{
            width: 1,
            height: '100%',
            background: 'var(--scroll-hint-fg)', // 전역 색상 변수 연동
            transformOrigin: 'top', // 위쪽을 고정하고 아래로 늘어남
            willChange: 'transform, opacity',
            borderRadius: '1px',
            transition: 'background 0.7s ease',
          }}
        />
      </div>
    </div>
  );
}
