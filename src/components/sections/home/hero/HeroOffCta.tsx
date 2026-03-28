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
  isTransitioning?: boolean;
  onToggle?: () => void;
}

const HeroOffCta: React.FC<HeroOffCtaProps> = ({
  isVisible,
  isToggleHovered,
  isMobile = false,
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

  // [V16.3] 모바일 전용 무한 펄스 글로우
  useGSAP(() => {
    if (!isMobile || isClearing || !glowRef.current) return;

    gsap.to(glowRef.current, {
      scale: 1.8,
      opacity: 0.4,
      duration: 2,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    });
  }, { dependencies: [isMobile, isClearing], scope: containerRef });

  // [V16.3] 호버 및 상태 변화에 따른 블러/불투명도 조절
  useGSAP(() => {
    if (!textRef.current) return;

    // [V26.96] PC/Mobile 모두 상시 노출로 변경 (UX 개선)
    const shouldShow = true;
    
    gsap.to(textRef.current, {
      filter: 'blur(0px)',
      opacity: 1,
      duration: 0.6,
      ease: 'power3.out',
      delay: (isMobile && !isToggleHovered && !isClearing) ? 0.8 : 0
    });
  }, { dependencies: [isToggleHovered, isClearing, isTransitioning, isMobile], scope: containerRef });

  const handleMobileClick = () => {
    if (!isMobile || !isVisible) return;
    setIsClearing(true);
    setTimeout(() => {
      onToggle?.();
    }, 150);
  };

  if (!isVisible) return null;

  return (
    <div 
      ref={containerRef}
      className="relative pointer-events-auto"
      onClick={handleMobileClick}
      style={{ cursor: isMobile ? 'pointer' : 'default' }}
    >
      {/* [v25] 모바일 전용 Luminous Pulse Glow */}
      {isMobile && !isClearing && (
        <div
          ref={glowRef}
          className="absolute inset-0 blur-3xl rounded-full"
          style={{
            background: COLORS.HERO.OFF.ACCENT,
            zIndex: -1,
            width: '200px',
            height: '100px',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            opacity: 0.1
          }}
        />
      )}

      <div
        ref={textRef}
        className="flex flex-col items-center"
        style={{ filter: 'blur(16px)', opacity: 0.25 }}
      >
        <div
          className={cn(
            "text-center transition-all duration-700 leading-[0.8]",
            isMobile 
              ? "font-medium tracking-[0.4em] md:tracking-[0.6em] uppercase font-sans text-[0.95rem]" 
              : "font-[family-name:var(--font-suit)] tracking-normal flex flex-col items-center"
          )}
          style={{
            color: (isToggleHovered || isClearing || isTransitioning) 
              ? COLORS.HERO.OFF.ACCENT 
              : isMobile ? COLORS.TEXT.LIGHT : 'rgba(240, 235, 227, 0.32)',
            textShadow: isMobile 
              ? `0 0 30px ${COLORS.HERO.OFF.ACCENT}66` 
              : `0 0 120px rgba(240, 235, 227, 0.25)`,
            display: 'block'
          }}
        >
          {isMobile ? (
            "브랜드를켜다"
          ) : (
            <div className="relative flex flex-col items-center">
              {/* Line 1: Turn on the Switch, [Pivot to right-ish center] */}
              <span 
                className="whitespace-nowrap"
                style={{ 
                  fontSize: '10rem', 
                  transform: 'translateX(-17vw) scaleX(0.7) scaleY(1)' 
                }}
              >
                스위치를 켜고,
              </span>
              
              {/* Line 2: Switch on the Brand. [Pivot from left-ish center] */}
              <span 
                className="whitespace-nowrap"
                style={{ 
                  fontSize: '10rem', 
                  transform: 'translateX(17vw) scaleX(0.7) scaleY(1)',
                  marginTop: '-3vh' // 획이 맞물리도록 위로 당김
                }}
              >
                브랜드를 켜세요.
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HeroOffCta;
