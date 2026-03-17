# 디자인 시스템 (Design System)

## 🎨 1. 컬러 팔레트 (Color Palette)
- **Brand**: `#0891b2` (메인 틸 / 로고 심볼)
- **Accent**: `#E8734A` (포인트 오렌지)
- **BG Dark**: `#0a0a0a` (기본 블랙)
- **BG Section Dark**: `#0D1A1F` (Pain 섹션 배경)
- **BG Cream**: `#f7f1e9` (기본 크림배경)
- **Text Light**: `#f0ebe3` (다크모드 텍스트)
- **Text Dark**: `#0d1a1f` (라이트모드 텍스트)

## typography %SAME% (Typography)
- **한글 본문**: SUIT Variable (`font-suit`)
- **영문 본문**: DM Sans (`font-dmsans`)
- **영문 헤딩**: Bebas Neue (`font-bebas`)
- **터미널**: DM Mono (`font-dmmono`)
- **로고 [네모]**: 이사만룬체 Light (`font-esamanru`)
- **로고 [ON]**: Gmarket Sans Medium (`font-gmarket`)

## 📏 3. 그리드 & 반응형 정책
- **Fluid Typography**: `clamp()`를 사용하여 뷰포트에 따라 폰트 크기 자동 조절.
- **Breakpoint**:
  - PC: ≥ 1024px
  - Tablet: 768px ~ 1023px
  - Mobile: < 768px
