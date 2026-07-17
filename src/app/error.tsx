// [V69.LaunchReady] STEP 3 — 앱 에러 경계
// GSAP/Lenis 등 무거운 의존성 임포트 금지 — 에러 상황 최소 실행 원칙
'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';
import Link from 'next/link';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div
      style={{
        minHeight: '100svh',
        backgroundColor: 'var(--bg-cream, #f7f1e9)',
        color: 'var(--text-dark, #0d1a1f)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        textAlign: 'center',
        gap: '2rem',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: '480px' }}>
        <p
          style={{
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: '0.7rem',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            opacity: 0.4,
          }}
        >
          Error
        </p>
        <h1
          style={{
            fontSize: 'clamp(1.5rem, 4vw, 2.25rem)',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            lineHeight: 1.2,
          }}
        >
          일시적인 문제가 발생했습니다.
        </h1>
        <p style={{ fontSize: '0.9rem', opacity: 0.55, lineHeight: 1.7 }}>
          잠시 후 다시 시도해 주세요.
          <br />
          문제가 지속되면 직접 문의해 주세요.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button
          onClick={reset}
          style={{
            padding: '0.65rem 1.5rem',
            backgroundColor: 'var(--text-dark, #0d1a1f)',
            color: 'var(--bg-cream, #f7f1e9)',
            fontSize: '0.75rem',
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          다시 시도
        </button>
        <Link
          href="/"
          style={{
            padding: '0.65rem 1.5rem',
            border: '1px solid rgba(13,26,31,0.2)',
            fontSize: '0.75rem',
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'inherit',
            textDecoration: 'none',
          }}
        >
          홈으로
        </Link>
      </div>
    </div>
  );
}
