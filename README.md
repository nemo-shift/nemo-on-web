# 네모:ON

Next.js 기반 NEMO:ON 브랜딩 스튜디오 웹사이트입니다.

## 기술 스택

- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Linting**: ESLint
- **Scroll**: Lenis + GSAP ScrollTrigger
- **Animation**: GSAP (스크롤 기반) / Framer Motion (컴포넌트 인터랙션)
- **Icons**: Lucide React

## 프로젝트 구조

```
src/
├── app/                  # Next.js App Router (page.tsx, layout.tsx)
├── components/
│   ├── ui/               # 공통 아토믹 컴포넌트 (Button 등)
│   ├── sections/         # 페이지별 섹션 (HeroSection 등)
│   └── layout/           # 공통 레이아웃 (Header, Footer)
├── data/                 # 콘텐츠 데이터 중앙 관리 (homeContent.ts 등)
├── hooks/                # 커스텀 훅
├── lib/                  # 유틸리티 (cn 등)
├── styles/               # 전역 스타일
└── types/                # 전역 타입 정의
```

## 사이트맵

```
/                   홈
/about              브랜드 소개
/offerings          서비스
  /offerings/studio
  /offerings/lab    (비공개 — 추후 공개)
/showcase           쇼케이스 (웨비나 후 오픈)
/diagnosis          브랜드 진단
/story              스토리 (비공개 준비)
/contact            컨택
```

## 개발 규칙

- `.cursor/rules/code-convention.mdc` — 코드 컨벤션
- `.cursor/rules/design-system.mdc` — 디자인 시스템

## 실행 방법

```bash
pnpm install   # 패키지 설치
pnpm dev       # 개발 서버
pnpm build     # 프로덕션 빌드
pnpm start     # 프로덕션 서버
pnpm lint      # 린트 검사
```

## 디자인 토큰

브랜드 컬러 등 디자인 토큰은 `tailwind.config.ts`의 `theme.extend`에서 관리합니다.
확정 후 토큰값만 교체하면 됩니다.
