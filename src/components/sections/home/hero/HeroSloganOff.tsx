'use client';

import React from 'react';
import { RotatingText } from '@/components/ui';
import { cn } from '@/lib/utils';
import { COLORS } from '@/constants/colors';

type HeroSloganOffProps = object;

/**
 * HeroSloganOff 컴포넌트
 * 오프모드(OFF) 전용 슬로건 — 로테이팅 텍스트 기반의 프레이즈.
 * 흐릿한 [아이디어를, 생각을, 확신을, 방향을] 작동하는 브랜드로.
 * 온모드(ON)와 완전히 분리된 독립 컴포넌트.
 */
const HeroSloganOff: React.FC<HeroSloganOffProps> = () => {
  return (
    <div className="relative w-fit tablet-p:w-full mx-auto min-h-[120px] flex flex-col justify-start overflow-hidden">
      <div
        className="flex flex-col items-start tablet-p:items-center gap-1 tablet-p:gap-2 pointer-events-auto"
        style={{
          fontFamily: 'var(--font-suit), sans-serif',
          color: COLORS.TEXT.LIGHT,
        }}
      >
        <div 
          className={cn(
            'flex flex-wrap items-center gap-x-2 font-light justify-start text-left tablet-p:justify-center tablet-p:text-center',
            'text-[1.3rem] tablet-p:text-[2rem] tablet:text-[1.7rem] desktop-wide:text-[1.8rem] desktop-cap:text-[2rem]',
            'tracking-tight tablet-p:tracking-[0.12em]'
          )}
        >
          <span className="opacity-50">흐릿한</span>
          <div 
            className="font-bold relative flex items-center"
            style={{ color: COLORS.HERO.OFF.ACCENT }}
          >
            <RotatingText
              texts={['아이디어를', '생각을', '확신을', '방향을']}
              mainClassName={cn('justify-start inline-flex', 'tablet-p:justify-center')}
              staggerDuration={0.04}
              rotationInterval={3000}
            />
          </div>
        </div>
        <div
          className={cn(
            'font-semibold text-left tablet-p:text-center w-full',
            'text-[1.8rem] tablet-p:text-[2.8rem] tablet:text-[2.5rem] desktop-wide:text-[2.8rem] desktop-cap:text-[3rem]',
            'tracking-tighter tablet-p:tracking-[0.05em]'
          )}
        >
          작동하는 브랜드로.
        </div>
      </div>
    </div>
  );
};

export default HeroSloganOff;
