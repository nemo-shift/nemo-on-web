import 'matter-js';

declare module 'matter-js' {
  interface Body {
    /** FallingKeywordsStage에서 사용하는 커스텀 텍스트 속성 */
    text?: string;
  }
}
