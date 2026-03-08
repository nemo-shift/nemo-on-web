import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { COLORS } from '@/constants/colors';

interface HeroTrueFocusSloganProps {
  isOn: boolean;
  sentence?: string;
  blurAmount?: number;
  animationDuration?: number;
  pauseBetweenAnimations?: number;
}

const HeroTrueFocusSlogan: React.FC<HeroTrueFocusSloganProps> = ({
  isOn,
  sentence = '불안을 끄고, 기준을 켭니다',
  blurAmount = 4,
  animationDuration = 0.6,
  pauseBetweenAnimations = 2,
}) => {
  // 문장을 쉼표로 나누고 공백 제거
  const segments = sentence.split(',').map(s => s.trim());
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // currentIndex 자동 전환 타이머
  useEffect(() => {
    if (!isOn) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % segments.length);
    }, (animationDuration + pauseBetweenAnimations) * 1000);
    return () => clearInterval(interval);
  }, [isOn, animationDuration, pauseBetweenAnimations, segments.length]);

  return (
    <div className="relative inline-flex items-center justify-start py-1 overflow-visible min-h-fit">
      <AnimatePresence mode="wait">
        {isOn && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center"
            ref={containerRef}
          >
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
                        color: isOn ? COLORS.TEXT.DARK : COLORS.TEXT.LIGHT,
                      }}
                    >
                      {segment}
                    </motion.span>

                    {/* layoutId 기반으로 정확한 위치에 자동 동기화되는 포커스 박스 */}
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
                          <div 
                            className="absolute -top-[1.5px] -left-[1.5px] w-2.5 h-2.5 border-t-2 border-l-2" 
                            style={{ borderColor: COLORS.BRAND.GOLD }}
                          />
                          <div 
                            className="absolute -top-[1.5px] -right-[1.5px] w-2.5 h-2.5 border-t-2 border-r-2" 
                            style={{ borderColor: COLORS.BRAND.GOLD }}
                          />
                          <div 
                            className="absolute -bottom-[1.5px] -left-[1.5px] w-2.5 h-2.5 border-b-2 border-l-2" 
                            style={{ borderColor: COLORS.BRAND.GOLD }}
                          />
                          <div 
                            className="absolute -bottom-[1.5px] -right-[1.5px] w-2.5 h-2.5 border-b-2 border-r-2" 
                            style={{ borderColor: COLORS.BRAND.GOLD }}
                          />
                        </div>
                      </motion.div>
                    )}
                  </div>
                  
                  {index < segments.length - 1 && (
                    <span 
                      className="text-lg opacity-20 select-none mx-0.5"
                      style={{ color: isOn ? COLORS.TEXT.DARK : COLORS.TEXT.LIGHT }}
                    >
                      ,
                    </span>
                  )}
                </div>
              );
            })}

            {/* 슬로건 하단 데코레이티브 라인 */}
            <motion.div
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 0.5 }}
              transition={{ delay: 0.8, duration: 0.8, ease: 'circOut' }}
              className="absolute -bottom-1.5 left-[0.5rem] right-[0.5rem] h-[1px]"
              style={{ 
                background: `linear-gradient(90deg, transparent 0%, ${isOn ? COLORS.BRAND.TEAL : COLORS.BRAND.GOLD} 40%, ${isOn ? COLORS.BRAND.TEAL : COLORS.BRAND.GOLD} 100%)`,
                transformOrigin: 'left',
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HeroTrueFocusSlogan;
