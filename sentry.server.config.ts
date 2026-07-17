import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,

  tracesSampleRate: process.env.NODE_ENV === 'development' ? 1.0 : 0.1,

  // 서버 에러 발생 시 로컬 변수 포함 (디버깅 용이)
  includeLocalVariables: true,
});
