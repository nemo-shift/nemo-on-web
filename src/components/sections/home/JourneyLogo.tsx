'use client';

import React, { useRef, useImperativeHandle, forwardRef, useEffect } from 'react';
import { useScramble } from '@/hooks/useScramble';
import { NemoIcon } from '@/components/ui';
import { cn } from '@/lib';
import { LOGO_COLOR_CFG } from '@/constants/interaction';

/**
 * JourneyLogoHandle: GlobalInteractionStage에서 제어할 핸들
 */
export interface JourneyLogoHandle {
  containerEl: HTMLDivElement | null;
  /** RECTANGLE 로고 전체 */
  rectangleEl: HTMLDivElement | null;
  /** 'T' 문자를 구성하는 십자 선 (모핑용) */
  tLines: {
    h: HTMLDivElement | null;
    v: HTMLDivElement | null;
  };
  /** 한글 '네모' */
  nemoKrEl: HTMLDivElement | null;
  /** 도형 세트 */
  shapesEl: HTMLDivElement | null;
  /** ON / OFF 텍스트 */
  statusEl: HTMLDivElement | null;
}

interface JourneyLogoProps {
  isOn: boolean;
  progress?: number;
  isTransitioning?: boolean;
}

/**
 * [V4.3 Foundation] 로고 8단계 여정 (실용적 DOM 복구 버전)
 * 브랜드 폰트의 심미성을 유지하면서 가벼운 CSS 선으로 'T->+' 모핑을 수행합니다.
 */
