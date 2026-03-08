import React from 'react';
import HomeClient from '@/components/sections/home/HomeClient';

/**
 * 홈페이지 (Server Component)
 * 클라이언트 로직은 HomeClient에서 처리
 */
export default function HomePage(): React.ReactElement {
  return (
    <div>
      <HomeClient />
    </div>
  );
}
