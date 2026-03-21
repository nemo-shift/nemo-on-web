'use client';

import { useState, useEffect } from 'react';
import { HERO_TIMING } from '@/constants/hero';

/**
 * Hero 섹션의 애니메이션 시퀀스를 관리하는 커스텀 훅
 */
export function useHeroSequence(isOn: boolean) {
  const [sequenceStep, setSequenceStep] = useState(0); 
  // 0: OFF, 1: 원, 2: 세모, 3: 네모, 4: 전체합체, 5: 슬로건

  useEffect(() => {
    if (isOn) {
      // [V12.3] 이미 시퀀스가 시작되었거나(>0) 완료된 경우 시작 타이머 중복 가동 방지
      // sequenceStep을 의존성 배열에서 제외하여 무한 루프를 원천 차단함
      if (sequenceStep > 0) return;

      const timer = setTimeout(() => {
        // [V12.4] 타이머 실행 시점에 상태 재확인: 이미 외부에서 완료(5)시켰다면 1로 되돌리지 않음 (하극상 방지)
        setSequenceStep(prev => prev >= 5 ? prev : 1);
      }, HERO_TIMING.SEQUENCE_INITIAL_DELAY);
      return () => clearTimeout(timer);
    } else {
      // cascading render 방지를 위해 rAF 사용
      requestAnimationFrame(() => setSequenceStep(0));
    }
  }, [isOn]); // sequenceStep 제거

  useEffect(() => {
    if (!isOn || sequenceStep === 0 || sequenceStep >= 5) return;

    // 단계별 지연 시간 결정
    const interval = sequenceStep === 1 
      ? HERO_TIMING.SEQUENCE_STEP_1_DELAY 
      : HERO_TIMING.SEQUENCE_STEP_DEFAULT_DELAY;

    const timer = setTimeout(() => {
      setSequenceStep((prev) => prev + 1);
    }, interval);

    return () => clearTimeout(timer);
  }, [isOn, sequenceStep]);

  return { sequenceStep, setSequenceStep };
}
