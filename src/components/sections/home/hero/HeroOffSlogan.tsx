'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  // 모드 전환 시 상태 초기화
  React.useEffect(() => {
    // 상태 초기화 로직이 필요 없다면 제거 가능하나 일단 구조 유지
  }, [isVisible]);

  const handleMobileClick = () => {
    if (!isMobile || !isVisible) return;
    // 즉각적인 시각적 피드백 후 토글 실행
    setTimeout(() => {
      onToggle?.();
    }, 150);
  };

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          key="hero-off-slogan-content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex flex-col items-start justify-center text-left gap-1 md:gap-2 pointer-events-auto"
          style={{
            fontFamily: 'var(--font-suit), sans-serif',
            color: COLORS.TEXT.LIGHT,
            maxWidth: isMobile ? '100%' : '600px',
            cursor: isMobile ? 'pointer' : 'default'
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
              style={{ color: COLORS.BRAND.GOLD }}
            >
              <RotatingText
                texts={['아이디어를', '생각을', '확신을', '방향을']}
                mainClassName="justify-start inline-flex"
                staggerDuration={0.04}
                rotationInterval={3000}
                animatePresenceMode="wait"
                disableLayout={isMobile} // 모바일에서만 대각선 궤적 방지를 위해 레이아웃 애니메이션 비활성화
              />
            </div>
          </div>

          {/* 두 번째 줄: 작동하는 브랜드로. (항상 선명) */}
          <motion.div
            className="font-semibold tracking-tighter"
            style={{ fontSize: isMobile ? '1.6rem' : '2.4rem' }}
          >
            작동하는 브랜드로.
          </motion.div>

        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default HeroOffSlogan;
