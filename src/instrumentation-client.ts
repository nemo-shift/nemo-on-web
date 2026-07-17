import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // 개발 환경에서는 모든 트레이스 수집, 프로덕션에서는 10%만 샘플링
  tracesSampleRate: process.env.NODE_ENV === 'development' ? 1.0 : 0.1,

  // 세션 리플레이 (프로덕션 전용 — dev에서 network error 유발 방지)
  ...(process.env.NODE_ENV === 'production' && {
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    integrations: [Sentry.replayIntegration()],
  }),
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
