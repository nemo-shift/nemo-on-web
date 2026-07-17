'use client';

import React, { useEffect, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { COLORS } from '@/constants/colors';
import { cn } from '@/lib/utils';

interface HeroSloganOnProps {
  sentence?: string;
  blurAmount?: number;
  animationDuration?: number;
  pauseBetweenAnimations?: number;
  isSmall?: boolean;
}

/**
 * HeroSloganOn 컴포넌트
 * 온모드(ON) 전용 슬로건 — 단어별 포커스 블러 애니메이션.
 * 불안을 끄고, 기준을 켭니다
 * 오프모드(OFF)와 완전히 분리된 독립 컴포넌트.
 * isSmall: 새 메인 슬로건 왼쪽 상단 소형 레이블용
 */
const HeroSloganOn: React.FC<HeroSloganOnProps> = ({
  sentence = '불안을 끄고, 기준을 켭니다',
  blurAmount = 4,
  animationDuration = 0.6,
  pauseBetweenAnimations = 2,
  isSmall = false,
}) => {
  const segments = sentence.split(',').map(s => s.trim());
  const [currentIndex, setCurrentIndex] = useState(0);

  // [Batch6] 히어로 구간 이탈 시 인터벌 정지, 복귀 시 재개
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    const handler = (e: Event) => setIsActive((e as CustomEvent).detail);
    window.addEventListener('nemo:hero-active', handler);
    return () => window.removeEventListener('nemo:hero-active', handler);
  }, []);

  useEffect(() => {
    if (!isActive) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % segments.length);
    }, (animationDuration + pauseBetweenAnimations) * 1000);
    return () => clearInterval(interval);
  }, [isActive, animationDuration, pauseBetweenAnimations, segments.length]);

  const containerRef = React.useRef<HTMLDivElement>(null);
  const focusBoxRef = React.useRef<HTMLDivElement>(null);
  const segmentRefs = React.useRef<(HTMLDivElement | null)[]>([]);

  const cornerPositions = isSmall ? [
    '-top-[1px] -left-[1px] border-t border-l',
    '-top-[1px] -right-[1px] border-t border-r',
    '-bottom-[1px] -left-[1px] border-b border-l',
    '-bottom-[1px] -right-[1px] border-b border-r',
  ] : [
    '-top-[1.5px] -left-[1.5px] border-t-2 border-l-2',
    '-top-[1.5px] -right-[1.5px] border-t-2 border-r-2',
    '-bottom-[1.5px] -left-[1.5px] border-b-2 border-l-2',
    '-bottom-[1.5px] -right-[1.5px] border-b-2 border-r-2',
  ];
  const bracketSize = isSmall ? 'w-1.5 h-1.5' : 'w-2.5 h-2.5';
  const textSizeClass = isSmall
    ? 'text-[0.85rem] tablet-p:text-[0.95rem] tablet:text-[1.05rem] desktop-wide:text-[1.1rem] desktop-cap:text-[1.2rem]'
    : 'text-[1.8rem] tablet-p:text-[3.0rem] tablet:text-[3.6rem] desktop-wide:text-[4.2rem] desktop-cap:text-[4.8rem]';
  const segmentPaddingClass = isSmall ? 'px-1 py-0.5' : 'px-1.5 py-1';

  // 단어별 포커스 애니메이션
  useGSAP(() => {
    if (!containerRef.current) return;

    segmentRefs.current.forEach((el, index) => {
      if (!el) return;
      const isActive = index === currentIndex;

      gsap.to(el, {
        filter: isActive ? 'blur(0px)' : `blur(${blurAmount}px)`,
        opacity: isActive ? 1 : 0.2,
        scale: isActive ? 1 : 0.98,
        duration: animationDuration,
        ease: 'power2.inOut'
      });

      // 포커스 박스 이동
      if (isActive && focusBoxRef.current) {
        gsap.to(focusBoxRef.current, {
          x: el.offsetLeft,
          y: el.offsetTop,
          width: el.offsetWidth,
          height: el.offsetHeight,
          duration: 0.4,
          ease: 'back.out(1.2)'
        });
      }
    });

    // 데코레이티브 라인 (기본 크기에서만)
    if (!isSmall) {
      const decoLine = containerRef.current.querySelector('.deco-line');
      if (decoLine) {
        gsap.fromTo(decoLine,
          { scaleX: 0, opacity: 0 },
          { scaleX: 1, opacity: 0.5, duration: 0.8, delay: 0.3, ease: 'circ.out' }
        );
      }
    }
  }, { dependencies: [currentIndex, isSmall], scope: containerRef });

  return (
    <div ref={containerRef} className={cn("relative h-auto flex flex-col justify-start overflow-hidden", isSmall ? 'w-auto' : 'w-full')}>
      <div className="flex items-center relative">
        <div className="flex items-center relative">
          {/* 공통 포커스 박스 (하나의 엘리먼트가 이동) */}
          <div
            ref={focusBoxRef}
            className="absolute pointer-events-none z-10"
            style={{ border: '1.5px solid transparent' }}
          >
            {cornerPositions.map((pos, i) => (
              <div
                key={i}
                className={`absolute ${bracketSize} ${pos}`}
                style={{ borderColor: COLORS.HERO.OFF.ACCENT }}
              />
            ))}
          </div>

          {segments.map((segment, index) => (
            <div key={index} className="flex items-center">
              <div
                ref={el => { segmentRefs.current[index] = el; }}
                className={cn("flex items-center justify-center min-w-fit", segmentPaddingClass)}
              >
                <span
                  className={cn(
                    'font-bold tracking-tight pointer-events-none select-none whitespace-nowrap leading-none transition-all duration-500',
                    textSizeClass
                  )}
                  style={{
                    fontFamily: 'var(--font-suit), sans-serif',
                    color: COLORS.TEXT.DARK,
                  }}
                >
                  {segment}
                </span>
              </div>
              {index < segments.length - 1 && (
                <span
                  className={cn(
                    'select-none mx-1 transition-all duration-500 font-bold',
                    textSizeClass
                  )}
                  style={{
                    fontFamily: 'var(--font-suit), sans-serif',
                    color: COLORS.TEXT.DARK,
                  }}
                >
                  ,
                </span>
              )}
            </div>
          ))}
        </div>
        {/* 데코레이티브 라인 (기본 크기에서만 표시) */}
        {!isSmall && (
          <div
            className="deco-line absolute -bottom-1.5 left-[0.25rem] right-[0.25rem] h-[1px]"
            style={{
              background: `linear-gradient(90deg, transparent 0%, ${COLORS.HERO.ON.ACCENT} 40%, ${COLORS.HERO.ON.ACCENT} 100%)`,
              transformOrigin: 'left',
            }}
          />
        )}
      </div>
    </div>
  );
};

export default HeroSloganOn;
