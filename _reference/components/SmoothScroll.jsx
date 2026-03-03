import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import useLenisScroll from '../../../hooks/useLenisScroll';

/**
 * 부드러운 스크롤 효과를 적용하는 컴포넌트
 * 
 * Props:
 * @param {React.ReactNode} children - 스크롤 컨테이너에 포함될 요소들 [Required]
 * @param {boolean} enabled - 스크롤 효과 활성화 여부 [Optional, 기본값: true]
 * @param {number} duration - 스크롤 애니메이션 지속 시간(초) [Optional, 기본값: 1.2]
 * @param {string} orientation - 스크롤 방향 ('vertical' 또는 'horizontal') [Optional, 기본값: 'vertical']
 * @param {string} gestureOrientation - 제스처 방향 [Optional, 기본값: orientation과 동일]
 * @param {boolean} smoothWheel - 마우스 휠 부드럽게 처리 [Optional, 기본값: true]
 * @param {boolean} smoothTouch - 터치 스크롤 부드럽게 처리 [Optional, 기본값: false]
 * @param {boolean} wheelMultiplier - 휠 스크롤 속도 배수 [Optional, 기본값: 1]
 * @param {string} className - 추가 CSS 클래스 [Optional]
 * @param {object} style - 추가 인라인 스타일 [Optional]
 * @param {function} onScroll - 스크롤 이벤트 핸들러 [Optional]
 * @param {boolean} integrateGSAP - GSAP와 통합 여부 [Optional, 기본값: false]
 * 
 * Example usage:
 * <SmoothScroll duration={1.5} onScroll={handleScroll}>
 *   <div>내용이 들어갑니다</div>
 * </SmoothScroll>
 */
function SmoothScroll({
  children,
  enabled = true,
  duration = 1.2,
  orientation = 'vertical',
  gestureOrientation,
  smoothWheel = true,
  smoothTouch = false,
  wheelMultiplier = 1,
  className = '',
  style = {},
  onScroll,
  integrateGSAP = false
}) {
  const containerRef = useRef(null);
  
  // Lenis 부드러운 스크롤 훅 사용
  const lenis = useLenisScroll(enabled, {
    duration,
    orientation,
    gestureOrientation,
    smoothWheel,
    smoothTouch,
    wheelMultiplier,
    integrateGSAP
  });
  
  // 스크롤 이벤트 핸들링
  useEffect(() => {
    if (!enabled || !lenis.current || !onScroll) return;
    
    const handleScroll = (e) => {
      if (onScroll) {
        onScroll(e);
      }
    };
    
    // Lenis 스크롤 이벤트 리스너 등록
    lenis.current.on('scroll', handleScroll);
    
    return () => {
      if (lenis.current) {
        lenis.current.off('scroll', handleScroll);
      }
    };
  }, [enabled, lenis, onScroll]);
  
  return (
    <div 
      ref={containerRef}
      className={`smooth-scroll-container ${className}`}
      style={{
        height: '100%',
        width: '100%',
        ...style
      }}
      data-lenis-prevent={!enabled} // Lenis 처리 제외 마커
    >
      {children}
    </div>
  );
}

SmoothScroll.propTypes = {
  children: PropTypes.node.isRequired,
  enabled: PropTypes.bool,
  duration: PropTypes.number,
  orientation: PropTypes.oneOf(['vertical', 'horizontal']),
  gestureOrientation: PropTypes.string,
  smoothWheel: PropTypes.bool,
  smoothTouch: PropTypes.bool,
  wheelMultiplier: PropTypes.number,
  className: PropTypes.string,
  style: PropTypes.object,
  onScroll: PropTypes.func,
  integrateGSAP: PropTypes.bool
};

export default SmoothScroll; 