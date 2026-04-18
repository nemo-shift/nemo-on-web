import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { FOR_WHO_TOP_SENTENCE } from '@/data/home/forwho';
import ForWhoCarousel from './ForWhoCarousel';
import { cn } from '@/lib/utils';
import { INTERACTION_Z_INDEX } from '@/constants/interaction';

export interface ForWhoSectionHandle {
  containerRef: React.RefObject<HTMLElement | null>;
  introTextRef: React.RefObject<HTMLDivElement | null>;
  contentWrapperRef: React.RefObject<HTMLDivElement | null>;
}

/**
 * [V11.82] ForWhoSection (시네마틱 인트로 & 토글 캐러셀 스테이지)
 */
export const ForWhoSection = forwardRef<ForWhoSectionHandle>((_, ref) => {
  const containerRef = useRef<HTMLElement>(null);
  const introTextRef = useRef<HTMLDivElement>(null);
  const contentWrapperRef = useRef<HTMLDivElement>(null);

  // 전역 필터링 및 엔진 제어를 위한 핸들 노출
  useImperativeHandle(ref, () => ({
    containerRef,
    introTextRef,
    contentWrapperRef
  }));

  return (
    <section 
      ref={containerRef} 
      id="section-forwho" 
      className="relative w-full h-[1000vh]"
      style={{ backgroundColor: 'transparent' }}
    >
      {/* [DEPLOY-DELETE] : 배포 전 반드시 삭제 (섹션 안내 가이드) */}
      <div className="absolute top-0 left-0 w-full border-t border-red-500/50 z-[100] pointer-events-none">
        <span className="absolute top-2 left-4 text-[10px] uppercase font-mono text-red-500/50">Start: ForWho Section</span>
      </div>
      <div 
        className="sticky top-0 left-0 w-full h-screen flex items-center justify-center overflow-hidden"
        style={{ zIndex: INTERACTION_Z_INDEX.Z_CONTENT }}
      >
        {/* Step B: 시네마틱 인트로 문구 (Arrival Stage) */}
        <div 
          ref={introTextRef}
          className={cn(
            "absolute z-20 opacity-0 transition-opacity duration-300",
            "right-[10%] tablet:right-[15%] desktop-wide:right-[20%]",
            "text-right select-none"
          )}
        >
          <div className="relative px-8 py-6 rounded-2xl overflow-hidden">
            {/* Trendy Backdrop Blur Layer */}
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

        {/* Step C: 캐러셀 프레임 및 메인 콘텐츠 */}
        <div 
          ref={contentWrapperRef}
          className="absolute inset-0 z-10 opacity-0 pointer-events-none"
        >
          <ForWhoCarousel />
        </div>
      </div>
    </section>
  );
});

ForWhoSection.displayName = 'ForWhoSection';
