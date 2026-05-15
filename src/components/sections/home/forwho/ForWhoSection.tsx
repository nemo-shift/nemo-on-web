import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { FOR_WHO_TOP_SENTENCE, FOR_WHO_PHILOSOPHY } from '@/data/home/forwho';
import ForWhoCarousel, { ForWhoCarouselHandle } from './ForWhoCarousel';
import { cn } from '@/lib/utils';
import { INTERACTION_Z_INDEX } from '@/constants/interaction';
import { useDevice } from '@/context';

export interface ForWhoSectionHandle {
  containerRef: React.RefObject<HTMLElement | null>;
  introTextRef: React.RefObject<HTMLDivElement | null>;
  contentWrapperRef: React.RefObject<HTMLDivElement | null>;
  philosophyRef: React.RefObject<HTMLDivElement | null>; // 철학 문구 ref
  resetCards: () => void; 
}

/**
 * [V12] ForWhoSection (시네마틱 리빌 고도화 버전)
 */
export const ForWhoSection = forwardRef<ForWhoSectionHandle>((_, ref) => {
  const containerRef = useRef<HTMLElement>(null);
  const introTextRef = useRef<HTMLDivElement>(null);
  const contentWrapperRef = useRef<HTMLDivElement>(null);
  const philosophyRef = useRef<HTMLDivElement>(null); // 철학 문구용 ref
  const carouselRef = useRef<ForWhoCarouselHandle>(null); // 캐러셀 제어용 ref
  const { isMobile, isMobileView, isTabletPortrait } = useDevice();

  // 전역 필터링 및 엔진 제어를 위한 핸들 노출
  useImperativeHandle(ref, () => ({
    containerRef,
    introTextRef,
    contentWrapperRef,
    philosophyRef,
    resetCards: () => {
      carouselRef.current?.resetCards();
    }
  }));

  return (
    <section 
      ref={containerRef} 
      id="section-forwho" 
      className="relative w-full h-[1000vh]"
      style={{ backgroundColor: 'transparent' }}
    >

      {/* 섹션 안내 가이드 : 섹션 별 구분 원할때 주석 해제 */}
      {/*<div className="absolute top-0 left-0 w-full border-t border-red-500/50 z-[100] pointer-events-none">
        <span className="absolute top-2 left-4 text-[10px] uppercase font-mono text-red-500/50">Start: ForWho Section</span>
      </div>*/}

      <div 
        className="sticky top-0 left-0 w-full h-screen flex items-center justify-center overflow-hidden"
        style={{ zIndex: INTERACTION_Z_INDEX.Z_CONTENT }}
      >
        {/* 1. 시네마틱 인트로 문구 (Arrival Stage) */}
        <div 
          ref={introTextRef}
          className={cn(
            "absolute z-20 opacity-0 pointer-events-none",
            "text-left select-none",
            // [V57] 아키텍처 기반 기기별 배타적 출발점 (PC/Tablet/Mobile 모두 우측 하단 출발)
            !isMobileView && "left-[60%] bottom-[23%]", // PC: 버스 안 우측 하단 (복원)
            isTabletPortrait && "left-[50%] bottom-[25%]", // Tablet: 우측 하단 (좌측으로 살짝 이동)
            isMobile && "left-[44%] bottom-[25%]" // Mobile: 우측 하단
          )}
          style={{ willChange: 'transform, opacity' }}
        >
          <h2 
            className={cn(
              "text-white font-suit font-bold tracking-tight",
              "text-[clamp(1.1rem,5vw,1.35rem)]", // Mobile
              "tablet-p:text-[clamp(1.5rem,4vw,2.5rem)]", // Tablet Portrait
              "tablet:text-[clamp(2rem,3vw,3rem)]" // PC
            )}
            style={{ 
              lineHeight: 1.4
            }}
          >
            {FOR_WHO_TOP_SENTENCE.split('\n').map((line, i) => (
              <span key={i} className="block">{line}</span>
            ))}
          </h2>
        </div>

        {/* 2. 브랜드 철학 문구 리빌 레이어 (Underneath Carousel) */}
        <div 
          ref={philosophyRef}
          className={cn(
            "absolute inset-0 z-0 opacity-0 pointer-events-none",
            "flex flex-col items-center justify-center text-center px-6"
          )}
          style={{ willChange: 'transform, opacity' }}
        >
          <div className="space-y-4 tablet:space-y-6">
            <p className={cn(
              "font-suit font-medium text-zinc-500 tracking-wider", // 다크 그레이
              "text-lg tablet-p:text-xl tablet:text-2xl"
            )}>
              {FOR_WHO_PHILOSOPHY.line1}
            </p>
            <h2 className={cn(
              "font-suit font-bold text-zinc-900 leading-tight tracking-tight", // 딥 다크
              "text-3xl tablet-p:text-4xl tablet:text-5xl"
            )}>
              {FOR_WHO_PHILOSOPHY.line2}
            </h2>
          </div>
        </div>



        {/* 3. 캐러셀 콘텐츠 래퍼 */}
        <div 
          ref={contentWrapperRef}
          className="absolute inset-0 z-10 opacity-0 pointer-events-none"
          style={{ willChange: 'transform, opacity' }}
        >
          <ForWhoCarousel ref={carouselRef} />
        </div>
      </div>
    </section>
  );
});

ForWhoSection.displayName = 'ForWhoSection';
