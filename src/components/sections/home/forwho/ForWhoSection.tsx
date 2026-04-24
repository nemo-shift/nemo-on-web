import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { FOR_WHO_TOP_SENTENCE, FOR_WHO_PHILOSOPHY } from '@/data/home/forwho';
import ForWhoCarousel, { ForWhoCarouselHandle } from './ForWhoCarousel';
import { cn } from '@/lib/utils';
import { INTERACTION_Z_INDEX } from '@/constants/interaction';

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
      <div 
        className="sticky top-0 left-0 w-full h-screen flex items-center justify-center overflow-hidden"
        style={{ zIndex: INTERACTION_Z_INDEX.Z_CONTENT }}
      >
        {/* 1. 시네마틱 인트로 문구 (Arrival Stage) */}
        <div 
          ref={introTextRef}
          className={cn(
            "absolute z-20 opacity-0 pointer-events-none",
            "right-[10%] tablet:right-[15%] desktop-wide:right-[20%]",
            "text-right select-none translate-y-8"
          )}
        >
          <div className="relative px-8 py-6 rounded-2xl overflow-hidden">
            <div className="absolute inset-0 bg-black/10 backdrop-blur-md" />
            <h3 className={cn(
              "relative font-suit leading-tight tracking-tight text-white",
              "text-2xl tablet-p:text-3xl tablet:text-4xl desktop-wide:text-5xl"
            )}>
              {FOR_WHO_TOP_SENTENCE.split(' ').map((word, i) => (
                <span key={i} className="inline-block mr-[0.3em] last:mr-0">
                  {word}
                </span>
              ))}
            </h3>
          </div>
        </div>

        {/* 2. 브랜드 철학 문구 리빌 레이어 (Underneath Carousel) */}
        <div 
          ref={philosophyRef}
          className={cn(
            "absolute inset-0 z-0 opacity-0 pointer-events-none",
            "flex flex-col items-center justify-center text-center px-6"
          )}
        >
          <div className="space-y-4 tablet:space-y-6">
            <p className={cn(
              "font-suit font-medium text-zinc-500 tracking-wider", // 다크 그레이
              "text-lg tablet:text-xl desktop:text-2xl"
            )}>
              {FOR_WHO_PHILOSOPHY.line1}
            </p>
            <h2 className={cn(
              "font-suit font-bold text-zinc-900 leading-tight tracking-tight", // 딥 다크
              "text-3xl tablet:text-4xl desktop:text-5xl desktop-wide:text-6xl"
            )}>
              {FOR_WHO_PHILOSOPHY.line2}
            </h2>
          </div>
        </div>



        {/* 3. 캐러셀 콘텐츠 래퍼 */}
        <div 
          ref={contentWrapperRef}
          className="absolute inset-0 z-10 opacity-0 pointer-events-none"
        >
          <ForWhoCarousel ref={carouselRef} />
        </div>
      </div>
    </section>
  );
});

ForWhoSection.displayName = 'ForWhoSection';
