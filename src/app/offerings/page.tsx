// [V69.LaunchReady] STEP 4
import { Metadata } from 'next';
import React from 'react';
import OfferingsStage from '@/components/sections/offerings/OfferingsStage';

export const metadata: Metadata = {
  title: '서비스',
  description: '브랜딩부터 개발까지, nemo:on Studio와 Lab의 서비스를 만나보세요.',
  openGraph: { url: '/offerings' },
};

/**
 * /offerings 페이지
 * 네모:ON의 Studio 및 Lab 서비스 구조와 철학을 소개하는 허브 페이지
 * @see docs/content/pages/3.Offerings.md
 */
export default function OfferingsPage(): React.ReactElement {
  return (
    <div>
      <OfferingsStage />
    </div>
  );
}
