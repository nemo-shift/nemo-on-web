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
  isTablet?: boolean;
  isTransitioning?: boolean;
  onToggle?: () => void;
}

const HeroOffCta: React.FC<HeroOffCtaProps> = ({
  isVisible,
  isToggleHovered,
  isMobile = false,
  isTablet = false,
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
            "text-center transition-all duration-700 leading-[0.8]",
            isMobile 
              ? "font-[family-name:var(--font-suit)] tracking-normal flex flex-col items-center" 
              : "font-[family-name:var(--font-suit)] tracking-normal flex flex-col items-center"
          )}
          style={{
            color: 'inherit',
            textShadow: `0 0 120px rgba(240, 235, 227, 0.15)`,
            display: 'block'
          }}
        >
          <div className="relative flex flex-col items-center">
            {/* Line 1: Turn on the Switch */}
            <span 
              className="whitespace-nowrap transition-all duration-700 font-[family-name:var(--font-suit)]"
              style={{ 
                fontSize: isMobile ? '2.4rem' : isTablet ? '5.2rem' : '6rem', 
                transform: isMobile ? 'translateX(-12vw) scaleX(0.8)' : isTablet ? 'translateX(-10vw) scaleX(0.75)' : 'translateX(-8vw) scaleX(0.7)',
                color: (isToggleHovered || isClearing || isTransitioning)
                  ? '#FFFFFF'
                  : 'rgba(240, 235, 227, 0.15)',
                textShadow: (isToggleHovered || isClearing || isTransitioning)
                  ? '0 0 15px rgba(255, 255, 255, 0.4)'
                  : 'none',
                letterSpacing: isMobile ? '0.2em' : isTablet ? '0.15em' : 'normal'
              }}
            >
              스위치를 켜고,
            </span>
            
            {/* Line 2: Switch on the Brand */}
            {/* [V11.8] Mobile/Tablet/PC 3단 독립 수치 관리 체계 구축 */}
            <span 
              className="whitespace-nowrap transition-all duration-700 font-[family-name:var(--font-suit)]"
              style={{ 
                fontSize: isMobile ? '3.0rem' : isTablet ? '6rem' : '7.5rem', 
                transform: isMobile ? 'translateX(2vw) scaleX(0.8)' : isTablet ? 'translateX(1vw) scaleX(0.75)' : 'translateX(1vw) scaleX(0.7)',
                marginTop: isMobile ? '-0.2vh' : isTablet ? '-0.1vh' : '-1vh',
                color: (isToggleHovered || isClearing || isTransitioning || isMobile || isTablet)
                  ? COLORS.HERO.OFF.ACCENT
                  : 'rgba(240, 235, 227, 0.25)',
                textShadow: (isToggleHovered || isClearing || isTransitioning || isMobile || isTablet)
                  ? `0 0 20px ${COLORS.HERO.OFF.ACCENT}40` // 0.25 alpha approx
                  : 'none'
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
