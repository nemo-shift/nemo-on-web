'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface UseScrollIdleNudgeOptions {
  active: boolean;        // 훅을 켤지 여부 (isOn && isScrollable && !isTransitioning)
  firstDelayMs?: number;  // 최초 등장까지 대기 시간 (기본 3500ms)
  repeatDelayMs?: number; // 이후 재등장까지 대기 시간 (기본 7000ms)
}

interface UseScrollIdleNudgeResult {
  shouldShow: boolean;
  dismiss: () => void; // [V74/STEP9] 수동 닫기 — 클릭/터치 핸들러에서 호출
  isRepeat: boolean;   // [V75/STEP A] 최초 등장 여부 — 카피 분기용
}

/**
 * [V74.ScrollGuidance / V77] 일정 시간 능동적 입력이 없으면 shouldShow=true를 반환하는 훅.
 * 첫 발동은 짧게(초심자 안내), 이후 발동은 길게(읽는 중 방해 최소화) 잡는다.
 * [V77] wheel/touchmove/pointerdown/keydown을 "활동"으로 간주 —
 * 스크롤뿐 아니라 캐러셀 클릭·키보드 탐색도 커버한다. mousemove 제외.
 * dismiss()를 호출하면 즉시 숨기고 타이머를 재스케줄해 다음 유휴 시 재등장한다.
 */
export function useScrollIdleNudge({
  active,
  firstDelayMs = 3500,
  repeatDelayMs = 7000,
}: UseScrollIdleNudgeOptions): UseScrollIdleNudgeResult {
  const [shouldShow, setShouldShow] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false); // [V75/STEP A]
  const hasTriggeredOnceRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    const wasTriggeredBefore = hasTriggeredOnceRef.current;
    const delay = wasTriggeredBefore ? repeatDelayMs : firstDelayMs;
    timerRef.current = setTimeout(() => {
      setIsRepeat(wasTriggeredBefore); // [V75/STEP A] 등장 시점 기준으로 판단
      setShouldShow(true);
      hasTriggeredOnceRef.current = true;
    }, delay);
  }, [firstDelayMs, repeatDelayMs]);

  // [V74/STEP9] 활동 감지와 수동 닫기를 동일 경로로 통합
  const dismiss = useCallback(() => {
    setShouldShow(false);
    scheduleTimer();
  }, [scheduleTimer]);

  useEffect(() => {
    if (!active) {
      setShouldShow(false);
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    scheduleTimer();

    const onActivity = () => dismiss();

    // [V77] 활동 판단 기준 확장 — 스크롤 입력뿐 아니라 캐러셀 클릭/드래그,
    // 버튼 조작, 키보드 탐색 등 "능동적으로 페이지를 쓰고 있다"는 확실한
    // 신호를 전부 활동으로 인정한다. mousemove는 제외 — 마우스가 화면
    // 위에 있기만 해도 계속 발화해 유휴 감지가 사실상 무력화되므로,
    // 의도가 명확한 이산적 입력(클릭/탭/키입력)만 신호로 인정한다.
    const activityEvents = ['wheel', 'touchmove', 'pointerdown', 'keydown'] as const;
    activityEvents.forEach((evt) =>
      window.addEventListener(evt, onActivity, { passive: true })
    );

    return () => {
      activityEvents.forEach((evt) => window.removeEventListener(evt, onActivity));
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [active, scheduleTimer, dismiss]);

  return { shouldShow, dismiss, isRepeat };
}