const JourneyLogo = forwardRef<JourneyLogoHandle, JourneyLogoProps>(
  (_props, ref) => {
    const { progress = 0, isOn, isTransitioning } = _props;
    const containerRef = useRef<HTMLDivElement>(null);
    const nemoKrRef = useRef<HTMLDivElement>(null);
    const shapesRef = useRef<HTMLDivElement>(null);
    const statusRef = useRef<HTMLDivElement>(null);
    const rectangleRef = useRef<HTMLDivElement>(null);
    
    // T 모핑용 두 개의 선
    const tLineHRef = useRef<HTMLDivElement>(null);
    const tLineVRef = useRef<HTMLDivElement>(null);

    const { scrambledText, startScramble, setScrambledText } = useScramble();
    // [V5.4 Fix] 초기 상태를 현재 isOn에 맞게 설정하여 마운트 시 불필요한 스크램블 방지
    const prevTargetRef = useRef<string>((_props.isOn || _props.isTransitioning) ? 'ON' : 'OFF');

    // ON/OFF 스크램블 효과 (V4.3: 전환 시작 전 즉시 발동)
    useEffect(() => {
      const target = (isOn || isTransitioning) ? 'ON' : 'OFF';
      
      // 전환 중이거나 타겟이 달라지면 즉시 스크램블 시작
      if (prevTargetRef.current !== target || isTransitioning) {
        startScramble(target, 450); // 타격감을 위해 450ms로 설정
        prevTargetRef.current = target;
      }
    }, [isOn, isTransitioning, startScramble]);

    useImperativeHandle(ref, () => ({
      get containerEl() { return containerRef.current; },
      get nemoKrEl() { return nemoKrRef.current; },
      get shapesEl() { return shapesRef.current; },
      get statusEl() { return statusRef.current; },
      get rectangleEl() { return rectangleRef.current; },
      tLines: {
        get h() { return tLineHRef.current; },
        get v() { return tLineVRef.current; }
      }
    }));

    const activeLogoColors = isOn ? LOGO_COLOR_CFG.ON : LOGO_COLOR_CFG.OFF;
    const colorStyle = { color: 'var(--header-fg)' };
    const statusColorStyle = {
      color: activeLogoColors.TEXT,
      transition: 'color 0.7s ease'
    };

    return (
      <div
        ref={containerRef}
        className="journey-logo flex items-baseline select-none gap-4 tablet-p:gap-6 tablet:gap-[clamp(40px,calc(-4px+4.5vw),60px)] desktop-wide:gap-[clamp(60px,calc(30px+2.1vw),70px)] desktop-cap:gap-[70px] h-[clamp(75px,calc(71px+1.2vw),85px)] tablet-p:h-[clamp(85px,calc(-200px+38.3vw),200px)] tablet:h-[clamp(200px,calc(111px+9vw),240px)] desktop-wide:h-[clamp(240px,calc(120px+8.35vw),280px)] desktop-cap:h-[280px]"
        style={{ willChange: 'transform' }}
      >
        {/* 1. 한글 네모 (Layer A) */}
        <div 
          ref={nemoKrRef} 
          className="font-esamanru font-bold tablet:font-light text-[clamp(55px,calc(60px+1.5vw),80px)] tablet-p:text-[clamp(130px,calc(-170px+32vw),250px)] tablet:text-[clamp(150px,calc(75px+7.5vw),185px)] desktop-wide:text-[clamp(185px,calc(82px+7.2vw),220px)] desktop-cap:text-[220px] tracking-normal"
          style={colorStyle}
        >
          네모
        </div>

        {/* 2. 시그니처 도형 (NemoIcon) - [V11 Architecture Refactoring] 텍스트 크기 비례 em 위치 제어 및 클래스 기반 트랜스폼 통합 */}
        {/* 2. 시그니처 도형 (NemoIcon) - [V11 Native CSS Engine] 테일윈드 파서 한계 극복을 위한 CSS 통합 제어 */}
        <div 
          ref={shapesRef}
          className="flex items-center justify-center child-nemo-logo-engine"
          style={{ 
            willChange: 'transform'
          }}
        >
          <NemoIcon 
            className={cn(
              "opacity-80 nemo-logo-engine"
            )}
            triangleColor={activeLogoColors.TRIANGLE}
            circleColor={activeLogoColors.CIRCLE}
            triangleStyle={{ animation: 'pulseAbt 2.5s ease-in-out infinite' }}
            circleStyle={{ animation: 'pulseAbt 2.5s ease-in-out 0.5s infinite' }}
            triangleClassName="border-l-[0.35em] border-r-[0.35em] border-b-[0.55em] transform -translate-y-[0.05em]"
            circleClassName="w-[0.55em] h-[0.55em] border-[0.12em]"
            gapClassName={cn(
              "gap-[0.15em]",
              "tablet-p:gap-[0.25em]",
              "tablet:gap-[0.4em]",
              "desktop-wide:gap-[0.35em]",
              "desktop-cap:gap-[0.65em]"
            )}
          />
        </div>

        {/* 3. ON/OFF (Scramble) */}
        <div 
          ref={statusRef} 
          className="font-gmarket font-bold tablet:font-light text-[clamp(62px,calc(48px+1.2vw),82px)] tablet-p:text-[clamp(132px,calc(-180px+32vw),250px)] tablet:text-[clamp(140px,calc(68px+7.5vw),175px)] desktop-wide:text-[clamp(175px,calc(75px+7.2vw),210px)] desktop-cap:text-[210px] tracking-tight min-w-[clamp(65px,calc(56px+2.5vw),90px)] tablet-p:min-w-[clamp(90px,calc(-20px+15vw),135px)] tablet:min-w-[clamp(170px,calc(8vw+10vw),250px)] desktop-wide:min-w-[clamp(250px,calc(-25px+19vw),380px)] desktop-cap:min-w-[380px]"
          style={statusColorStyle}
        >
          {scrambledText || (isOn ? 'ON' : 'OFF')}
        </div>

        {/* 4. RECTANGLE (Layer B - Hidden initially) */}
        <div 
          ref={rectangleRef} 
          className="absolute inset-0 flex items-baseline font-bebas text-[28px] tracking-widest opacity-0 pointer-events-none"
          style={colorStyle}
        >
          <span>REC</span>
          {/* T Morphing Point (Using CSS Lines for Practicality) */}
          <div className="relative w-[90px] h-[120px] mx-1 tablet-p:mx-2"> // [v26.98 UI Detail] 고해상도 모핑 포인트 확장
            {/* 가로 선 (Horizontal Bar) */}
            <div 
              ref={tLineHRef}
              className="absolute left-0 top-[20px] w-full h-[18px] bg-current rounded-sm"
              style={{ transition: 'top 0.3s ease' }}
            />
            {/* 세로 선 (Vertical Bar) */}
            <div 
              ref={tLineVRef}
              className="absolute left-1/2 -translateX-1/2 top-[20px] w-[18px] h-[85%] bg-current rounded-sm"
              style={{ transform: 'translateX(-50%)' }}
            />
          </div>
          <span>ANGLE</span>
        </div>
      </div>
    );
  },
);

export default JourneyLogo;
