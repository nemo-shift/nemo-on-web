'use client';

import React from 'react';

type PhraseLineProps = {
  visible: boolean;
  baseColor: string;
  children: React.ReactNode;
  /** false면 아래에서 올라오는 애니 없이 그 자리에서 opacity만 적용 */
  animateFromBottom?: boolean;
  /** true면 모바일용 폰트 크기 */
  isMobile?: boolean;
};

/**
 * HeroPhraseLayer 내 프레이즈 한 줄 래퍼
 * 공통 스타일 및 등장 애니메이션 적용
 */
export default function PhraseLine({ visible, baseColor, children, animateFromBottom = true, isMobile = false }: PhraseLineProps): React.ReactElement {
  const transform = animateFromBottom
    ? (visible ? 'translateY(0)' : 'translateY(28px)')
    : 'none';
  const transition = animateFromBottom
    ? 'opacity 1.2s ease, transform 1.2s cubic-bezier(0.16,1,0.3,1)'
    : 'opacity 0.5s ease';

  return (
    <div
      style={{
        fontFamily: 'var(--font-suit), sans-serif',
        fontSize: isMobile ? 'clamp(44px, 9vw, 130px)' : 'clamp(32px, 6.5vw, 100px)',
        lineHeight: 1,
        letterSpacing: '-.01em',
        color: baseColor,
        opacity: visible ? 1 : 0,
        transform,
        transition,
        whiteSpace: 'nowrap',
        display: 'flex',
        alignItems: 'center',
        gap: '0.1em',
        pointerEvents: 'auto',
      }}
    >
      {children}
    </div>
  );
}
