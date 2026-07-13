'use client';

import React, { useEffect, useRef } from 'react';
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
  const { isOn, isScrollable, isCtaFocused } = useHeroContext();
  const { isMobileView, isTabletPortrait } = useDevice();

  // 노출 조건: 히어로 온(ON) 모드 안착 + 스크롤 가능 상태 + CTA 미진입
  const visible = isOn && isScrollable && !isCtaFocused;
  
  // [V12] 기기별 스타일 최적화 매트릭스
  // 태블릿 세로는 PC와 동일한 크기를 선호하시므로 분기 유지, 모바일만 축소
  const isPureMobile = isMobileView && !isTabletPortrait;
  
  const lineRef = useRef<SVGSVGElement>(null);
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
      
      // [V74.ScrollGuidance] 꺾쇠 아이콘 위아래 넛지 움직임
      if (lineRef.current) {
        const nudge = v * 6; // 0~6px 사이 위아래 이동
        lineRef.current.style.transform = `translateY(${nudge}px)`;
        lineRef.current.style.opacity = String(0.4 + v * 0.6);
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
        bottom: isPureMobile ? '32px' : 'clamp(24px, 4svh, 48px)', // [V67.ViewportFix] 4vh → 4svh / 모바일은 하단바 고려하여 고정값
        left: '50%',
        transform: 'translateX(-50%)', // 중앙 정렬
        zIndex: INTERACTION_Z_INDEX.Z_UI_GUIDE,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.8s ease',
        pointerEvents: 'none',
      }}
    >
      {/* [V74.ScrollGuidance] 꺾쇠 아이콘 (SCROLL 텍스트 + 스트레칭 라인 대체) */}
      <svg
        ref={lineRef}
        width={isPureMobile ? 18 : 22}
        height={isPureMobile ? 18 : 22}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        style={{
          color: 'var(--scroll-hint-fg)',
          transition: 'color 0.7s ease',
          display: 'inline-block',
        }}
      >
        <path d="M6 9l6 6 6-6" />
      </svg>
    </div>
  );
}
