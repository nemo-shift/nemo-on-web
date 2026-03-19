'use client';

import React, { useRef, useImperativeHandle, forwardRef, useEffect } from 'react';
import { useScramble } from '@/hooks/useScramble';

/**
 * JourneyLogoHandle: GlobalInteractionStage에서 제어할 핸들
 */
export interface JourneyLogoHandle {
  containerEl: HTMLDivElement | null;
  /** RECTANGLE 로고 전체 */
  rectangleEl: HTMLDivElement | null;
  /** 'T' 문자를 구성하는 십자 선 (모핑용) */
  tLines: {
    h: HTMLDivElement | null;
    v: HTMLDivElement | null;
  };
  /** 한글 '네모' */
  nemoKrEl: HTMLDivElement | null;
  /** 도형 세트 */
  shapesEl: HTMLDivElement | null;
  /** ON / OFF 텍스트 */
  statusEl: HTMLDivElement | null;
}

interface JourneyLogoProps {
  isOn: boolean;
  progress?: number;
  isTransitioning?: boolean;
}

/**
 * [V4.3 Foundation] 로고 8단계 여정 (실용적 DOM 복구 버전)
 * 브랜드 폰트의 심미성을 유지하면서 가벼운 CSS 선으로 'T->+' 모핑을 수행합니다.
 */
const JourneyLogo = forwardRef<JourneyLogoHandle, JourneyLogoProps>(
  (_props, ref) => {
    const { progress = 0, isOn, isTransitioning } = _props;
    const containerRef = useRef<HTMLDivElement>(null);
    const nemoKrRef = useRef<HTMLDivElement>(null);
    const shapesRef = useRef<HTMLDivElement>(null);
    const statusRef = useRef<HTMLDivElement>(null);
    const rectangleRef = useRef<HTMLDivElement>(null);
    
    // T 모핑용 두 개의 선
    const tLineHRef = useRef<HTMLDivElement>(null);
    const tLineVRef = useRef<HTMLDivElement>(null);

    const { scrambledText, startScramble, setScrambledText } = useScramble();
    const prevTargetRef = useRef<string>('');

    // ON/OFF 스크램블 효과 (V4.3: 전환 시작 전 즉시 발동)
    useEffect(() => {
      const target = (isOn || isTransitioning) ? 'ON' : 'OFF';
      
      // 전환 중이거나 타겟이 달라지면 즉시 스크램블 시작
      if (prevTargetRef.current !== target || isTransitioning) {
        startScramble(target, 450); // 타격감을 위해 450ms로 설정
        prevTargetRef.current = target;
      }
    }, [isOn, isTransitioning, startScramble]);

    useImperativeHandle(ref, () => ({
      get containerEl() { return containerRef.current; },
      get nemoKrEl() { return nemoKrRef.current; },
      get shapesEl() { return shapesRef.current; },
      get statusEl() { return statusRef.current; },
      get rectangleEl() { return rectangleRef.current; },
      tLines: {
        get h() { return tLineHRef.current; },
        get v() { return tLineVRef.current; }
      }
    }));

    const colorStyle = { color: 'var(--header-fg)' };

    return (
      <div
        ref={containerRef}
        className="journey-logo flex items-baseline gap-2 select-none"
        style={{ height: '32px', willChange: 'transform' }}
      >
        {/* 1. 한글 네모 (Layer A) */}
        <div 
          ref={nemoKrRef} 
          className="font-esamanru font-bold text-[24px] tracking-tighter"
          style={colorStyle}
        >
          네모
        </div>

        {/* 2. 기호 [▲/○] */}
        <div ref={shapesRef} className="flex flex-col items-center justify-center gap-0.5 mt-1.5 opacity-80">
          <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[6px] border-b-[#0891b2]" />
          <div className="w-[6px] h-[6px] rounded-full bg-[#0891b2]" />
        </div>

        {/* 3. ON/OFF (Scramble) */}
        <div 
          ref={statusRef} 
          className="font-gmarket font-bold text-[22px] tracking-tight min-w-[36px]"
          style={colorStyle}
        >
          {scrambledText || (isOn ? 'ON' : 'OFF')}
        </div>

        {/* 4. RECTANGLE (Layer B - Hidden initially) */}
        <div 
          ref={rectangleRef} 
          className="absolute inset-0 flex items-baseline font-bebas text-[28px] tracking-widest opacity-0 pointer-events-none"
          style={colorStyle}
        >
          <span>REC</span>
          {/* T Morphing Point (Using CSS Lines for Practicality) */}
          <div className="relative w-[18px] h-[24px] mx-0.5">
            {/* 가로 선 (Horizontal Bar) */}
            <div 
              ref={tLineHRef}
              className="absolute left-0 top-[4px] w-full h-[3.5px] bg-current rounded-sm"
              style={{ transition: 'top 0.3s ease' }}
            />
            {/* 세로 선 (Vertical Bar) */}
            <div 
              ref={tLineVRef}
              className="absolute left-1/2 -translateX-1/2 top-[4px] w-[3.5px] h-[85%] bg-current rounded-sm"
              style={{ transform: 'translateX(-50%)' }}
            />
          </div>
          <span>ANGLE</span>
        </div>
      </div>
    );
  },
);

export default JourneyLogo;
