'use client';

import React from 'react';
import { useHeroContext } from '@/context';
import { PointRingCursor } from '@/components/ui';

/**
 * 전역 클라이언트 요소 래퍼
 * - layout.tsx(서버 컴포넌트)에서 클라이언트 훅을 사용하기 위해 분리
 */
export function GlobalElements() {
  const { isOn } = useHeroContext();
  return <PointRingCursor isOn={isOn} />;
}
