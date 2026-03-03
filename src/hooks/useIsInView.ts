'use client';

import { useEffect, useRef, useState } from 'react';

type UseIsInViewOptions = {
  /** 뷰포트 진입 판정 비율 (0~1) [기본값: 0] */
  threshold?: number;
  /** 한 번 true가 되면 계속 유지 [기본값: false] */
  triggerOnce?: boolean;
};

/**
 * IntersectionObserver 기반 뷰포트 감지 훅
 * 요소가 화면에 보이는지 여부를 반환
 *
 * @param options - threshold, triggerOnce
 * @returns [ref, isInView] - ref를 감지할 요소에 연결, isInView는 뷰포트 진입 여부
 *
 * Example usage:
 * const [ref, isInView] = useIsInView({ threshold: 0.2, triggerOnce: true });
 * <div ref={ref}>{isInView && '보임'}</div>
 */
export default function useIsInView(
  options: UseIsInViewOptions = {}
): [React.RefObject<HTMLElement | null>, boolean] {
  const { threshold = 0, triggerOnce = false } = options;
  const ref = useRef<HTMLElement | null>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !ref.current) return;

    const element = ref.current;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;

        if (entry.isIntersecting) {
          setIsInView(true);
          if (triggerOnce && ref.current) {
            observer.unobserve(ref.current);
          }
        } else if (!triggerOnce) {
          setIsInView(false);
        }
      },
      { threshold }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold, triggerOnce]);

  return [ref, isInView];
}
