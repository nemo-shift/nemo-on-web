'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useScrollDirection } from '@/hooks';
import { cn } from '@/lib';

type ScrollAwareContainerProps = {
  /** 내부 컨텐츠 [Required] */
  children: React.ReactNode;
  /** 헤더 표시 스크롤 임계값(px) [Optional, 기본값: 100] */
  threshold?: number;
  /** 추가 클래스 [Optional] */
  className?: string;
};

/**
 * 스크롤 방향에 따라 컨텐츠를 숨기거나 표시하는 컨테이너
 * 스크롤 다운 시 숨김, 업 시 표시
 *
 * Example usage:
 * <ScrollAwareContainer>
 *   <Header />
 * </ScrollAwareContainer>
 */
export default function ScrollAwareContainer({
  children,
  threshold = 100,
  className,
}: ScrollAwareContainerProps): React.ReactElement {
  const { scrollDirection } = useScrollDirection(threshold);
  const isHidden = scrollDirection === 'down';

  return (
    <div
      className={cn(
        'sticky top-0 z-[1100] w-full overflow-hidden',
        className
      )}
    >
      <motion.div
        variants={{
          visible: { y: 0 },
          hidden: { y: '-100%' },
        }}
        animate={isHidden ? 'hidden' : 'visible'}
        transition={{ duration: 0.35, ease: 'easeInOut' }}
      >
        {children}
      </motion.div>
    </div>
  );
}
