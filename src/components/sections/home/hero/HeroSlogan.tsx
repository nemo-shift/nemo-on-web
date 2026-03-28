'use client';

import React, { useEffect, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { RotatingText } from '@/components/ui';
import { cn } from '@/lib/utils';
import { COLORS } from '@/constants/colors';

interface HeroSloganProps {
  isOn: boolean;
  isMobile?: boolean;
  isTransitioning?: boolean;
  onToggle?: () => void;
  sentence?: string;
  blurAmount?: number;
  animationDuration?: number;
  pauseBetweenAnimations?: number;
}

/**
 * HeroSlogan 컴포넌트
 * OFF 모드 슬로건(로테이팅 텍스트)과 ON 모드 슬로건(포커스 텍스트)을 통합 관리합니다.
 */
const HeroSlogan: React.FC<HeroSloganProps> = ({
  isOn,
  isMobile = false,
  onToggle,
  sentence = '불안을 끄고, 기준을 켭니다',
  blurAmount = 4,
  animationDuration = 0.6,
  pauseBetweenAnimations = 2,
}) => {
  // ON 모드용 상태
  const segments = sentence.split(',').map(s => s.trim());
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!isOn) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % segments.length);
    }, (animationDuration + pauseBetweenAnimations) * 1000);
    return () => clearInterval(interval);
  }, [isOn, animationDuration, pauseBetweenAnimations, segments.length]);

  const containerRef = React.useRef<HTMLDivElement>(null);
  const onSloganRef = React.useRef<HTMLDivElement>(null);
  const offSloganRef = React.useRef<HTMLDivElement>(null);
  const focusBoxRef = React.useRef<HTMLDivElement>(null);
  const segmentRefs = React.useRef<(HTMLDivElement | null)[]>([]);

  const handleMobileClick = () => {
    if (!isMobile || isOn) return;
    setTimeout(() => {
      onToggle?.();
    }, 150);
  };

  // [V16.3] ON/OFF 모드 전환 애니메이션
  useGSAP(() => {
    if (isOn) {
      // OFF 모드 페이드아웃 후 ON 모드 페이드인
      gsap.to(offSloganRef.current, { opacity: 0, y: -10, duration: 0.4, ease: 'power2.inOut', display: 'none' });
      gsap.fromTo(onSloganRef.current, 
        { opacity: 0, y: 10, display: 'flex' },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out', delay: 0.1 }
      );
    } else {
      // ON 모드 페이드아웃 후 OFF 모드 페이드인
      gsap.to(onSloganRef.current, { opacity: 0, y: -10, duration: 0.4, ease: 'power2.inOut', display: 'none' });
      gsap.fromTo(offSloganRef.current, 
        { opacity: 0, y: 10, display: 'flex' },
        { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out', delay: 0.1 }
      );
    }
  }, { dependencies: [isOn], scope: containerRef });

  // [V16.3] ON 모드 내부 단어별 포커스 애니메이션
  useGSAP(() => {
    if (!isOn || !onSloganRef.current) return;

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
    const decoLine = onSloganRef.current.querySelector('.deco-line');
    if (decoLine) {
      gsap.fromTo(decoLine, 
        { scaleX: 0, opacity: 0 },
        { scaleX: 1, opacity: 0.5, duration: 0.8, delay: 0.3, ease: 'circ.out' }
      );
    }
  }, { dependencies: [currentIndex, isOn], scope: containerRef });

  return (
    <div ref={containerRef} className="relative w-full h-full min-h-[120px] flex flex-col justify-start overflow-hidden">
      {/* --- OFF MODE SLOGAN --- */}
      <div
        ref={offSloganRef}
        className="flex flex-col items-start justify-center text-left gap-1 md:gap-2 pointer-events-auto"
        style={{
          fontFamily: 'var(--font-suit), sans-serif',
          color: COLORS.TEXT.LIGHT,
          cursor: isMobile ? 'pointer' : 'default',
          display: !isOn ? 'flex' : 'none'
        }}
        onClick={handleMobileClick}
      >
        <div 
          className={cn(
            "flex flex-wrap items-center gap-x-2 font-light",
            isMobile ? "justify-start text-left tracking-tight" : "justify-center text-center tracking-[0.12em]"
          )}
          style={{ fontSize: isMobile ? '1.1rem' : 'clamp(1.2rem, min(1.33vw, 2.5vh), 1.8rem)' }}
        >
          <span className="opacity-50">흐릿한</span>
          <div 
            className="font-bold relative flex items-center"
            style={{ color: COLORS.HERO.OFF.ACCENT }}
          >
            <RotatingText
              texts={['아이디어를', '생각을', '확신을', '방향을']}
              mainClassName="justify-start inline-flex"
              staggerDuration={0.04}
              rotationInterval={3000}
            />
          </div>
        </div>
        <div
          className={cn(
            "font-semibold",
            isMobile ? "text-left tracking-tighter" : "text-center w-full tracking-[0.05em]"
          )}
          style={{ fontSize: isMobile ? '1.62rem' : 'clamp(2rem, min(2.77vw, 4vh), 3.2rem)' }}
        >
          작동하는 브랜드로.
        </div>
      </div>

      {/* --- ON MODE SLOGAN --- */}
      <div
        ref={onSloganRef}
        className="flex items-center relative"
        style={{ display: isOn ? 'flex' : 'none' }}
      >
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
                  className="text-[1.3rem] tablet-p:text-[1.5rem] tablet:text-[clamp(2rem,min(2.15vw,3.5vh),3rem)] font-bold tracking-tight pointer-events-none select-none whitespace-nowrap leading-none"
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
                  className="text-lg opacity-20 select-none mx-0.5"
                  style={{ color: COLORS.TEXT.DARK }}
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

export default HeroSlogan;
