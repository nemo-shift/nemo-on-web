'use client';

import React from 'react';
import { RotatingText } from '@/components/ui';
import { cn } from '@/lib/utils';
import { COLORS } from '@/constants/colors';

interface HeroSloganOffProps {
  isMobile?: boolean;
  isTablet?: boolean;
}

/**
 * HeroSloganOff 컴포넌트
 * 오프모드(OFF) 전용 슬로건 — 로테이팅 텍스트 기반의 프레이즈.
 * 흐릿한 [아이디어를, 생각을, 확신을, 방향을] 작동하는 브랜드로.
 * 온모드(ON)와 완전히 분리된 독립 컴포넌트.
 */
const HeroSloganOff: React.FC<HeroSloganOffProps> = ({
  isMobile = false,
  isTablet = false,
}) => {
  return (
    <div className="relative w-full min-h-[120px] flex flex-col justify-start overflow-hidden">
      <div
        className="flex flex-col items-center justify-center text-center gap-1 md:gap-2 pointer-events-auto"
        style={{
          fontFamily: 'var(--font-suit), sans-serif',
          color: COLORS.TEXT.LIGHT,
        }}
      >
        <div 
          className={cn(
            "flex flex-wrap items-center gap-x-2 font-light",
            isMobile ? "justify-start text-left tracking-tight" : "justify-center text-center tracking-[0.12em]"
          )}
          style={{ fontSize: isMobile ? '1.1rem' : isTablet ? '2.5rem' : 'clamp(1.4rem, min(1.7vw, 3vh), 2.1rem)' }}
        >
          <span className="opacity-50">흐릿한</span>
          <div 
            className="font-bold relative flex items-center"
            style={{ color: COLORS.HERO.OFF.ACCENT }}
          >
            <RotatingText
              texts={['아이디어를', '생각을', '확신을', '방향을']}
              mainClassName="justify-center inline-flex"
              staggerDuration={0.04}
              rotationInterval={3000}
            />
          </div>
        </div>
        <div
          className={cn(
            "font-semibold text-center w-full",
            isMobile ? "tracking-tighter" : "tracking-[0.05em]"
          )}
          style={{ fontSize: isMobile ? '1.62rem' : isTablet ? '3.5rem' : 'clamp(2rem, min(2.77vw, 4vh), 3.2rem)' }}
        >
          작동하는 브랜드로.
        </div>
      </div>
    </div>
  );
};

export default HeroSloganOff;
