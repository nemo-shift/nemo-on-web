'use client';

import React, { useEffect } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SmoothScroll from '@/components/layout/SmoothScroll';
import { useHeroContext, useDevice } from '@/context';
import AboutHero from './hero/AboutHero';
import AboutPhilosophy from './philosophy/AboutPhilosophy';
import AboutMeaning from './meaning/AboutMeaning';
import AboutPromise from './promise/AboutPromise';
import { INTERACTION_Z_INDEX } from '@/constants/interaction';

export default function AboutStage() {
  const { toggle, setIsScrollable, footerHeight } = useHeroContext();
  const { interactionMode } = useDevice();

  useEffect(() => {
    // About 페이지는 구조적으로 스크롤이 가능해야 함 (홈페이지의 스크롤 잠금 해제)
    toggle();
    setIsScrollable(true);

    // [v26.98 UI Detail] 모바일 터치 관성 스크롤을 제어하여 핀 꼬임을 1차 방어 (홈페이지 싱크)
    if (interactionMode === 'touch') {
      ScrollTrigger.normalizeScroll({
        allowNestedScroll: true,
        momentum: 0
      });
    }

    // [Perfect Stacking Sync] 모든 서브 섹션들이 확실히 마운트된 직후,
    // 브라우저의 ScrollTrigger 물리 좌표 측정을 한 번 더 갱신하여 레이아웃 꼬임을 완벽 예방합니다.
    requestAnimationFrame(() => {
      ScrollTrigger.refresh();
    });

    // [Side-effect Free] 어바웃 페이지 이탈 시 전역 터치 정규화 설정을 해제하여 타 페이지로의 전염을 원천 차단
    return () => {
      ScrollTrigger.normalizeScroll(false);
    };
  }, [toggle, setIsScrollable, interactionMode]);

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
