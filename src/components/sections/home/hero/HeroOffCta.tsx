'use client';

import React from 'react';
import { motion } from 'framer-motion';
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

  React.useEffect(() => {
    if (!isVisible) setIsClearing(false);
  }, [isVisible]);

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
      className="relative pointer-events-auto"
      onClick={handleMobileClick}
      style={{ cursor: isMobile ? 'pointer' : 'default' }}
    >
      {/* [v25] 모바일 전용 Luminous Pulse Glow */}
      {isMobile && !isClearing && (
        <motion.div
          className="absolute inset-0 blur-3xl rounded-full"
          animate={{
            scale: [1, 1.8, 1],
            opacity: [0.1, 0.4, 0.1],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          style={{
            background: COLORS.HERO.OFF.ACCENT,
            zIndex: -1,
            width: '200px',
            height: '100px',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)'
          }}
        />
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={(isMobile && !isTransitioning && !isClearing) ? {
          filter: 'blur(0px)',
          opacity: 1,
        } : {
          filter: (isToggleHovered || isClearing) ? 'blur(0px)' : 'blur(15px)',
          opacity: (isToggleHovered || isClearing) ? 1 : 0.1,
        }}
        transition={{
          duration: 0.6,
          ease: 'easeOut',
          delay: isMobile ? 0.8 : 0 // [v25.33] PC에서는 호버 시 즉각 반응하도록 딜레이 제거
        }}
        className="flex flex-col items-center"
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
      </motion.div>
    </div>
  );
};

export default HeroOffCta;
