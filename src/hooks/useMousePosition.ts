'use client';

import { useRef, useEffect, useState } from 'react';

type Position = { x: number; y: number };
type QueuedPosition = { x: number; y: number; timestamp: number };

/**
 * 마우스 위치를 실시간으로 추적하고 지연된 위치도 제공하는 훅
 *
 * @param delay - 지연 시간 (ms). 0이면 delayedPosition은 position과 동일
 * @returns { position, delayedPosition }
 */
export function useMousePosition(delay = 0): {
  position: Position;
  delayedPosition: Position;
} {
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [delayedPosition, setDelayedPosition] = useState<Position>({ x: 0, y: 0 });
  const queue = useRef<QueuedPosition[]>([]);
  const delayRef = useRef(delay);

  useEffect(() => {
    delayRef.current = delay;
  }, [delay]);

  useEffect(() => {
    let rafId: number;

    // delay > 0 일 때만 rAF 루프 사용 (지연 위치 계산 필요)
    const updateDelayedPosition = (): void => {
      if (delayRef.current > 0) {
        const now = Date.now();
        const targetTime = now - delayRef.current;
        const targetPos = queue.current.find((p) => p.timestamp <= targetTime);
        if (targetPos) {
          setDelayedPosition({ x: targetPos.x, y: targetPos.y });
        }
        rafId = requestAnimationFrame(updateDelayedPosition);
      }
    };

    const handleMouseMove = (e: MouseEvent): void => {
      const newPos: Position = { x: e.clientX, y: e.clientY };
      setPosition(newPos);

      // delay=0 이면 즉시 동기화 (rAF 루프 없이 mousemove 이벤트에서만 갱신)
      if (delayRef.current <= 0) {
        setDelayedPosition(newPos);
      } else {
        queue.current.push({
          x: e.clientX,
          y: e.clientY,
          timestamp: Date.now(),
        });

        if (queue.current.length > 100) {
          queue.current = queue.current.slice(-50);
        }
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // delay > 0 인 경우에만 rAF 루프 시작
    if (delayRef.current > 0) {
      rafId = requestAnimationFrame(updateDelayedPosition);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(rafId);
    };
  }, []); // 마운트 시 1회만 등록

  return { position, delayedPosition };
}
