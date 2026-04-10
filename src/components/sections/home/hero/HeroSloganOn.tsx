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
}

/**
 * HeroSloganOn 컴포넌트
 * 온모드(ON) 전용 슬로건 — 단어별 포커스 블러 애니메이션.
 * 불안을 끄고, 기준을 켭니다
 * 오프모드(OFF)와 완전히 분리된 독립 컴포넌트.
 */
const HeroSloganOn: React.FC<HeroSloganOnProps> = ({
  sentence = '불안을 끄고, 기준을 켭니다',
  blurAmount = 4,
  animationDuration = 0.6,
  pauseBetweenAnimations = 2,
}) => {
  const segments = sentence.split(',').map(s => s.trim());
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % segments.length);
    }, (animationDuration + pauseBetweenAnimations) * 1000);
    return () => clearInterval(interval);
  }, [animationDuration, pauseBetweenAnimations, segments.length]);

  const containerRef = React.useRef<HTMLDivElement>(null);
  const focusBoxRef = React.useRef<HTMLDivElement>(null);
  const segmentRefs = React.useRef<(HTMLDivElement | null)[]>([]);

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

    // 데코레이티브 라인
    const decoLine = containerRef.current.querySelector('.deco-line');
    if (decoLine) {
      gsap.fromTo(decoLine, 
        { scaleX: 0, opacity: 0 },
        { scaleX: 1, opacity: 0.5, duration: 0.8, delay: 0.3, ease: 'circ.out' }
      );
    }
  }, { dependencies: [currentIndex], scope: containerRef });

  return (
    <div ref={containerRef} className="relative w-full h-auto flex flex-col justify-start overflow-hidden">
      <div className="flex items-center relative">
        <div className="flex items-center relative">
          {/* 공통 포커스 박스 (하나의 엘리먼트가 이동) */}
          <div
            ref={focusBoxRef}
            className="absolute pointer-events-none z-10"
            style={{ border: '1.5px solid transparent' }}
          >
            {[
              '-top-[1.5px] -left-[1.5px] border-t-2 border-l-2',
              '-top-[1.5px] -right-[1.5px] border-t-2 border-r-2',
              '-bottom-[1.5px] -left-[1.5px] border-b-2 border-l-2',
              '-bottom-[1.5px] -right-[1.5px] border-b-2 border-r-2',
            ].map((pos, i) => (
              <div 
                key={i}
                className={`absolute w-2.5 h-2.5 ${pos}`} 
                style={{ borderColor: COLORS.HERO.OFF.ACCENT }}
              />
            ))}
          </div>

          {segments.map((segment, index) => (
            <div key={index} className="flex items-center">
              <div 
                ref={el => { segmentRefs.current[index] = el; }}
                className="flex items-center justify-center px-1.5 py-1 min-w-fit"
              >
                <span
                  /* 
                   * [V11.33] 온모드 슬로건 5단계 정규화
                   * - 모바일(2.2rem)부터 데스크탑 캡(4.8rem)까지 계단식 성장 적용
                   * - 특히 tablet-p(744px) 구간의 3.0rem 수치를 추가하여 중형 태블릿의 가독성 확보
                   */
                  //슬로건 크기
                  className={cn(
                    "font-bold tracking-tight pointer-events-none select-none whitespace-nowrap leading-none transition-all duration-500",
                    "text-[1.8rem]",                  // Mobile
                    "tablet-p:text-[3.0rem]",          // 744px
                    "tablet:text-[3.6rem]",            // 992px
                    "desktop-wide:text-[4.2rem]",      // 1440px
                    "desktop-cap:text-[4.8rem]"        // 1920px
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
                    "select-none mx-1 transition-all duration-500 font-bold",
                    "text-[1.8rem]",
                    "tablet-p:text-[3.0rem]",
                    "tablet:text-[3.6rem]",
                    "desktop-wide:text-[4.2rem]",
                    "desktop-cap:text-[4.8rem]"
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
        {/* 데코레이티브 라인 */}
        <div
          className="deco-line absolute -bottom-1.5 left-[0.25rem] right-[0.25rem] h-[1px]"
          style={{ 
            background: `linear-gradient(90deg, transparent 0%, ${COLORS.HERO.ON.ACCENT} 40%, ${COLORS.HERO.ON.ACCENT} 100%)`,
            transformOrigin: 'left',
          }}
        />
      </div>
    </div>
  );
};

export default HeroSloganOn;
