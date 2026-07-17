# 배포 전 체크리스트

> 최종 업데이트: 2026-07-18
> 각 항목을 완료하면 `[ ]` → `[x]`로 변경

---

## P0 — 배포 전 필수

### 인프라 / 환경변수
- [ ] Vercel 환경변수 등록 확인
  - `RESEND_API_KEY`
  - `CONTACT_RECEIVER_EMAIL`
  - `NEXT_PUBLIC_SITE_URL`
  - `NEXT_PUBLIC_SENTRY_DSN`
  - `SENTRY_DSN`
- [ ] Resend 대시보드에서 실제 이메일 수신 확인 (테스트 발송)

### Analytics (측정 기반 확보)
- [ ] Vercel Analytics (`@vercel/analytics`) 설치 + `layout.tsx` 마운트
- [ ] Vercel Speed Insights (`@vercel/speed-insights`) 설치 + `layout.tsx` 마운트
- [ ] (선택) Google Analytics 4 — GA4 측정 ID 발급 + gtag 스크립트 삽입

### Security Headers
- [ ] `next.config.ts`에 `headers()` 추가
  - `X-Frame-Options: DENY`
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy: camera=(), microphone=(), geolocation=()`
  - (선택) `Content-Security-Policy` 기본 정책

### Sentry 안정화
- [ ] `tunnelRoute: '/monitoring'` 503 문제 해결 또는 비활성화
- [ ] 프로덕션에서 에러 수신 최종 확인

### 법무 / 콘텐츠
- [ ] `src/app/privacy/page.tsx` 법무 검토 후 내용 확정
- [ ] OG 이미지(`/public/nemoon_og.png`) 실제 SNS 공유 미리보기 확인

### 빌드
- [ ] `pnpm build` 최종 통과 확인

---

## P1 — 배포 직후 빠르게

### AEO / GEO (AI 검색엔진 최적화)
- [ ] `layout.tsx`에 글로벌 JSON-LD 추가
  - `Organization` 스키마 (회사명, 로고, URL, 연락처)
  - `WebSite` 스키마 (사이트명, URL)
- [ ] 서비스 페이지에 `Service` JSON-LD 추가
- [ ] 자주 묻는 질문이 있다면 `FAQPage` JSON-LD 추가
- [ ] 진단 페이지에 `HowTo` JSON-LD 검토

### SEO 정비
- [ ] 모든 페이지에 고유 `metadata.description` 확인
- [ ] 모든 페이지에 `alternates.canonical` 설정
- [ ] `robots.txt` 최종 확인 (불필요한 경로 차단 여부)
- [ ] `sitemap.xml` 모든 공개 페이지 포함 여부 확인

### Sentry 소스맵
- [ ] Sentry Auth Token 발급 → Vercel 환경변수 `SENTRY_AUTH_TOKEN` 등록
- [ ] `next.config.ts`에서 `org`, `project` 설정 + `sourcemaps.disable: false`
- [ ] 프로덕션 에러에 원본 소스 라인이 표시되는지 확인

---

## P2 — 안정화 후

### 성능 최적화
- [ ] Lighthouse 감사 실행 (Performance / Accessibility / SEO 점수 기록)
- [ ] raw `<img>` → `next/Image` 전환 (해당 파일 식별 필요)
- [ ] 번들 분석 (`@next/bundle-analyzer`) — 불필요한 대형 의존성 확인
- [ ] 폰트 로딩 전략 점검 (FOUT/FOIT 실기기 확인)

### PWA
- [ ] `public/manifest.json` 생성 (아이콘, theme_color, display 등)
- [ ] `layout.tsx` `<head>`에 `<link rel="manifest">` 추가

### 코드 정리
- [ ] 미가드 `console.log` 최종 정리 (`NODE_ENV !== 'production'` 가드)
- [ ] `[DEPLOY-DELETE]` / `[완성후-삭제]` 태그 검색 → 해당 코드 제거
- [ ] InteractionDebugger dev-only 확인 (프로덕션 번들 미포함)

### 모니터링 고도화
- [ ] Sentry Performance (트랜잭션 모니터링) 샘플레이트 조정
- [ ] Vercel Analytics에서 히어로 이탈률 / Core Web Vitals 추적
- [ ] (선택) Sentry Session Replay 프로덕션 활성화 검토

---

## 참고: 현재 상태 요약 (2026-07-18 감사 기준)

| 카테고리 | 상태 | 비고 |
|---|---|---|
| Vercel 환경변수 | ⚠️ 부분 | Sentry DSN 추가 필요 |
| Analytics | ❌ 없음 | 측정 데이터 수집 불가 |
| Structured Data (JSON-LD) | ❌ 없음 | AEO/GEO 대응 전무 |
| SEO 기본 | ⚠️ 부분 | 홈/about 등 있으나 일부 canonical 누락 |
| Security Headers | ❌ 없음 | Vercel 기본값만 적용 |
| Sentry | ⚠️ 부분 | 동작하나 tunnelRoute 503 + 소스맵 미설정 |
| next/image | ⚠️ 부분 | 일부 raw img 잔존 |
| PWA Manifest | ❌ 없음 | |
| console.log | ⚠️ 부분 | 대부분 dev 가드, 일부 미가드 |
