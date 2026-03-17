'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotatingText } from '@/components/ui';
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

  const handleMobileClick = () => {
    if (!isMobile || isOn) return;
    setTimeout(() => {
      onToggle?.();
    }, 150);
  };

  return (
    <div className="relative w-full h-full min-h-[120px] flex flex-col justify-start">
      <AnimatePresence mode="wait">
        {!isOn ? (
          /* --- OFF MODE SLOGAN --- */
          <motion.div
            key="hero-off-slogan"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-start justify-center text-left gap-1 md:gap-2 pointer-events-auto"
            style={{
              fontFamily: 'var(--font-suit), sans-serif',
              color: COLORS.TEXT.LIGHT,
              cursor: isMobile ? 'pointer' : 'default'
            }}
            onClick={handleMobileClick}
          >
            <div 
              className="flex flex-wrap items-center justify-start gap-x-2 font-light tracking-tight"
              style={{ fontSize: isMobile ? '1.1rem' : '1.6rem' }}
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
                  animatePresenceMode="wait"
                  disableLayout={isMobile}
                />
              </div>
            </div>
            <div
              className="font-semibold tracking-tighter"
              style={{ fontSize: isMobile ? '1.6rem' : '2.4rem' }}
            >
              작동하는 브랜드로.
            </div>
          </motion.div>
        ) : (
          /* --- ON MODE SLOGAN --- */
          <motion.div
            key="hero-on-slogan"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5 }}
            className="flex items-center"
          >
            <div className="flex items-center">
              {segments.map((segment, index) => {
                const isActive = index === currentIndex;
                return (
                  <div key={index} className="flex items-center">
                    <div className="relative flex items-center justify-center px-2 py-1 min-w-fit">
                      <motion.span
                        animate={{
                          filter: isActive ? 'blur(0px)' : `blur(${blurAmount}px)`,
                          opacity: isActive ? 1 : 0.2,
                          scale: isActive ? 1 : 0.98,
                        }}
                        transition={{ duration: animationDuration, ease: 'easeInOut' }}
                        className="text-[1.3rem] md:text-[1.85rem] font-bold tracking-tight pointer-events-none select-none whitespace-nowrap leading-none"
                        style={{
                          fontFamily: 'var(--font-suit), sans-serif',
                          color: COLORS.TEXT.DARK,
                        }}
                      >
                        {segment}
                      </motion.span>

                      {isActive && (
                        <motion.div
                          layoutId="true-focus-box"
                          className="absolute inset-0 pointer-events-none z-10"
                          transition={{
                            type: 'spring',
                            stiffness: 300,
                            damping: 30,
                          }}
                        >
                          <div className="relative w-full h-full border-[1.5px] border-transparent">
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
                        </motion.div>
                      )}
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
                );
              })}
            </div>
            {/* 데코레이티브 라인 */}
            <motion.div
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 0.5 }}
              transition={{ delay: 0.8, duration: 0.8, ease: 'circOut' }}
              className="absolute -bottom-1.5 left-[0.5rem] right-[0.5rem] h-[1px]"
              style={{ 
                background: `linear-gradient(90deg, transparent 0%, ${COLORS.HERO.ON.ACCENT} 40%, ${COLORS.HERO.ON.ACCENT} 100%)`,
                transformOrigin: 'left',
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HeroSlogan;
