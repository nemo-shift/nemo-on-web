import { useRef, useEffect, useState } from 'react';

/**
 * 마우스 위치를 실시간으로 추적하고 지연된 위치도 제공하는 훅
 * 
 * @param {number} delay - 지연 시간 (ms)
 * @returns {Object} { position, delayedPosition }
 */
export function useMousePosition(delay = 0) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [delayedPosition, setDelayedPosition] = useState({ x: 0, y: 0 });
  const queue = useRef([]);

  useEffect(() => {
    let rafId;
    
    const updateDelayedPosition = () => {
      if (delay > 0) {
        const now = Date.now();
        const targetTime = now - delay;
        
        // 큐에서 해당 시점의 위치 찾기
        const targetPos = queue.current.find(p => p.timestamp <= targetTime);
        if (targetPos) {
          setDelayedPosition({ x: targetPos.x, y: targetPos.y });
        }
      } else {
        setDelayedPosition(position);
      }
      
      rafId = requestAnimationFrame(updateDelayedPosition);
    };

    const handleMouseMove = (e) => {
      const newPos = { x: e.clientX, y: e.clientY };
      setPosition(newPos);
      
      if (delay > 0) {
        queue.current.push({ 
          x: e.clientX, 
          y: e.clientY, 
          timestamp: Date.now() 
        });
        
        // 큐 크기 제한 (메모리 관리)
        if (queue.current.length > 100) {
          queue.current = queue.current.slice(-50);
        }
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    rafId = requestAnimationFrame(updateDelayedPosition);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [delay, position]);

  return { position, delayedPosition };
} 