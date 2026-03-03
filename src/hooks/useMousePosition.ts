'use client';

import { useRef, useEffect, useState } from 'react';

type Position = { x: number; y: number };
type QueuedPosition = { x: number; y: number; timestamp: number };

/**
 * 마우스 위치를 실시간으로 추적하고 지연된 위치도 제공하는 훅
 *
 * @param delay - 지연 시간 (ms)
 * @returns { position, delayedPosition }
 */
export function useMousePosition(delay = 0): {
  position: Position;
  delayedPosition: Position;
} {
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [delayedPosition, setDelayedPosition] = useState<Position>({ x: 0, y: 0 });
  const queue = useRef<QueuedPosition[]>([]);

  useEffect(() => {
    let rafId: number;

    const updateDelayedPosition = (): void => {
      if (delay > 0) {
        const now = Date.now();
        const targetTime = now - delay;

        const targetPos = queue.current.find((p) => p.timestamp <= targetTime);
        if (targetPos) {
          setDelayedPosition({ x: targetPos.x, y: targetPos.y });
        }
      } else {
        setDelayedPosition(position);
      }

      rafId = requestAnimationFrame(updateDelayedPosition);
    };

    const handleMouseMove = (e: MouseEvent): void => {
      const newPos: Position = { x: e.clientX, y: e.clientY };
      setPosition(newPos);

      if (delay > 0) {
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
    rafId = requestAnimationFrame(updateDelayedPosition);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(rafId);
    };
  }, [delay, position]);

  return { position, delayedPosition };
}
