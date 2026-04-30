import React, { useRef, useImperativeHandle } from 'react';
import { COLORS } from '@/constants/colors';
import { cn } from '@/lib/utils';
import { INTERACTION_Z_INDEX } from '@/constants/interaction';

import { RESONANCE_MESSAGE } from '@/data/home/pain';

export interface PainSectionProps {
  interactionMode?: 'mouse' | 'touch';
}

export interface PainSectionHandle {
  marqueeLine1: HTMLDivElement | null;
  marqueeLine2: HTMLDivElement | null;
  // 터치 전용 4단계 슬라이드 Ref
  resonanceSlides: (HTMLDivElement | null)[];
}

// ReactBits 스타일: 글자별 분리 렌더링 컴포넌트
const SplitText = ({ text, innerRef }: { text: string, innerRef: React.RefObject<HTMLDivElement | null> }) => {
  return (
    <div ref={innerRef} className="flex flex-wrap justify-center overflow-hidden pointer-events-none">
      {text.split('').map((char, i) => (
        <span 
          key={i} 
          className="inline-block whitespace-pre opacity-0 translate-y-[30px]" 
          style={{ willChange: 'transform, opacity' }}
        >
          {char}
        </span>
      ))}
    </div>
  );
};

export const PainSection = React.forwardRef<PainSectionHandle, PainSectionProps>((props, ref) => {
  const { interactionMode } = props;
  const containerRef = useRef<HTMLElement>(null);
  
  const line1Ref = useRef<HTMLDivElement>(null);
  const line2Ref = useRef<HTMLDivElement>(null);

  // 4개의 슬라이드 전용 Ref
  const sRefs = [
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null)
  ];

  useImperativeHandle(ref, () => ({
    get marqueeLine1() { return line1Ref.current; },
    get marqueeLine2() { return line2Ref.current; },
    resonanceSlides: sRefs.map(r => r.current)
  }));
  
  const isTouch = interactionMode === 'touch';

  return (
    <section 
      ref={containerRef} 
      id="section-pain" 
      className="relative w-full h-[1000vh]"
      style={{ backgroundColor: 'transparent' }}
    >
      {/* 섹션 안내 가이드 : 섹션 별 구분 원할때 주석 해제 */}
      {/*<div className="absolute top-0 left-0 w-full border-t border-red-500/50 z-[100] pointer-events-none">
        <span className="absolute top-2 left-4 text-[10px] uppercase font-mono text-red-500/50">Start: Pain Section</span>
      </div>*/}

      <div 
        className="sticky top-0 left-0 w-full h-screen flex flex-col items-center justify-center overflow-hidden"
        style={{ zIndex: INTERACTION_Z_INDEX.Z_CONTENT }}
      >
        {/* [섹션명 표시]  */}
        {/*<div className="container mx-auto px-6 flex flex-col items-center">
          <h2 className="font-bold text-white/12 uppercase tracking-[0.2em] text-4xl tablet-p:text-5xl tablet:text-6xl desktop-wide:text-7xl desktop-cap:text-8xl">
            Pain points
          </h2>
        </div>*/}

        {!isTouch ? (
          <div className="absolute inset-x-0 w-full flex flex-col items-center justify-center gap-12 pointer-events-none">
            <div ref={line1Ref} className="whitespace-nowrap font-bold text-white tracking-[0.02em] opacity-0 text-5xl tablet-p:text-6xl tablet:text-[8vw] desktop:text-[7vw]" style={{ willChange: 'transform, opacity' }}>
              {RESONANCE_MESSAGE.marquee.line1}
            </div>
            <div ref={line2Ref} className="whitespace-nowrap font-bold text-white tracking-[0.02em] opacity-0 text-5xl tablet-p:text-6xl tablet:text-[8vw] desktop:text-[7vw]" style={{ willChange: 'transform, opacity' }}>
              {RESONANCE_MESSAGE.marquee.line2}
            </div>
          </div>
        ) : (
          /* [Touch Mode] 4단계 ReactBits 스타일 슬라이더 (Margin을 통해 위치 상향 보정) */
          <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center pointer-events-none px-6">
            {RESONANCE_MESSAGE.slides.map((slide, idx) => (
              <div key={idx} className="absolute inset-0 flex items-center justify-center">
                <div 
                  className={cn(
                    'font-bold text-white tracking-[0.02em] text-center',
                    'text-[20px] tablet-p:text-[32px] tablet:text-[4.5vw]',
                    'mb-32 tablet:mb-40'
                  )}
                >
                  <SplitText text={slide.text} innerRef={sRefs[idx]} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
});

PainSection.displayName = 'PainSection';
