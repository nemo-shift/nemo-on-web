'use client';

import React from 'react';

type PhraseLineProps = {
  visible: boolean;
  baseColor: string;
  children: React.ReactNode;
};

/**
 * HeroPhraseLayer 내 프레이즈 한 줄 래퍼
 * 공통 스타일 및 등장 애니메이션 적용
 */
export default function PhraseLine({ visible, baseColor, children }: PhraseLineProps): React.ReactElement {
  return (
    <div
      style={{
        fontFamily: 'var(--font-bebas)',
        fontSize: 'clamp(32px, 6.5vw, 96px)',
        lineHeight: 1,
        letterSpacing: '-.01em',
        color: baseColor,
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(28px)',
        transition: 'opacity 1.2s ease, transform 1.2s cubic-bezier(0.16,1,0.3,1)',
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
