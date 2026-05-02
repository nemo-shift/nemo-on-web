'use client';

import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface ForWhoScrollHintProps {
  visible: boolean;
}

/**
 * ForWhoScrollHint — 포후 섹션 전용 가로 스크롤 가이드
 * 
 * - 캐러셀 카드 우측 하단에 배치
 * - 수학 공식(Math.sin) 기반의 숨 쉬는 가로 엔진 탑재
 */
export default function ForWhoScrollHint({ visible }: ForWhoScrollHintProps): React.ReactElement {
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
        // 가로(Horizontal) 스크롤 힌트이므로 scaleX를 조절합니다.
        lineRef.current.style.transform = `scaleX(${scale})`;
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
      id="forwho-scroll-hint"
      className={cn(
        "absolute bottom-[10vh] tablet-p:bottom-[15vh] right-[5%] tablet-p:right-[10%] tablet:right-[15%] z-30",
        "flex flex-col items-center gap-3 select-none pointer-events-none"
      )}
      style={{ opacity: 0, visibility: 'hidden' }}
    >
      <div className="flex flex-col items-start gap-2">
        {/* 상단 텍스트 (SWIPE) */}
        <span 
          style={{
            fontFamily: 'var(--font-dm-mono)',
            fontSize: '10px',
            fontWeight: 500,
            letterSpacing: '.3em',
            textTransform: 'uppercase',
            color: 'var(--scroll-hint-fg)', // 배경색에 맞춰 자동 반전
            transition: 'color 0.7s ease'
          }}
        >
          SWIPE
        </span>

        {/* 하단 애니메이션 트랙 (가로 스트레칭 라인) */}
        <div className="w-16 h-[1px] relative flex items-center justify-start">
          <div
            ref={lineRef}
            style={{
              width: '100%',
              height: '1px',
              background: 'var(--scroll-hint-fg)', // 배경색에 맞춰 자동 반전
              transformOrigin: 'left', // 왼쪽을 고정하고 오른쪽으로 늘어남 (우측 이동 유도)
              willChange: 'transform, opacity',
              borderRadius: '1px',
              transition: 'background 0.7s ease'
            }}
          />
        </div>
      </div>
    </div>
  );
}
