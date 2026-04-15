import Lenis from 'lenis';

/**
 * [V11.8 Normalization] Lenis 전역 타입 선언
 * 라이브러리 내부(node_modules)에서 window.lenis를 단순 객체로 오염시키고 있는 문제를 해결하기 위해
 * 인스턴스 타입을 강제로 재선언합니다.
 */
declare global {
  interface Window {
    /** [V11.8] 라이브러리 내부의 제한적인 타입을 무시하고 실제 Lenis 클래스 타입을 강제 적용 */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    lenis: any;
  }
}

export {};
