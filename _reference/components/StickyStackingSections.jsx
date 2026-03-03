import React, { useRef, useEffect } from 'react';
import { Box } from '@mui/material';
import PropTypes from 'prop-types';

/**
 * 스크롤 시 섹션이 상단에 고정되고 다음 섹션이 위에서 덮어가는 Sticky Stacking Sections 컴포넌트
 * 
 * Props:
 * @param {React.ReactNode[]} sections - 렌더링할 섹션 목록 (배열 형태) [Required]
 * @param {string} className - 외부에서 스타일 확장용 클래스 [Optional]
 * @param {string} sectionHeight - 각 섹션의 높이 [Optional, 기본값: '100vh']
 * @param {number} zIndexBase - 초기 z-index 기준값 [Optional, 기본값: 10]
 * @param {boolean} enableMotion - Framer Motion 사용할지 여부 [Optional, 기본값: false]
 *
 * Example usage:
 * <StickyStackingSections 
 *   sections={[
 *     <Box sx={{ background: 'red' }}>섹션 1</Box>,
 *     <Box sx={{ background: 'blue' }}>섹션 2</Box>,
 *     <Box sx={{ background: 'green' }}>섹션 3</Box>
 *   ]}
 *   sectionHeight="100vh"
 *   zIndexBase={100}
 * />
 */
function StickyStackingSections({ 
  sections, 
  className, 
  sectionHeight = '100vh', 
  zIndexBase = 10,
  enableMotion = false
}) {
  const containerRef = useRef(null);
  const sectionRefs = useRef([]);

  useEffect(() => {
    // 기본적인 초기화 - Framer Motion 사용 시 필요한 설정 등
    if (enableMotion) {
      // 여기서 필요한 경우 Framer Motion 관련 설정 가능
      // 현재는 props만 받고 추후 확장 가능성 염두
      console.log('Framer Motion 활성화됨 - 추후 확장 가능');
    }
  }, [enableMotion]);

  // 좀 더 정확한 높이 계산을 위해 스크롤 공간 추가
  const totalHeight = `calc(${sections.length} * ${sectionHeight} + 50vh)`;

  return (
    <Box 
      ref={containerRef}
      className={className}
      sx={{
        position: 'relative',
        overflow: 'visible',
        height: totalHeight, // 더 정확한 높이 계산
        minHeight: totalHeight,
      }}
    >
      {sections.map((section, index) => {
        // 각 섹션의 z-index는 순서대로 설정 (마지막 섹션이 가장 위에 오도록)
        const zIndex = zIndexBase + index;
        
        return (
          <Box
            key={index}
            ref={el => sectionRefs.current[index] = el}
            sx={{
              position: 'sticky',
              top: 0,
              height: sectionHeight,
              zIndex,
              // overflow: 'hidden' 제거 - 이 속성이 컨텐츠를 잘라낼 수 있음
              width: '100%',
              '&:before': {
                // 디버깅용 섹션 번호 (필요시 제거)
                content: `"${index + 1}"`,
                position: 'absolute',
                top: '10px',
                right: '10px',
                fontSize: '16px',
                fontWeight: 'bold',
                color: 'white',
                background: 'rgba(0,0,0,0.3)',
                padding: '3px 8px',
                borderRadius: '4px',
                zIndex: 1000,
              }
            }}
          >
            {section}
          </Box>
        );
      })}
    </Box>
  );
}

StickyStackingSections.propTypes = {
  sections: PropTypes.arrayOf(PropTypes.node).isRequired,
  className: PropTypes.string,
  sectionHeight: PropTypes.string,
  zIndexBase: PropTypes.number,
  enableMotion: PropTypes.bool
};

export default StickyStackingSections; 