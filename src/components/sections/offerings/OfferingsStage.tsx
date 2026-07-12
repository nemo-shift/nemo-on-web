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
import SubpageScrollHint from '@/components/ui/SubpageScrollHint';
import { OFFERINGS_SCROLL_MULTIPLIERS } from '@/constants/sub-interaction';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

export default function OfferingsStage() {
  const { toggle, setIsScrollable } = useHeroContext();
  const stageContainerRef = useRef<HTMLDivElement>(null); // 🆕 배경 전체를 감싸는 돔 참조용 ref 추가
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
    if (!stageContainerRef.current || !horizontalWrapperRef.current || !horizontalContainerRef.current) return;

    // ─────────────────────────────────────────────
    // 🎨 [Master Color Morphing] 스크롤 양방향 배경색 변환 엔진 구축
    // ─────────────────────────────────────────────
    
    // 0. 초기화: PRELUDE는 가장 정갈한 퓨어 흰색으로 시작
    gsap.set(stageContainerRef.current, { backgroundColor: '#ffffff', transition: 'background-color 0.8s ease-out' });

    // 1. WHAT WE DO 섹션 진입 시 (60% 영역 확보 시): 소프트 아이보리로 서서히 페이드
    ScrollTrigger.create({
      trigger: '.intro-wwd-label',
      start: 'top 60%',
      onEnter: () => {
        gsap.to(stageContainerRef.current, {
          backgroundColor: '#f7f1e9', // 소프트 아이보리
          duration: 0.8,
          ease: 'power2.out',
          overwrite: 'auto'
        });
      },
      onLeaveBack: () => {
        gsap.to(stageContainerRef.current, {
          backgroundColor: '#ffffff', // 롤백 시 다시 PRELUDE 퓨어 화이트 복원
          duration: 0.8,
          ease: 'power2.out',
          overwrite: 'auto'
        });
      }
    });

    // 2. STUDIO 가로 섹션 진입 시 (가로 래퍼가 화면의 60%에 닿을 때): 고품격 딥 다크 에메랄드
    ScrollTrigger.create({
      trigger: horizontalWrapperRef.current,
      start: 'top 60%',
      onEnter: () => {
        gsap.to(stageContainerRef.current, {
          backgroundColor: '#0d1a1f', // 딥 다크
          duration: 0.8,
          ease: 'power2.out',
          overwrite: 'auto'
        });
      },
      onLeaveBack: () => {
        gsap.to(stageContainerRef.current, {
          backgroundColor: '#f7f1e9', // 롤백 시 다시 WHAT WE DO 소프트 아이보리 복원
          duration: 0.8,
          ease: 'power2.out',
          overwrite: 'auto'
        });
      }
    });

    // 3. LAB 가로 섹션 진입 시 (가로 타임라인의 스크롤 중반부 이후 횡이동이 시작된 지점): 퓨어 라이트 그레이
    // Studio & Lab 가로 스위칭 타임라인에 직접 연동하여 횡이동이 가동되는 시점(0.35 근방)에 동시 변환하도록 엮음
    
    // 4. OUTRO 섹션 진입 시 (아웃트로 헤더가 화면의 60%에 도달 시): 정갈한 퓨어 화이트 회귀
    ScrollTrigger.create({
      trigger: '.outro-label',
      start: 'top 60%',
      onEnter: () => {
        gsap.to(stageContainerRef.current, {
          backgroundColor: '#ffffff', // 퓨어 화이트
          duration: 0.8,
          ease: 'power2.out',
          overwrite: 'auto'
        });
      },
      onLeaveBack: () => {
        gsap.to(stageContainerRef.current, {
          backgroundColor: '#e2e8f0', // 롤백 시 다시 LAB 뚜렷한 스토니 그레이(#e2e8f0) 복원
          duration: 0.8,
          ease: 'power2.out',
          overwrite: 'auto'
        });
      }
    });

    // ─────────────────────────────────────────────
    // 가로 스크롤 및 컴포넌트 내부 모션 제어
    // ─────────────────────────────────────────────
    
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

    // 🆕 횡이동이 시작되면서 가로 스크롤 타임라인 중반부에 도달하면 배경색을 LAB의 원래 고유 아이덴티티 색상인 뚜렷한 스토니 그레이(#e2e8f0)로 선명하게 모핑 전이
    tl.to(stageContainerRef.current, {
      backgroundColor: '#e2e8f0',
      duration: 0.15,
      ease: 'power2.inOut',
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

  }, { scope: stageContainerRef }); // 🆕 돔 스코프를 전체 배경 컨테이너로 매핑

  return (
    <div id="offerings-stage" className="relative z-[1] w-full">
      {/* [V75/STEP D] Offerings 전용 스크롤 힌트 — 하단 근접 시 자동 소멸 */}
      <SubpageScrollHint />
      {/* 콘텐츠 전체 컨테이너 (여기에 ref를 걸어 스크롤 60% 시점마다 배경색이 스르륵 흐르도록 보장) */}
      <div 
        ref={stageContainerRef}
        className="relative w-full text-[#0d1a1f]"
        style={{ transition: 'background-color 0.8s ease-out' }}
      >
        
        {/* 1. Hero Section */}
        <OfferingsHero />

        {/* 2. Sections Wrapper (스태킹 및 수평 슬라이딩을 위한 흐름) */}
        <div 
          id="offerings-sections-wrapper" 
          className="relative w-full bg-transparent" // 🆕 배경이 투명하게 비치도록 투명화 조치
          style={{ zIndex: INTERACTION_Z_INDEX.Z_CONTENT }}
        >
          {/* Intro Section */}
          <OfferingsIntro />

          {/* Studio & Lab Section (수평 스위칭 영역) */}
          <div 
            ref={horizontalWrapperRef}
            id="offerings-horizontal-wrapper" 
            className="relative w-full overflow-hidden bg-transparent" // 🆕 투명화
          >
            <div 
              ref={horizontalContainerRef}
              className="flex flex-row w-[200vw] h-screen overflow-hidden bg-transparent" // 🆕 투명화
            >
              <OfferingsStudio />
              <OfferingsLab />
            </div>
          </div>

          {/* Outro Section */}
          <OfferingsOutro />
        </div>

      </div>
    </div>
  );
}
