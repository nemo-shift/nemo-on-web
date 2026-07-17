import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // 개발 환경에서는 모든 트레이스 수집, 프로덕션에서는 10%만 샘플링
  tracesSampleRate: process.env.NODE_ENV === 'development' ? 1.0 : 0.1,

  // 세션 리플레이: 일반 세션 10%, 에러 발생 세션 100%
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  integrations: [
    Sentry.replayIntegration(),
  ],
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
