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
      // 감성적 딜레이 후 첫 번째 단계 시작
      const timer = setTimeout(() => {
        setSequenceStep(1);
      }, HERO_TIMING.SEQUENCE_INITIAL_DELAY);
      return () => clearTimeout(timer);
    } else {
      // cascading render 방지를 위해 rAF 사용
      requestAnimationFrame(() => setSequenceStep(0));
    }
  }, [isOn]);

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
