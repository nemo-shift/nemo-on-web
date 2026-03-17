import React from 'react';
import HomeStage from '@/components/sections/home/HomeStage';

/**
 * 홈페이지 (Server Component)
 * 클라이언트 로직은 HomeClient에서 처리
 */
export default function HomePage(): React.ReactElement {
  return (
    <div>
      <HomeStage />
    </div>
  );
}
