'use client';

import React from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { COLORS } from '@/constants/colors';

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

    const shouldShow = (isMobile && !isTransitioning && !isClearing) || isToggleHovered || isClearing;
    
    gsap.to(textRef.current, {
      filter: shouldShow ? 'blur(0px)' : 'blur(15px)',
      opacity: shouldShow ? 1 : 0.1,
      duration: 0.6,
      ease: 'power2.out',
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
        style={{ filter: 'blur(15px)', opacity: 0.1 }}
      >
        <span
          className="font-medium tracking-[0.3em] md:tracking-[0.5em] uppercase whitespace-nowrap text-center"
          style={{
            fontSize: isMobile ? '0.95rem' : '1.2rem',
            color: (isToggleHovered || isClearing || isTransitioning) ? COLORS.HERO.OFF.ACCENT : COLORS.TEXT.LIGHT,
            textShadow: isMobile ? `0 0 30px ${COLORS.HERO.OFF.ACCENT}66` : 'none',
            display: 'block'
          }}
        >
          브랜드를 켜다
        </span>
      </div>
    </div>
  );
};

export default HeroOffCta;
