'use client';

import React from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import HeroSloganOff from '../HeroSloganOff';
import HeroToggle from '../HeroToggle';
import HeroOffCta from '../HeroOffCta';
import { INTERACTION_Z_INDEX } from '@/constants/interaction';

type HeroOffTabletViewProps = {
  isOn: boolean;
  isTransitioning: boolean;
  isToggleHovered: boolean;
  setIsToggleHovered: (val: boolean) => void;
  handleToggle: () => void;
};

/**
 * [V11.31] HeroOffTabletView
 * 태블릿세로모드 전용 오프모드 UI 레이어
 */
export default function HeroOffTabletView({
  isOn,
  isTransitioning,
  isToggleHovered,
  setIsToggleHovered,
  handleToggle,
}: HeroOffTabletViewProps) {

  // [V11.6 Tablet Entry] - 태블릿 시네마틱 입차 애니메이션
  useGSAP(() => {
    if (isOn) return;

    const tl = gsap.timeline({ delay: 0.4 });
    
    tl.fromTo([
      '#hero-tablet-central-action-group',
      '#hero-tablet-bottom-message-layer'
    ], 
    { 
      opacity: 0, 
      y: -15 
    },
    {
      opacity: 1,
      y: 0,
      duration: 1.2,
      stagger: 0.3,
      ease: 'power3.out'
    }, 0.2);

  }, { dependencies: [isOn] });

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
      {/* 1. 중앙 액션 그룹 (로테이팅 프레이즈 + 토글) */}
      <div 
        id="hero-tablet-central-action-group"
        className="absolute flex flex-col items-center gap-[4vh] pointer-events-auto opacity-0"
        style={{ 
          top: '65%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '100%',
          padding: '0 40px',
          zIndex: INTERACTION_Z_INDEX.Z_CONTENT
        }}
        onMouseEnter={() => setIsToggleHovered(true)}
        onMouseLeave={() => setIsToggleHovered(false)}
      >
        <HeroSloganOff />
        
        <div 
          className="relative"
          style={{ zIndex: INTERACTION_Z_INDEX.Z_CONTENT, marginTop: '-1vh' }}
        >
          <HeroToggle
            isOn={isOn}
            onToggle={handleToggle}
            isTransitioning={isTransitioning}
          />
        </div>
      </div>

      {/* 2. 하단 메시지 레이어 */}
      <div 
        id="hero-tablet-bottom-message-layer"
        className="absolute flex flex-col items-center pointer-events-auto opacity-0"
        style={{ 
          bottom: '-30vh', 
          left: '50%', 
          transform: 'translateX(-50%)'
        }}
      >
        <HeroOffCta 
          isVisible={true} 
          isToggleHovered={isToggleHovered}
          isMobileView={true}
          isTransitioning={isTransitioning}
          onToggle={handleToggle}
        />
      </div>
    </div>
  );
}
