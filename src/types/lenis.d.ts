// Lenis 전역 타입 선언 (단일 소스)
// useLenisScroll, SmoothScrollProvider, LenisScrollRestoration 등에서 공유합니다.
import type Lenis from 'lenis';

declare global {
  interface Window {
    lenis: Lenis | null;
  }
}

export {};
