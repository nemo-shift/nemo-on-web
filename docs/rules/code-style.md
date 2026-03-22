# 코드 스타일 (Code Style) - V16.2

## ⚛️ 1. React/Next.js 관례
- **App Router**: 모든 페이지 및 라우팅은 App Router 구조를 따른다.
- **Client Components**: Hooks를 사용하는 컴포넌트는 반드시 상단에 `"use client";` 명시.
- **Data over Hardcoding**: 모든 애니메이션 설정값은 `src/data/`의 `journey-data.ts` 또는 `interaction.ts`에서 관리한다.

## 🎨 2. CSS 및 애니메이션 작성
- **Tailwind CSS v4**: 유틸리티 클래스 위주로 작성하되, 복잡한 레이아웃 수치는 인라인 스타일과 결합하여 사용한다.
- **GSAP Only Principle**: 
    - 애니메이션 작성 시 `framer-motion`을 절대 사용하지 않는다.
    - 반드시 `useGSAP` 훅을 사용하여 스코프 기반의 애니메이션과 자동 클린업을 확보한다.
    - 복잡한 시퀀스는 `gsap.timeline()`을 사용하여 가독성을 높인다.

## 🧩 3. 파일 및 모듈 관리
- **Logic Modularization**: `GlobalInteractionStage`와 관련된 비대한 로직은 기능에 따라 `builders.ts`(타임라인)와 `utils.ts`(헬퍼/상수)로 분리하여 관리한다.
- **Import Ordering**: 내부 모듈 임포트 시 `@/components`, `@/constants`, `@/utils` 등 절대 경로 별칭을 일관되게 사용한다.
