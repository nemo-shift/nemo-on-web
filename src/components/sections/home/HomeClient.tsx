'use client';

import React from 'react';
import { useHeroContext } from '@/context';
import {
  FreeHorizontalScrollSection,
  FullPageSection,
  Footer,
} from '@/components/layout';
import HeroSection from './HeroSection';

/**
 * HomeClient 컴포넌트
 *
 * 홈 페이지 클라이언트 로직 담당.
 * - useHeroContext로 히어로 ON/OFF 및 스크롤 잠금 관리
 * - FreeHorizontalScrollSection + HeroSection 조합
 */
export default function HomeClient(): React.ReactElement {
  const { isOn, toggle, isScrollable } = useHeroContext();

  return (
    <FreeHorizontalScrollSection isLocked={!isScrollable}>
      <FullPageSection widthType="vw">
        <HeroSection isOn={isOn} onToggle={toggle} />
      </FullPageSection>

      <FullPageSection
        widthType="vw"
        className="bg-brand-primary flex items-center justify-center"
      >
        <div className="text-center">
          <h2 className="text-white text-5xl font-bold mb-4">Brand Story</h2>
          <p className="text-white/60 text-xl font-mono uppercase tracking-widest">
            Coming Soon
          </p>
        </div>
      </FullPageSection>

      <FullPageSection
        widthType="vw"
        className="bg-surface-cream flex items-center justify-center"
      >
        <div className="text-center">
          <h2 className="text-text-primary text-5xl font-bold mb-4">Message</h2>
          <p className="text-text-muted text-xl font-mono uppercase tracking-widest">
            Preparing Contents
          </p>
        </div>
      </FullPageSection>

      <FullPageSection widthType="vw" className="justify-end pb-8">
        <Footer />
      </FullPageSection>
    </FreeHorizontalScrollSection>
  );
}
