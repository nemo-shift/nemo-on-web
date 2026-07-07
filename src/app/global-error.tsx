// [V69.LaunchReady] STEP 3 — 루트 레이아웃 크래시 대비 글로벌 에러 경계
// ⚠️ 이 컴포넌트는 루트 layout.tsx 자체가 크래시할 때 렌더된다.
//    html/body 태그를 직접 포함해야 하며, Next.js 폰트/CSS 변수를 사용할 수 없다.
//    외부 의존성(GSAP, Lenis, next/font 등) 임포트 절대 금지.
'use client';

import { useEffect } from 'react';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error('[Global Error Boundary]', error);
  }, [error]);

  return (
    <html lang="ko">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>오류 발생 | 네모:ON</title>
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            min-height: 100vh;
            background-color: #f7f1e9;
            color: #0d1a1f;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rem;
            text-align: center;
          }
          .wrap { display: flex; flex-direction: column; align-items: center; gap: 2rem; max-width: 480px; }
          .label { font-size: 0.7rem; letter-spacing: 0.15em; text-transform: uppercase; opacity: 0.4; }
          h1 { font-size: clamp(1.5rem, 4vw, 2.25rem); font-weight: 800; letter-spacing: -0.03em; line-height: 1.2; }
          p { font-size: 0.9rem; opacity: 0.55; line-height: 1.7; }
          button {
            padding: 0.65rem 1.5rem;
            background: #0d1a1f;
            color: #f7f1e9;
            font-size: 0.75rem;
            font-weight: 700;
            letter-spacing: 0.12em;
            text-transform: uppercase;
            border: none;
            cursor: pointer;
          }
        `}</style>
      </head>
      <body>
        <div className="wrap">
          <p className="label">Critical Error</p>
          <h1>일시적인 문제가 발생했습니다.</h1>
          <p>
            잠시 후 다시 시도해 주세요.
            <br />
            문제가 지속되면 turn.nemoon@gmail.com 으로 문의해 주세요.
          </p>
          <button onClick={reset}>다시 시도</button>
        </div>
      </body>
    </html>
  );
}
