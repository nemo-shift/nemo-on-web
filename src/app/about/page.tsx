import React from 'react';
import AboutStage from '@/components/sections/about/AboutStage';

/**
 * /about 페이지
 * 네모:ON의 철학과 브랜드 스토리를 담은 소개 페이지
 * @see docs/strategy/about-spec.md
 */
export default function AboutPage(): React.ReactElement {
  return (
    <div>
      <AboutStage />
    </div>
  );
}
