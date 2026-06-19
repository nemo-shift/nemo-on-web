'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useHeroContext } from '@/context';

/**
 * 서브페이지 전용 푸터 리빌 스페이서
 * - <main> 밖에 위치하여 main이 footer 영역을 덮는 문제 해결
 * - pointer-events-none으로 footer 클릭 이벤트 통과
 */
export default function FooterRevealSpacer(): React.ReactElement | null {
  const pathname = usePathname();
  const { footerHeight } = useHeroContext();

  // 홈페이지는 GSAP 핀 방식으로 별도 처리
  if (pathname === '/') return null;

  return (
    <div
      aria-hidden="true"
      className="w-full pointer-events-none"
      style={{ height: footerHeight || '25vh' }}
    />
  );
}
