'use client';

import { useRef, useEffect } from 'react';

type Position = { x: number; y: number };
type QueuedPosition = { x: number; y: number; timestamp: number };

/**
 * 마우스 위치를 실시간으로 추적하고 지연된 위치도 제공하는 훅
 * [V76] useState → useRef 전환 — mousemove마다 리렌더 제거
 *
 * @param delay - 지연 시간 (ms). 0이면 delayedPositionRef는 positionRef와 동일
 * @returns { positionRef, delayedPositionRef }
 */
export function useMousePosition(delay = 0): {
  positionRef: React.MutableRefObject<Position>;
  delayedPositionRef: React.MutableRefObject<Position>;
} {
  const positionRef = useRef<Position>({ x: 0, y: 0 });
  const delayedPositionRef = useRef<Position>({ x: 0, y: 0 });
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
          delayedPositionRef.current = { x: targetPos.x, y: targetPos.y };
        }
        rafId = requestAnimationFrame(updateDelayedPosition);
      }
    };

    const handleMouseMove = (e: MouseEvent): void => {
      positionRef.current = { x: e.clientX, y: e.clientY };

      // delay=0 이면 즉시 동기화 (rAF 루프 없이 mousemove 이벤트에서만 갱신)
      if (delayRef.current <= 0) {
        delayedPositionRef.current = positionRef.current;
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

  return { positionRef, delayedPositionRef };
}
