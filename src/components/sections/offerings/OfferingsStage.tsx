'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import { useHeroContext } from '@/context';
import OfferingsHero from './hero/OfferingsHero';
import OfferingsIntro from './intro/OfferingsIntro';
import OfferingsStudio from './studio/OfferingsStudio';
import OfferingsLab from './lab/OfferingsLab';
import OfferingsOutro from './outro/OfferingsOutro';
import { INTERACTION_Z_INDEX } from '@/constants/interaction';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

export default function OfferingsStage() {
  const { toggle, setIsScrollable, footerHeight } = useHeroContext();
  const horizontalWrapperRef = useRef<HTMLDivElement>(null);
  const horizontalContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 홈페이지의 스크롤 잠금을 해제하고, 오퍼링 페이지는 자유로운 스크롤이 되도록 함
    toggle();
    setIsScrollable(true);

    // 컴포넌트 마운트 직후 ScrollTrigger 좌표 측정 갱신
    requestAnimationFrame(() => {
      ScrollTrigger.refresh();
    });
  }, [toggle, setIsScrollable]);

  useGSAP(() => {
    if (!horizontalWrapperRef.current || !horizontalContainerRef.current) return;

    // Studio & Lab 가로 스위칭 타임라인 생성
    const tl = gsap.timeline({
      scrollTrigger: {
        id: 'offerings-horizontal-trigger',
        trigger: horizontalWrapperRef.current,
        start: 'top top',
        // 스크롤 시 호흡을 1.5배의 뷰포트 너비 만큼 유지하여 가로 스크롤이 매끄럽게 흐르도록 설정
        end: () => `+=${window.innerWidth * 1.5}`,
        pin: true,
        scrub: true,
        invalidateOnRefresh: true, // 리사이즈 시 좌표 보정
      }
    });

    // 2개의 섹션(Studio, Lab)이 50%씩 차지하고 있으므로 xPercent: -50으로 이동하면
    // Studio 화면에서 Lab 화면으로 가로 전환됩니다.
    tl.to(horizontalContainerRef.current, {
      xPercent: -50,
      ease: 'none',
    });

  }, { scope: horizontalWrapperRef });

  return (
    <main id="offerings-stage" className="relative z-[1] w-full">
      {/* 콘텐츠 전체 컨테이너 */}
      <div className="relative w-full bg-[#f8f9fa] text-[#0d1a1f]">
        
        {/* 1. Hero Section */}
        <OfferingsHero />

        {/* 2. Sections Wrapper (스태킹 및 수평 슬라이딩을 위한 흐름) */}
        <div 
          id="offerings-sections-wrapper" 
          className="relative w-full"
          style={{ zIndex: INTERACTION_Z_INDEX.Z_CONTENT }}
        >
          {/* Intro Section */}
          <OfferingsIntro />

          {/* Studio & Lab Section (수평 스위칭 영역) */}
          <div 
            ref={horizontalWrapperRef}
            id="offerings-horizontal-wrapper" 
            className="relative w-full overflow-hidden"
          >
            <div 
              ref={horizontalContainerRef}
              className="flex flex-row w-[200vw] h-screen overflow-hidden"
            >
              <OfferingsStudio />
              <OfferingsLab />
            </div>
          </div>

          {/* Outro Section */}
          <OfferingsOutro />
        </div>
        
      </div>
      
      {/* 푸터 리빌을 위한 스페이서 */}
      <div 
        className="relative w-full bg-transparent pointer-events-none" 
        style={{ height: footerHeight || '25vh' }}
      />
    </main>
  );
}
