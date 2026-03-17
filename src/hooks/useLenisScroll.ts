'use client';

import { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

type UseLenisScrollOptions = {
  /** GSAP ScrollTrigger와 통합 여부 [기본값: false] */
  integrateGSAP?: boolean;
  /** Lenis duration (초) */
  duration?: number;
  /** 터치 스크롤 배수 [기본값: 2] */
  touchMultiplier?: number;
  /** 마우스 휠 부드럽게 처리 */
  smoothWheel?: boolean;
  /** 터치 부드럽게 처리 (syncTouch) */
  syncTouch?: boolean;
  /** 휠 스크롤 배수 */
  wheelMultiplier?: number;
  /** 스크롤 방향 */
  orientation?: 'vertical' | 'horizontal';
  /** 제스처 방향 */
  gestureOrientation?: 'vertical' | 'horizontal' | 'both';
  [key: string]: unknown;
};

/**
 * Lenis 부드러운 스크롤 및 선택적 GSAP 통합을 제공하는 React 훅
 *
 * @param enabled - Lenis 활성화 여부 [기본값: true]
 * @param options - Lenis 인스턴스 옵션 (integrateGSAP, touchMultiplier 등)
 * @returns lenisRef - Lenis 인스턴스를 담는 ref (lenisRef.current로 접근)
 *
 * Example usage:
 * const lenisRef = useLenisScroll(true, { integrateGSAP: true });
 */
export default function useLenisScroll(
  enabled = true,
  options: UseLenisScrollOptions = {},
): React.MutableRefObject<Lenis | null> {
  const lenisRef = useRef<Lenis | null>(null);
  const rafRef = useRef<number | null>(null);

  const {
    integrateGSAP = false,
    touchMultiplier = 2,
    duration = 1.2,
    smoothWheel = true,
    syncTouch = true,
    wheelMultiplier = 1,
    orientation = 'vertical',
    gestureOrientation,
    ...lenisOptions
  } = options;

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') {
      if (lenisRef.current) {
        if (rafRef.current) {
          cancelAnimationFrame(rafRef.current);
          rafRef.current = null;
        }
        if (typeof lenisRef.current.destroy === 'function') {
          lenisRef.current.destroy();
        }
        if ((window as unknown as { lenis: unknown }).lenis === lenisRef.current) {
          (window as unknown as { lenis: null }).lenis = null;
        }
        lenisRef.current = null;
      }
      return;
    }

    const config = {
      duration,
      smoothWheel,
      syncTouch,
      touchMultiplier,
      wheelMultiplier,
      orientation,
      gestureOrientation: gestureOrientation ?? orientation,
      ...lenisOptions,
    };
    const lenis = new Lenis(config);

    lenisRef.current = lenis;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).lenis = lenis;

    const raf = (time: number) => {
      if (lenisRef.current && typeof lenisRef.current.raf === 'function') {
        lenisRef.current.raf(time);
        rafRef.current = requestAnimationFrame(raf);
      } else {
        if (rafRef.current) {
          cancelAnimationFrame(rafRef.current);
          rafRef.current = null;
        }
      }
    };

    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
    rafRef.current = requestAnimationFrame(raf);

    let gsapScrollUnsubscribe: (() => void) | null = null;
    let gsapTickerHandler: ((time: number) => void) | null = null;
    if (integrateGSAP) {
      gsapScrollUnsubscribe = lenis.on('scroll', ScrollTrigger.update);
      gsapTickerHandler = (time: number) => {
        if (lenisRef.current && typeof lenisRef.current.raf === 'function') {
          lenisRef.current.raf(time * 1000);
        }
      };
      gsap.ticker.add(gsapTickerHandler);
      gsap.ticker.lagSmoothing(0);
    }

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }

      if (integrateGSAP) {
        if (
          gsapScrollUnsubscribe &&
          typeof gsapScrollUnsubscribe === 'function'
        ) {
          gsapScrollUnsubscribe();
        }
        if (gsapTickerHandler && typeof gsap.ticker.remove === 'function') {
          gsap.ticker.remove(gsapTickerHandler);
        }
      }

      if ((window as unknown as { lenis: unknown }).lenis === lenisRef.current) {
        (window as unknown as { lenis: null }).lenis = null;
      }
      if (lenisRef.current && typeof lenisRef.current.destroy === 'function') {
        lenisRef.current.destroy();
        lenisRef.current = null;
      }
    };
  }, [
    enabled,
    integrateGSAP,
    duration,
    touchMultiplier,
    smoothWheel,
    syncTouch,
    wheelMultiplier,
    orientation,
    gestureOrientation,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    JSON.stringify(lenisOptions),
  ]);

  return lenisRef;
}
