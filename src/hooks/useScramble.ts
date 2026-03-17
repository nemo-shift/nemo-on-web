'use client';

import { useState, useCallback, useRef } from 'react';

const CHARS = '!@#$%^&*()_+{}:"<>?|~`-=[]\\\';,./0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

/**
 * useScramble: 텍스트 스크램블 효과를 구현하는 커스텀 훅
 */
export function useScramble() {
  const [scrambledText, setScrambledText] = useState('');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startScramble = useCallback((targetText: string, duration: number = 800, onComplete?: () => void) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    
    const startTime = Date.now();
    
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      if (progress < 1) {
        // 무작위 텍스트 생성 (길이는 타겟 텍스트와 동일하게)
        const currentLength = targetText.length;
        let result = '';
        for (let i = 0; i < currentLength; i++) {
          result += CHARS[Math.floor(Math.random() * CHARS.length)];
        }
        setScrambledText(result);
      } else {
        // 애니메이션 완료
        if (intervalRef.current) clearInterval(intervalRef.current);
        setScrambledText(targetText);
        onComplete?.();
      }
    }, 40); // 25fps 정도로 업데이트
  }, []);

  return { scrambledText, startScramble, setScrambledText };
}
