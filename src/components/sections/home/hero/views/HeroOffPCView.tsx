'use client';

import React from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import HeroSloganOff from '../HeroSloganOff';
import HeroToggle from '../HeroToggle';
import HeroOffCta from '../HeroOffCta';

type HeroOffPCViewProps = {
  isOn: boolean;
  isTransitioning: boolean;
  isToggleHovered: boolean;
  setIsToggleHovered: (val: boolean) => void;
  handleToggle: () => void;
};

/**
 * [V11.31] HeroOffPCView
 * 오프모드 전용 UI 레이어 (물리적 격리 레이어)
 * 오직 오프모드(OFF) 상태일 때만 DOM에 존재하며, 온모드 진입 시 즉시 Unmount됨.
 */
export default function HeroOffPCView({
  isOn,
  isTransitioning,
  isToggleHovered,
  setIsToggleHovered,
  handleToggle,
}: HeroOffPCViewProps) {

  // [V11.1 Fluid Entry] - 중앙 집중형 스택의 시네마틱 시차 등장
  useGSAP(() => {
    // 이미 온모드라면 정적 등장 로직은 타지 않음 (방어 로직)
    if (isOn) return;

    const tl = gsap.timeline({ delay: 0.5 });
    
    // 1. 배경 아우라 먼저 슬며시 등장
    tl.to("#hero-central-aura", {
      opacity: 1,
      duration: 1.5,
      ease: "sine.inOut"
    }, 0);

    // 2. 중앙 액션 그룹 -> 하단 메시지 레이어 순차 등장
    tl.fromTo([
      "#hero-central-action-group",
      "#hero-bottom-message-layer"
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
      ease: "power3.out"
    }, 0.3);

  }, { dependencies: [isOn] });

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center z-50 pointer-events-none">
      {/* [V11.1 Luminous Aura] - 중앙 스택을 감싸는 신비로운 광배 */}
      <div 
        id="hero-central-aura"
        className="absolute pointer-events-none opacity-0"
        style={{
          width: '100vw',
          height: '80vh',
          background: `radial-gradient(circle at center, rgba(240, 235, 227, 0.04) 0%, rgba(240, 235, 227, 0.01) 40%, transparent 75%)`,
          transform: 'translateY(15vh)',
          filter: 'blur(60px)',
          zIndex: -1
        }}
      />

      {/* [V11.4 3-Tier Layering] - 3단계 독립 레이어링 */}
      <>
        {/* 1. 중앙 액션 그룹 (로테이팅 프레이즈 + 토글) - 화면 정중앙 45% 정박 */}
        <div 
          id="hero-central-action-group"
          className="absolute flex flex-col items-center gap-[4vh] pointer-events-auto opacity-0"
          style={{ 
            top: '45%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            marginTop: '0vh' 
          }}
          onMouseEnter={() => setIsToggleHovered(true)}
          onMouseLeave={() => setIsToggleHovered(false)}
        >
          {/* [다크모드 로테이팅 프레이즈] */}
          <HeroSloganOff />
          
          {/* [토글 버튼] */}
          <div className="relative z-20">
            <HeroToggle
              isOn={isOn}
              onToggle={handleToggle}
              isTransitioning={isTransitioning}
            />
          </div>
        </div>

        {/* 2. 하단 베이스라인 레이어 (영어 슬로건) - 화면 하단 -20vh 정박 */}
        <div 
          id="hero-bottom-message-layer"
          className="absolute flex flex-col items-center pointer-events-auto opacity-0"
          style={{ 
            bottom: '-20vh', 
            left: '50%', 
            transform: 'translateX(-50%)'
          }}
          onMouseEnter={() => setIsToggleHovered(true)}
          onMouseLeave={() => setIsToggleHovered(false)}
        >
          <HeroOffCta 
            isVisible={!isOn} 
            isToggleHovered={isToggleHovered}
            isTransitioning={isTransitioning}
            onToggle={handleToggle}
          />
        </div>
      </>
    </div>
  );
}
