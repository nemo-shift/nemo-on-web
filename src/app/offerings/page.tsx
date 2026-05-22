import React from 'react';
import OfferingsStage from '@/components/sections/offerings/OfferingsStage';

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
