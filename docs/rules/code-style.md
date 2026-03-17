# 코드 스타일 (Code Style)

## ⚛️ 1. React/Next.js 관례
- **App Router**: 모든 페이지 및 라우팅은 App Router 구조를 따른다.
- **Client Components**: Hooks를 사용하는 컴포넌트는 반드시 상단에 `"use client";` 명시.
- **Data over Hardcoding**: 모든 텍스트, 이미지 경로, 애니메이션 설정값은 `src/data/` 또는 `src/constants/`에서 관리한다. 컴포넌트 내부 하드코딩을 지양한다.

## 🎨 2. CSS 및 애니메이션 작성
- **Tailwind CSS v4**: 유틸리티 클래스 위주로 작성하되, 복잡한 애니메이션 수치는 `interaction.ts`의 상수를 사용하여 인라인 스타일로 결합한다.
- **GSAP Context**: 컴포넌트 언마운트 시 클린업을 위해 반드시 `useGSAP` 훅 또는 `gsap.context()`를 사용한다.
