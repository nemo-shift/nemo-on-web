'use client';

import React, { useEffect, useRef } from 'react';
import useLenisScroll from '@/hooks/useLenisScroll';
import { cn } from '@/lib';

type SmoothScrollProps = {
  /** 스크롤 컨텐츠 [Required] */
  children: React.ReactNode;
  /** 스크롤 효과 활성화 [Optional, 기본값: true] */
  enabled?: boolean;
  /** 스크롤 애니메이션 지속 시간(초) [Optional, 기본값: 1.2] */
  duration?: number;
  /** 스크롤 방향 [Optional, 기본값: 'vertical'] */
  orientation?: 'vertical' | 'horizontal';
  /** 마우스 휠 부드럽게 [Optional, 기본값: true] */
  smoothWheel?: boolean;
  /** 터치 스크롤 부드럽게 [Optional, 기본값: true] */
  smoothTouch?: boolean;
  /** 터치 배수 [Optional, 기본값: 2] */
  touchMultiplier?: number;
  /** GSAP ScrollTrigger 연동 [Optional, 기본값: true] */
  integrateGSAP?: boolean;
  /** 추가 클래스 [Optional] */
  className?: string;
  /** 스크롤 이벤트 핸들러 [Optional] */
  onScroll?: (e: { scroll: number }) => void;
};

/**
 * 부드러운 스크롤 효과를 적용하는 컨테이너 컴포넌트
 * Lenis 기반 + GSAP ScrollTrigger 연동
 *
 * Example usage:
 * <SmoothScroll integrateGSAP>
 *   <div>내용</div>
 * </SmoothScroll>
 */
export default function SmoothScroll({
  children,
  enabled = true,
  duration = 1.2,
  orientation = 'vertical',
  smoothWheel = true,
  smoothTouch = true,
  touchMultiplier = 2,
  integrateGSAP = true,
  className,
  onScroll,
}: SmoothScrollProps): React.ReactElement {
  const containerRef = useRef<HTMLDivElement>(null);
  const lenisRef = useLenisScroll(enabled, {
    duration,
    orientation,
    smoothWheel,
    syncTouch: smoothTouch,
    touchMultiplier,
    integrateGSAP,
  });

  useEffect(() => {
    if (!enabled || !lenisRef.current || !onScroll) return;

    const lenis = lenisRef.current;
    const handleScroll = (): void => {
      onScroll({ scroll: lenis.scroll });
    };

    const unsubscribe = lenis.on('scroll', handleScroll);
    return () => {
      if (unsubscribe && typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [enabled, lenisRef, onScroll]);

  return (
    <div
      ref={containerRef}
      className={cn('h-full w-full', className)}
      data-lenis-prevent={!enabled}
    >
      {children}
    </div>
  );
}
