import type { NextConfig } from 'next';
import { withSentryConfig } from '@sentry/nextjs';

const nextConfig: NextConfig = {
  turbopack: {},
  // Windows 환경에서 속도가 심각하게 느릴 경우에만 webpack polling 고려
};

export default withSentryConfig(nextConfig, {
  // 소스맵 업로드는 SENTRY_AUTH_TOKEN 설정 후 활성화
  // org: 'your-org',
  // project: 'your-project',
  // authToken: process.env.SENTRY_AUTH_TOKEN,

  // /monitoring 경로를 터널로 사용하여 광고 차단기 우회
  tunnelRoute: '/monitoring',

  // 빌드 로그 억제 (CI가 아닌 로컬 환경)
  silent: !process.env.CI,

  // 소스맵 업로드 비활성화 (auth token 미설정 시)
  sourcemaps: {
    disable: true,
  },
});
