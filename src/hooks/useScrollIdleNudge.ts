'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface UseScrollIdleNudgeOptions {
  active: boolean;        // 훅을 켤지 여부 (isOn && isScrollable && !isTransitioning)
  firstDelayMs?: number;  // 최초 등장까지 대기 시간 (기본 3500ms)
  repeatDelayMs?: number; // 이후 재등장까지 대기 시간 (기본 7000ms)
}

/**
 * [V74.ScrollGuidance] 스크롤 입력이 일정 시간 없으면 true를 반환하는 훅.
 * 첫 발동은 짧게(초심자 안내), 이후 발동은 길게(읽는 중 방해 최소화) 잡는다.
 * wheel/touchmove를 "활동"으로 간주 — ForWho 캐러셀의 가로 스와이프도
 * touchmove 이벤트를 발생시키므로 자연히 커버된다.
 */
export function useScrollIdleNudge({
  active,
  firstDelayMs = 3500,
  repeatDelayMs = 7000,
}: UseScrollIdleNudgeOptions): boolean {
  const [shouldShow, setShouldShow] = useState(false);
  const hasTriggeredOnceRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    const delay = hasTriggeredOnceRef.current ? repeatDelayMs : firstDelayMs;
    timerRef.current = setTimeout(() => {
      setShouldShow(true);
      hasTriggeredOnceRef.current = true;
    }, delay);
  }, [firstDelayMs, repeatDelayMs]);

  useEffect(() => {
    if (!active) {
      setShouldShow(false);
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    scheduleTimer();

    const onActivity = () => {
      setShouldShow(false);
      scheduleTimer();
    };

    window.addEventListener('wheel', onActivity, { passive: true });
    window.addEventListener('touchmove', onActivity, { passive: true });

    return () => {
      window.removeEventListener('wheel', onActivity);
      window.removeEventListener('touchmove', onActivity);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [active, scheduleTimer]);

  return shouldShow;
}
