'use client';

import React from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { RotatingText } from '@/components/ui';
import { COLORS } from '@/constants/colors';

interface HeroOffSloganProps {
  isVisible: boolean;
  isToggleHovered?: boolean;
  isMobile?: boolean; 
  isTransitioning?: boolean;
  onToggle?: () => void; 
}

/**
 * HeroOffSlogan 컴포넌트 (v6)
 * 
 * - 에디토리얼 그리드: 좌측 정렬 기반의 모던한 레이아웃.
 * - 슬로건 뭉치: 항상 선명하게 노출.
 * - "브랜드를 켜다": 스위치 호버 시에만 선명해지는 인터랙티브 블러.
 * - 모바일 전용: 힌트 애니메이션 및 클릭 시 ON 모드 전환 기능.
 */
const HeroOffSlogan: React.FC<HeroOffSloganProps> = ({ 
  isVisible,
  onToggle,
  isMobile = false,
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);

  // [V16.3] GSAP 기반 등장 애니메이션
  useGSAP(() => {
    if (isVisible) {
      gsap.fromTo(containerRef.current,
        { opacity: 0, scale: 0.98 },
        { opacity: 1, scale: 1, duration: 0.5, ease: 'power2.out' }
      );
    } else {
      gsap.to(containerRef.current, { opacity: 0, duration: 0.3, ease: 'power2.in' });
    }
  }, { dependencies: [isVisible], scope: containerRef });

  const handleMobileClick = () => {
    if (!isMobile || !isVisible) return;
    // 즉각적인 시각적 피드백 후 토글 실행
    setTimeout(() => {
      onToggle?.();
    }, 150);
  };

  if (!isVisible && !containerRef.current) return null;

  return (
    <div
      ref={containerRef}
      className="flex flex-col items-start justify-center text-left gap-1 md:gap-2 pointer-events-auto"
      style={{
        fontFamily: 'var(--font-suit), sans-serif',
        color: COLORS.TEXT.LIGHT,
        maxWidth: isMobile ? '100%' : '600px',
        cursor: isMobile ? 'pointer' : 'default',
        opacity: isVisible ? 1 : 0,
      }}
      onClick={handleMobileClick}
    >
      {/* 첫 번째 줄: 흐릿한 [Rotating Text] (항상 선명) */}
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
          />
        </div>
      </div>

      {/* 두 번째 줄: 작동하는 브랜드로. (항상 선명) */}
      <div
        className="font-semibold tracking-tighter"
        style={{ fontSize: isMobile ? '1.6rem' : '2.4rem' }}
      >
        작동하는 브랜드로.
      </div>

    </div>
  );
};

export default HeroOffSlogan;
