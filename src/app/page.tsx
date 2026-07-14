// [V69.LaunchReady] STEP 4
import { Metadata } from 'next';
import React from 'react';
import HomeStage from '@/components/sections/home/HomeStage';

export const metadata: Metadata = {
  title: { absolute: 'nemo:on — 브랜드를 켜다' },
  description: '감성 위에 구조를 더해 당신의 브랜드를 단단하게 만드는 스튜디오. nemo:on이 함께합니다.',
  alternates: { canonical: 'https://www.nemoon.co' },
};

/**
 * 홈페이지 (Server Component)
 * 스크롤 인터랙션은 HomeStage에서 처리
 */
export default function HomePage(): React.ReactElement {
  return (
    <div>
      <HomeStage />
    </div>
  );
}
