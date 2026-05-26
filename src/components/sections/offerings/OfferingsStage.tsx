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
import { OFFERINGS_SCROLL_MULTIPLIERS } from '@/constants/sub-interaction';

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

    // Studio 가로 진입용 초깃값 설정 (왼쪽 -40px 대기)
    gsap.set(['.studio-header', '.studio-title', '.studio-content', '.studio-caps', '.studio-cta'], {
      opacity: 0,
      x: -40,
    });

    // Lab 가로 진입용 초깃값 설정 (오른쪽 40px 대기)
    gsap.set(['.lab-header', '.lab-title', '.lab-content-left', '.lab-content-right', '.lab-cta'], {
      opacity: 0,
      x: 40,
    });

    // Studio & Lab 가로 스위칭 타임라인 생성
    const tl = gsap.timeline({
      scrollTrigger: {
        id: 'offerings-horizontal-trigger',
        trigger: horizontalWrapperRef.current,
        start: 'top top',
        // 스크롤 시 호흡을 뷰포트 너비 만큼 넉넉하게 확장하여 가로 독서 버퍼 시간 확보 (상수 파일 연동)
        end: () => `+=${window.innerWidth * OFFERINGS_SCROLL_MULTIPLIERS.HORIZONTAL_SCROLL_END}`,
        pin: true,
        scrub: true,
        invalidateOnRefresh: true, // 리사이즈 시 좌표 보정
      }
    });

    // 1. 전체 컨테이너 수평 이동 (0.35 ~ 0.65 구간 동안에만 이동)
    // 0.0 ~ 0.35 구간은 Studio 정지 홀딩, 0.65 ~ 1.0 구간은 Lab 정지 홀딩 확보
    tl.to(horizontalContainerRef.current, {
      xPercent: -50,
      ease: 'none',
      duration: 0.3,
    }, 0.35);

    // 2. Studio 텍스트 등장 모션 (0.0 ~ 0.25 구간)
    tl.to('.studio-header', { opacity: 1, x: 0, ease: 'power2.out', duration: 0.1 }, 0)
      .to('.studio-title', { opacity: 1, x: 0, ease: 'power2.out', duration: 0.1 }, 0.05)
      .to('.studio-content', { opacity: 1, x: 0, ease: 'power2.out', duration: 0.1 }, 0.1)
      .to('.studio-caps', { opacity: 1, x: 0, ease: 'power2.out', duration: 0.1 }, 0.1)
      .to('.studio-cta', { opacity: 1, x: 0, ease: 'power2.out', duration: 0.1 }, 0.15);

    // Studio 퇴장 모션 (0.35 ~ 0.5 구간 - 횡이동이 시작되면서 스크롤에 맞춰 왼쪽으로 사라짐)
    tl.to('.studio-header', { opacity: 0, x: -60, ease: 'power2.in', duration: 0.1 }, 0.35)
      .to('.studio-title', { opacity: 0, x: -60, ease: 'power2.in', duration: 0.1 }, 0.38)
      .to('.studio-content', { opacity: 0, x: -60, ease: 'power2.in', duration: 0.1 }, 0.41)
      .to('.studio-caps', { opacity: 0, x: -60, ease: 'power2.in', duration: 0.1 }, 0.41)
      .to('.studio-cta', { opacity: 0, x: -60, ease: 'power2.in', duration: 0.1 }, 0.44);

    // 3. Lab 등장 모션 (0.65 ~ 0.85 구간 - 횡이동 완료 후 정지된 상태에서 서서히 안착)
    tl.to('.lab-header', { opacity: 1, x: 0, ease: 'power2.out', duration: 0.1 }, 0.65)
      .to('.lab-title', { opacity: 1, x: 0, ease: 'power2.out', duration: 0.1 }, 0.7)
      .to('.lab-content-left', { opacity: 1, x: 0, ease: 'power2.out', duration: 0.1 }, 0.75)
      .to('.lab-content-right', { opacity: 1, x: 0, ease: 'power2.out', duration: 0.1 }, 0.75)
      .to('.lab-cta', { opacity: 1, x: 0, ease: 'power2.out', duration: 0.1 }, 0.8);

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
