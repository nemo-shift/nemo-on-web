'use client';

import React, { useRef, useImperativeHandle, forwardRef, useEffect } from 'react';
import { useScramble } from '@/hooks/useScramble';

/**
 * JourneyLogoHandle: GlobalInteractionStage에서 Ref로 직접 제어할 핸들
 */
export interface JourneyLogoHandle {
  /** 루트 컨테이너 */
  containerEl: HTMLDivElement | null;
  /** 'REC' 부분 */
  recEl: HTMLSpanElement | null;
  /** 'T' 문자 (+로 모핑) */
  tEl: HTMLSpanElement | null;
  /** '+' 문자 (opacity 증가하며 등장) */
  plusEl: HTMLSpanElement | null;
  /** 'ANGLE' 부분 */
  angleEl: HTMLSpanElement | null;
  /** 한글 '네모' */
  nemoKrEl: HTMLSpanElement | null;
  /** 도형 [▲/○] 묶음 */
  shapesEl: HTMLSpanElement | null;
  /** [ON / OFF] 텍스트 */
  statusEl: HTMLSpanElement | null;
  /** 'RECTANGLE' 텍스트 전체 래퍼 */
  rectangleEl: HTMLSpanElement | null;
}

interface JourneyLogoProps {
  isOn: boolean;
  progress?: number;
  isTransitioning?: boolean;
}

/**
 * [Visual] 로고 8단계 여정 렌더링 컴포넌트
 */
const JourneyLogo = forwardRef<JourneyLogoHandle, JourneyLogoProps>(
  (_props, ref) => {
    const { progress = 0, isOn, isTransitioning } = _props;
    const containerRef  = useRef<HTMLDivElement>(null);
    const nemoKrRef     = useRef<HTMLSpanElement>(null);
    const shapesRef     = useRef<HTMLSpanElement>(null);
    const statusRef     = useRef<HTMLSpanElement>(null);
    const rectangleRef  = useRef<HTMLSpanElement>(null);
    const recRef        = useRef<HTMLSpanElement>(null);
    const tRef          = useRef<HTMLSpanElement>(null);
    const plusRef       = useRef<HTMLSpanElement>(null);
    const angleRef      = useRef<HTMLSpanElement>(null);

    const { scrambledText, startScramble, setScrambledText } = useScramble();
    const prevTargetRef = useRef<string>('');

    useEffect(() => {
      if (statusRef.current && progress === 0) {
        const target = (isOn || isTransitioning) ? 'ON' : 'OFF';
        if (prevTargetRef.current !== target) {
          startScramble(target, 600);
          prevTargetRef.current = target;
        }
      } else if (progress > 0) {
        const target = isOn ? 'ON' : 'OFF';
        setScrambledText(target);
        prevTargetRef.current = target;
      }
    }, [isOn, isTransitioning, progress, startScramble, setScrambledText]);

    useImperativeHandle(ref, () => ({
      get containerEl() { return containerRef.current; },
      get nemoKrEl()    { return nemoKrRef.current; },
      get shapesEl()    { return shapesRef.current; },
      get statusEl()    { return statusRef.current; },
      get rectangleEl() { return rectangleRef.current; },
      get recEl()       { return recRef.current; },
      get tEl()         { return tRef.current; },
      get plusEl()      { return plusRef.current; },
      get angleEl()     { return angleRef.current; },
    }));

    return (
      <div
        ref={containerRef}
        className="journey-logo-container relative overflow-visible select-none"
        style={{ willChange: 'transform' }}
        aria-label="네모:ON 로고"
      >
        {/* Layer A [네모 ▲/○ ON/OFF] */}
        <div className="logo-layer-kr flex items-baseline gap-[0.1em] origin-top-left">
          <span
            ref={nemoKrRef}
            className="font-esamanru"
            style={{
              fontSize: '2.0em', lineHeight: 1, letterSpacing: '-0.02em',
              color: 'var(--header-fg, #f0ebe3)', display: 'inline-block'
            }}
          >
            네모
          </span>

          <span
            ref={shapesRef}
            className="logo-shapes inline-flex flex-col items-center justify-center underline-offset-0"
            style={{
              fontSize: '0.25em', lineHeight: 1, margin: '0 0.6em', gap: '0.08em',
              transform: 'translateY(-2.75em)',
            }}
          >
            <span className="shape-triangle leading-none" style={{ fontSize: '1.2em', color: isOn || isTransitioning ? '#0891b2' : '#e8d5b0' }}>▲</span>
            <span className="shape-circle leading-none" style={{ color: isOn || isTransitioning ? '#0891b2' : '#c4a882' }}>○</span>
          </span>

          <span
            ref={statusRef}
            className="logo-status font-gmarket"
            style={{
              fontSize: '2.0em', lineHeight: 1, letterSpacing: '0.04em',
              color: 'var(--header-fg, #f0ebe3)', display: 'inline-block',
              minWidth: '2.5em', textAlign: 'left'
            }}
          >
            {(progress === 0 && !isTransitioning) 
              ? (isOn ? 'ON' : 'OFF') 
              : (scrambledText || (isOn ? 'ON' : 'OFF'))
            }
          </span>
        </div>

        {/* Layer B [RECTANGLE] T -> + Morphing */}
        <span
          ref={rectangleRef}
          className="logo-layer-rectangle absolute top-0 left-0 flex items-baseline font-bebas text-text-light"
          style={{
            opacity: 0, pointerEvents: 'none', whiteSpace: 'nowrap',
            letterSpacing: '0.02em', lineHeight: 0.9,
          }}
        >
          <span ref={recRef}>REC</span>

          <span style={{ position: 'relative', display: 'inline-block' }}>
            <span ref={tRef} className="morph-t" style={{ display: 'inline-block' }}>T</span>
            <span
              ref={plusRef}
              className="morph-plus"
              style={{ opacity: 0, position: 'absolute', left: 0, top: 0 }}
            >
              +
            </span>
          </span>

          <span ref={angleRef}>ANGLE</span>
        </span>
      </div>
    );
  },
);

export default JourneyLogo;
