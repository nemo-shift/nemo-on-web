'use client';

import React, { useEffect } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SmoothScroll from '@/components/layout/SmoothScroll';
import { useHeroContext } from '@/context';
import AboutHero from './hero/AboutHero';
import AboutPhilosophy from './philosophy/AboutPhilosophy';
import AboutMeaning from './meaning/AboutMeaning';
import AboutPromise from './promise/AboutPromise';
import { INTERACTION_Z_INDEX } from '@/constants/interaction';

export default function AboutStage() {
  const { toggle, setIsScrollable, footerHeight } = useHeroContext();

  useEffect(() => {
    // About 페이지는 구조적으로 스크롤이 가능해야 함 (홈페이지의 스크롤 잠금 해제)
    toggle();
    setIsScrollable(true);

    // [Perfect Stacking Sync] 모든 서브 섹션들이 확실히 마운트된 직후,
    // 브라우저의 ScrollTrigger 물리 좌표 측정을 한 번 더 갱신하여 레이아웃 꼬임을 완벽 예방합니다.
    requestAnimationFrame(() => {
      ScrollTrigger.refresh();
    });
  }, [toggle, setIsScrollable]);

  return (
    <main id="about-stage" className="relative z-[1] w-full">
      {/* 콘텐츠 영역 (여기에만 배경색을 지정해야 하단 스페이서가 투명해집니다) */}
      <div className="relative w-full bg-[#f7f1e9]">
        
        {/* 1. Hero Section */}
        <AboutHero />

        {/* 2. Sections Wrapper (For Stacking Overlay) */}
        <div 
          id="about-sections-wrapper" 
          className="relative w-full"
          style={{ zIndex: INTERACTION_Z_INDEX.Z_CONTENT }}
        >
          <AboutPhilosophy />
          <AboutMeaning />
          <AboutPromise />
        </div>
        
      </div>
      
      {/* 3. 푸터 리빌을 위한 투명 스페이서 (Native Reveal 런웨이) */}
      <div 
        className="relative w-full bg-transparent pointer-events-none" 
        style={{ height: footerHeight || '25vh' }}
      />
    </main>
  );
}
