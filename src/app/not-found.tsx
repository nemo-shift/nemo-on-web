// [V69.LaunchReady] STEP 3 — 404 Not Found 페이지
// GSAP/Lenis 등 무거운 의존성 임포트 금지 — 에러 상황 최소 실행 원칙
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '페이지를 찾을 수 없습니다 | 네모:ON',
};

export default function NotFound() {
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
          404
        </p>
        <h1
          style={{
            fontSize: 'clamp(1.5rem, 4vw, 2.25rem)',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            lineHeight: 1.2,
          }}
        >
          페이지를 찾을 수 없습니다.
        </h1>
        <p style={{ fontSize: '0.9rem', opacity: 0.55, lineHeight: 1.7 }}>
          주소가 잘못되었거나 이동·삭제된 페이지입니다.
        </p>
      </div>

      <Link
        href="/"
        style={{
          padding: '0.65rem 1.5rem',
          backgroundColor: 'var(--text-dark, #0d1a1f)',
          color: 'var(--bg-cream, #f7f1e9)',
          fontSize: '0.75rem',
          fontWeight: 700,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          textDecoration: 'none',
        }}
      >
        홈으로 →
      </Link>
    </div>
  );
}
