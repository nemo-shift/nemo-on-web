import { useEffect, useRef } from "react";
import Lenis from "@studio-freight/lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Lenis 부드러운 스크롤 및 선택적 GSAP 통합을 제공하는 React 훅
 *
 * @param {boolean} enabled - Lenis 활성화 여부 (기본값: true)
 * @param {object} options - Lenis 인스턴스 생성 시 전달할 옵션 (선택 사항)
 * @param {boolean} options.integrateGSAP - GSAP ScrollTrigger와 통합 여부 (기본값: false)
 *                         이 외 Lenis 기본 옵션들 (duration, easing 등)도 options 객체 내에 포함 가능.
 * @returns {React.MutableRefObject<Lenis | null>} Lenis 인스턴스를 담는 ref 객체.
 *                                                컴포넌트에서 lenisRef.current로 인스턴스 접근.
 */
function useLenisScroll(enabled = true, options = {}) {
  const lenisRef = useRef(null);
  const rafRef = useRef(null);

  const { integrateGSAP = false, ...lenisOptions } = options;

  useEffect(() => {
    if (!enabled || typeof window === "undefined") {
      if (lenisRef.current) {
        if (rafRef.current) {
          cancelAnimationFrame(rafRef.current);
          rafRef.current = null;
        }
        if (typeof lenisRef.current.destroy === "function") {
          lenisRef.current.destroy();
        }
        if (window.lenis === lenisRef.current) {
          window.lenis = null;
        }
        lenisRef.current = null;
      }
      return;
    }

    const lenis = new Lenis(lenisOptions);
    lenisRef.current = lenis;
    
    window.lenis = lenis;

    const raf = (time) => {
      if (lenisRef.current && typeof lenisRef.current.raf === "function") {
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

    let gsapTickerHandler = null;
    if (integrateGSAP) {
      lenis.on("scroll", ScrollTrigger.update);
      gsapTickerHandler = (time) => {
        if (lenisRef.current && typeof lenisRef.current.raf === "function") {
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
        if (lenisRef.current && typeof lenisRef.current.off === "function") {
          lenisRef.current.off("scroll", ScrollTrigger.update);
        }
        if (gsapTickerHandler && typeof gsap.ticker.remove === "function") {
          gsap.ticker.remove(gsapTickerHandler);
        }
      }

      if (window.lenis === lenisRef.current) {
        window.lenis = null;
      }

      if (lenisRef.current && typeof lenisRef.current.destroy === "function") {
        lenisRef.current.destroy();
        lenisRef.current = null;
      }
    };
  }, [enabled, JSON.stringify(lenisOptions), integrateGSAP]);

  return lenisRef;
}

export default useLenisScroll;
