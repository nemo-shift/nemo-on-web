import React, { useEffect, useRef, useState } from 'react';

/**
 * Point + Ring 커서 컴포넌트
 * 
 * Props:
 * @param {Object} state - 커서 상태 객체 [Required]
 * @param {string} state.color - 커서 색상 [Optional, 기본값: '#ff6b6b']
 * @param {number} state.pointSize - 중심점 크기(px) [Optional, 기본값: 8]
 * @param {number} state.ringSize - 링 크기(px) [Optional, 기본값: 32]
 * @param {number} state.pointLerp - 점의 부드러운 움직임 계수 (0.1-1.0) [Optional, 기본값: 0.3]
 * @param {number} state.ringLerp - 링의 부드러운 움직임 계수 (0.1-1.0) [Optional, 기본값: 0.15]
 * 
 * Example usage:
 * <PointRing state={{ 
 *   color: '#ff0000', 
 *   pointLerp: 0.4, 
 *   ringLerp: 0.2 
 * }} />
 */
function PointRing({ state }) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [pointPos, setPointPos] = useState({ x: 0, y: 0 });
  const [ringPos, setRingPos] = useState({ x: 0, y: 0 });
  const [isClicked, setIsClicked] = useState(false);
  
  const pointRef = useRef(null);
  const ringRef = useRef(null);
  const animationRef = useRef();

  // 기본 커서 숨기기
  useEffect(() => {
    document.body.style.cursor = 'none';
    
    return () => {
      document.body.style.cursor = '';
    };
  }, []);

  // 마우스 위치 추적
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    const handleMouseDown = () => {
      setIsClicked(true);
    };

    const handleMouseUp = () => {
      setIsClicked(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  // 점과 링 위치 애니메이션 (부드러운 따라오기 - 커스터마이징 가능한 속도)
  useEffect(() => {
    const animate = () => {
      // state에서 lerp 값 가져오기 (기본값 설정)
      const pointLerp = state.pointLerp || 0.3; // 점은 빠르게 따라옴
      const ringLerp = state.ringLerp || 0.15;  // 링은 느리게 따라옴

      // 점 위치 업데이트
      setPointPos(prev => {
        const dx = mousePos.x - prev.x;
        const dy = mousePos.y - prev.y;
        
        return {
          x: prev.x + dx * pointLerp,
          y: prev.y + dy * pointLerp
        };
      });

      // 링 위치 업데이트
      setRingPos(prev => {
        const dx = mousePos.x - prev.x;
        const dy = mousePos.y - prev.y;
        
        return {
          x: prev.x + dx * ringLerp,
          y: prev.y + dy * ringLerp
        };
      });
      
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [mousePos, state.pointLerp, state.ringLerp]);

  // 포인트 위치 업데이트 (부드러운 반응)
  useEffect(() => {
    if (pointRef.current) {
      pointRef.current.style.transform = `translate3d(${pointPos.x - 4}px, ${pointPos.y - 4}px, 0) scale(${isClicked ? 1.5 : 1})`;
    }
  }, [pointPos, isClicked]);

  // 링 위치 업데이트 (더 부드러운 반응)
  useEffect(() => {
    if (ringRef.current) {
      ringRef.current.style.transform = `translate3d(${ringPos.x - 16}px, ${ringPos.y - 16}px, 0) scale(${isClicked ? 0.8 : 1})`;
    }
  }, [ringPos, isClicked]);

  const pointSize = state.pointSize || 8;
  const ringSize = state.ringSize || 32;
  const color = state.color || '#ff6b6b';

  return (
    <>
      {/* 중심점 (커스터마이징 가능한 부드러운 반응) */}
      <div
        ref={pointRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: pointSize,
          height: pointSize,
          backgroundColor: color,
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 9999,
          willChange: 'transform',
        }}
      />
      
      {/* 바깥 링 (커스터마이징 가능한 더 부드러운 반응) */}
      <div
        ref={ringRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: ringSize,
          height: ringSize,
          border: `2px solid ${color}`,
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 9998,
          willChange: 'transform',
        }}
      />
    </>
  );
}

export default PointRing; 