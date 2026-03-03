import React from 'react';
import { motion } from 'framer-motion';
import { Box } from '@mui/material';
import useScrollDirection from '../../../hooks/useScrollDirection';

/**
 * ScrollAwareContainer 컴포넌트
 * 스크롤 방향에 따라 컨텐츠를 숨기거나 표시합니다.
 * 
 * Props:
 * @param {React.ReactNode} children - 내부에 표시될 컨텐츠 [Required]
 * @param {number} threshold - 헤더를 항상 표시할 스크롤 임계값 (px) [Optional, 기본값: 100]
 * @param {object} sx - 가장 바깥쪽 Wrapper Box에 적용할 추가 스타일 [Optional, 기본값: {}]
 *
 * Example usage:
 * <ScrollAwareContainer>
 *   <YourHeaderContent />
 * </ScrollAwareContainer>
 */
function ScrollAwareContainer({ children, threshold = 100, sx = {} }) {
  const { scrollDirection } = useScrollDirection(threshold);
  const hidden = scrollDirection === 'down';

  return (
    // Wrapper Box 추가
    <Box
      sx={{
        position: 'sticky', // 위치 고정은 Wrapper에서 담당
        top: 0,
        zIndex: 1100, 
        width: '100%',
        overflow: 'hidden', // 숨겨진 콘텐츠가 보이지 않도록
        ...sx, 
      }}
    >
      {/* 실제 움직이는 컨테이너 */}
      <Box
        component={motion.div}
        variants={{
          visible: { y: 0 },
          hidden: { y: '-100%' },
        }}
        animate={hidden ? 'hidden' : 'visible'}
        transition={{ duration: 0.35, ease: 'easeInOut' }}
        // sx prop 제거 (Wrapper로 이동)
      >
        {children}
      </Box>
    </Box>
  );
}

export default ScrollAwareContainer; 