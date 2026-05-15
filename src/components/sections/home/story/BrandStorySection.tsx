import React from 'react';
import { cn } from '@/lib/utils';
import { BRAND_STORY_CONTENT } from '@/data/home/story';

export const BrandStorySection = () => {
  return (
    <section 
      id="section-brand-story"
      className="relative w-full h-[400vh] overflow-visible"
      style={{ backgroundColor: 'transparent' }}
    >
      <div className="sticky top-0 left-0 w-full h-screen flex flex-col items-center justify-center overflow-hidden" style={{ backgroundColor: 'var(--bg, #faf7f2)' }}>
        {/* [NEW] 물리적 분할 배경 패널 (화이트) */}
        <div 
          id="story-bg-white"
          className="absolute inset-0 opacity-0 pointer-events-none"
          style={{ zIndex: 0, backgroundColor: '#faf7f2' }}
        />

        {/* 섹션 안내 가이드 : 섹션 별 구분 원할때 주석 해제 */}
        {/*<div className="absolute top-0 left-0 w-full border-t border-red-500/50 z-[100] pointer-events-none">
          <span className="absolute top-2 left-4 text-[10px] uppercase font-mono text-red-500/50">Start: BrandStory Section</span>
        </div>*/}

        <div 
          /* [V11.33] 전역 표준 5축 패딩 적용 */
          className="container mx-auto px-6 tablet-p:px-8 tablet:px-10 desktop-wide:px-12 desktop-cap:px-16 relative flex flex-col items-center h-full justify-center"
          /* [V11.4] Shared Nemo(20)보다 위로 올리기 위해 30 설정 (X-Ray 효과용) */
          style={{ zIndex: 30 }}
        >
          {/* 기존 타이틀 보존 */}
          <h2 
            id="story-title"
            className={cn(
              'absolute top-1/2 -translate-y-1/2 rotate-90 font-bold text-[#0D1A1F]/20 uppercase tracking-[0.2em] whitespace-nowrap transition-all duration-500',
              'right-[-85px]',                    // Mobile: 더 오른쪽으로
              'tablet-p:right-[-120px]',            // Tablet Portrait: 더 오른쪽으로
              'tablet:right-[-40px]',              // PC (Tablet 이상): 기존 유지
              'desktop-wide:right-[-60px]',        // PC (Wide): 기존 유지
              'text-4xl',
              'tablet-p:text-5xl',
              'tablet:text-5xl',
              'desktop-wide:text-6xl',
              'desktop-cap:text-7xl'
            )}
          >
            Brand Story
          </h2>

          {/* [NEW] 4단계 단락 콘텐츠 매핑 */}
          <div className="relative w-full h-[40vh] flex items-center justify-center">
            {BRAND_STORY_CONTENT.map((item, idx) => (
              <div
                key={item.id}
                id={`story-paragraph-${idx + 1}`}
                className="absolute inset-0 flex items-center justify-center opacity-0 translate-y-8"
              >
                <p className={cn(
                  "font-suit font-medium leading-relaxed whitespace-pre-wrap transition-colors duration-500",
                  "mx-auto",
                  // [V66.UX] 1-1은 왼쪽 정렬, 1-2는 오른쪽 정렬, 나머지는 중앙 정렬
                  idx === 0 ? "text-left" : (idx === 1 ? "text-right" : "text-center"),
                  // [Tier 1] Mobile
                  "text-base max-w-[85vw]",
                  // [Tier 2] Tablet Portrait
                  "tablet-p:text-xl tablet-p:max-w-[75vw]",
                  // [Tier 3] The Rest (PC/Landscape)
                  "tablet:text-2xl tablet:max-w-[800px]",
                  "text-white"
                )}>
                  {idx === 5 ? (
                    <>
                      <span id="story-text-6">{item.content}</span>
                      <span id="story-cursor-6" className="text-[#00FF41] animate-terminal-cursor font-mono text-xl tablet-p:text-2xl tablet:text-3xl" style={{ display: 'none', marginLeft: '2px' }}>|</span>
                    </>
                  ) : item.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
