'use client';

import React from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { COLORS } from '@/constants/colors';
import { cn } from '@/lib/utils';



interface HeroOffCtaProps {
  isVisible: boolean;
  isToggleHovered: boolean;
  isMobile?: boolean;
  isMobileView?: boolean;
  isTransitioning?: boolean;
  onToggle?: () => void;
}

/**
 * HeroOffCta — OFF 모드 CTA
 *
 * 스위치를 켜고, 브랜드를 켜세요
 */
const HeroOffCta: React.FC<HeroOffCtaProps> = ({
  isVisible,
  isToggleHovered,
  isMobile = false,
  isMobileView = false,
  isTransitioning = false,
  onToggle
}) => {
  const [isClearing, setIsClearing] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const glowRef = React.useRef<HTMLDivElement>(null);
  const textRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!isVisible) setIsClearing(false);
  }, [isVisible]);

  // [V16.3] 호버 및 상태 변화에 따른 블러/불투명도 조절
  useGSAP(() => {
    if (!textRef.current) return;

    gsap.to(textRef.current, {
      filter: 'blur(0px)',
      opacity: 1,
      duration: 0.6,
      ease: 'power3.out'
    });
  }, { dependencies: [isToggleHovered, isClearing, isTransitioning, isMobile], scope: containerRef });


  if (!isVisible) return null;

  return (
    <div 
      ref={containerRef}
      className="relative pointer-events-auto"
    >
      <div
        ref={textRef}
        className="flex flex-col items-center"
        style={{ filter: 'blur(0px)', opacity: 1 }}
      >
        <div
          className={cn(
            'text-center transition-all duration-700 leading-[0.8]',
            'font-[family-name:var(--font-suit)] tracking-normal flex flex-col items-center'
          )}
          style={{
            color: 'inherit',
            textShadow: '0 0 120px rgba(240, 235, 227, 0.15)',
            display: 'block'
          }}
        >
          <div className="relative flex flex-col items-center">
            {/* Line 1: Turn on the Switch */}
            <span 
              className={cn(
                'whitespace-nowrap transition-all duration-700 font-[family-name:var(--font-suit)]',
                'text-[2.2rem] tablet-p:text-[4rem] tablet:text-[4.5rem] desktop-wide:text-[5.5rem] desktop-cap:text-[6rem]',
                'tracking-[0.2em] tablet-p:tracking-[0.15em] tablet:tracking-[0.12em] desktop-wide:tracking-normal'
              )}
              style={{ 
                transform: isMobile ? 'translateX(-12vw) scaleX(0.8)' : (isMobileView ? 'translateX(-10vw) scaleX(0.75)' : 'translateX(-8vw) scaleX(0.7)'),
                color: (isToggleHovered || isClearing || isTransitioning)
                  ? COLORS.TEXT.LIGHT
                  : 'rgba(240, 235, 227, 0.15)',
                textShadow: (isToggleHovered || isClearing || isTransitioning)
                  ? '0 0 15px rgba(240, 235, 227, 0.4)'
                  : 'none',
              }}
            >
              스위치를 켜고,
            </span>
            
            {/* Line 2: Switch on the Brand */}
            <span 
              className={cn(
                'whitespace-nowrap transition-all duration-700 font-[family-name:var(--font-suit)]',
                'text-[2.8rem] tablet-p:text-[5rem] tablet:text-[5.5rem] desktop-wide:text-[7rem] desktop-cap:text-[8rem]',
                'mt-[-0.2vh] tablet-p:mt-[-0.1vh] tablet:mt-[-0.5vh] desktop-wide:mt-[-1vh]'
              )}
              style={{ 
                transform: isMobile ? 'translateX(2vw) scaleX(0.8)' : (isMobileView ? 'translateX(1vw) scaleX(0.75)' : 'translateX(1vw) scaleX(0.7)'),
                color: COLORS.HERO.OFF.ACCENT,
                textShadow: `0 0 20px ${COLORS.HERO.OFF.ACCENT}40`,
              }}
            >
              브랜드를 켜세요.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroOffCta;
