'use client';

import React from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import HeroSloganOff from '../HeroSloganOff';
import HeroToggle from '../HeroToggle';
import HeroOffCta from '../HeroOffCta';

type HeroOffMobileViewProps = {
  isOn: boolean;
  isTransitioning: boolean;
  handleToggle: () => void;
};

/**
 * [V11.31] HeroOffMobileView
 * 모바일 전용 오프모드 UI 레이어
 */
export default function HeroOffMobileView({
  isOn,
  handleToggle,
  isTransitioning,
}: HeroOffMobileViewProps) {

  // [V11.17 Mobile Entry] - 모바일 전용 시네마틱 등장
  useGSAP(() => {
    if (isOn) return;

    const tl = gsap.timeline({ delay: 0.3 });
    
    tl.fromTo([
      "#hero-mobile-central-action-group",
      "#hero-mobile-bottom-message-layer"
    ], 
    { 
      opacity: 0, 
      y: -10 
    },
    {
      opacity: 1,
      y: 0,
      duration: 1.0,
      stagger: 0.2,
      ease: "power3.out"
    }, 0.2);

  }, { dependencies: [isOn] });

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
      {/* 1. 중앙 액션 그룹 (로테이팅 프레이즈 + 토글) */}
      <div 
        id="hero-mobile-central-action-group"
        className="absolute flex flex-col items-center gap-[6vh] pointer-events-auto opacity-0"
        style={{ 
          top: '55%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '100%',
          padding: '0 24px',
          zIndex: 100
        }}
      >
        <HeroSloganOff 
          isMobile={true} 
        />
        
        <div 
          className="relative z-50 flex flex-col items-center gap-4"
          style={{ marginTop: '2vh' }}
        >
          <HeroToggle
            isOn={isOn}
            onToggle={handleToggle}
            isTransitioning={isTransitioning}
            isMobile={true}
          />
        </div>
      </div>

      {/* 2. 하단 여백 기반 CTA 레이어 */}
      <div 
        id="hero-mobile-bottom-message-layer"
        className="absolute flex flex-col items-center pointer-events-auto opacity-0"
        style={{ 
          bottom: '12vh', 
          left: '50%', 
          transform: 'translateX(-50%)'
        }}
      >
        <HeroOffCta 
          isVisible={true} 
          isToggleHovered={false}
          isMobile={true}
          isTransitioning={isTransitioning}
          onToggle={handleToggle}
        />
      </div>
    </div>
  );
}
