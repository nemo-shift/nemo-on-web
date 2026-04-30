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

        {/* [DEPLOY-DELETE] : 배포 전 반드시 삭제 (섹션 안내 가이드) */}
        <div className="absolute top-0 left-0 w-full border-t border-red-500/50 z-[100] pointer-events-none">
          <span className="absolute top-2 left-4 text-[10px] uppercase font-mono text-red-500/50">Start: BrandStory Section</span>
        </div>

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
              'absolute top-24 font-bold text-[#0D1A1F]/20 uppercase tracking-[0.2em] text-center transition-all duration-500',
              'text-4xl',                         // Mobile
              'tablet-p:text-5xl',                 // 744px
              'tablet:text-5xl',                   // 992px
              'desktop-wide:text-6xl',             // 1440px
              'desktop-cap:text-7xl'               // 1920px
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
                  "font-suit font-medium leading-relaxed text-center whitespace-pre-wrap transition-colors duration-500",
                  "mx-auto",
                  // [Tier 1] Mobile
                  "text-base max-w-[85vw]",
                  // [Tier 2] Tablet Portrait
                  "tablet-p:text-xl tablet-p:max-w-[75vw]",
                  // [Tier 3] The Rest (PC/Landscape)
                  "tablet:text-2xl tablet:max-w-[800px]",
                  idx === 0 || idx === 3 ? "text-white" : "text-white"
                )}>
                  {idx === 3 ? (
                    <>
                      <span id="story-text-4">{item.content}</span>
                      <span id="story-cursor-4" className="text-[#00FF41] animate-terminal-cursor font-mono text-xl tablet-p:text-2xl tablet:text-3xl" style={{ display: 'none', marginLeft: '2px' }}>|</span>
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
