// [V69.LaunchReady] STEP 4
import { Metadata } from 'next';
import React from 'react';
import AboutStage from '@/components/sections/about/AboutStage';

export const metadata: Metadata = {
  title: 'nemo:on 소개',
  description: 'nemo:on이 추구하는 브랜드 철학과 비전을 소개합니다. 불안한 안녕, 기준은 언제나 당신.',
  openGraph: { url: '/about' },
};

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
