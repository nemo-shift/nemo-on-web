'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { HERO_TIMING, HERO_SCRAMBLE_CHARS } from '@/constants/hero';

/**
 * 텍스트 스크램블 효과를 위한 커스텀 훅
 */
export function useScramble(initialText: string, targetText: string, onComplete?: () => void) {
  const [scrambleText, setScrambleText] = useState(initialText);
  const [isScrambling, setIsScrambling] = useState(false);
  const scrambleIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasScrambledRef = useRef(false);

  const startScramble = useCallback(() => {
    if (isScrambling || hasScrambledRef.current) return;

    const delayTimer = setTimeout(() => {
      hasScrambledRef.current = true;
      setIsScrambling(true);
      let iteration = 0;

      if (scrambleIntervalRef.current) clearInterval(scrambleIntervalRef.current);

      scrambleIntervalRef.current = setInterval(() => {
        const scrambled = targetText
          .split('')
          .map((char, index) => {
            if (index < iteration) return char;
            return HERO_SCRAMBLE_CHARS[Math.floor(Math.random() * HERO_SCRAMBLE_CHARS.length)];
          })
          .join('');

        setScrambleText(scrambled);
        iteration += 0.12;

        if (iteration >= targetText.length) {
          if (scrambleIntervalRef.current) clearInterval(scrambleIntervalRef.current);
          setScrambleText(targetText);
          setIsScrambling(false);
          onComplete?.();
        }
      }, HERO_TIMING.SCRAMBLE_INTERVAL);
    }, HERO_TIMING.SCRAMBLE_START_DELAY);

    return () => clearTimeout(delayTimer);
  }, [isScrambling, targetText, onComplete]);

  const resetScramble = useCallback(() => {
    if (scrambleIntervalRef.current) clearInterval(scrambleIntervalRef.current);
    setScrambleText(initialText);
    setIsScrambling(false);
    hasScrambledRef.current = false;
  }, [initialText]);

  useEffect(() => {
    return () => {
      if (scrambleIntervalRef.current) clearInterval(scrambleIntervalRef.current);
    };
  }, []);

  return {
    scrambleText,
    isScrambling,
    startScramble,
    resetScramble
  };
}
