import React from 'react';
import { cn } from '@/lib/utils';

export const BrandStorySection = () => {
  return (
    <section 
      className="relative w-full min-h-screen py-64 flex flex-col items-center justify-center"
      style={{ backgroundColor: 'var(--bg, #faf7f2)' }}
    >
      {/* [임시] 섹션 시작 가이드라인 */}
      <div className="absolute top-0 left-0 w-full border-t border-red-500/50 z-[100] pointer-events-none">
        {/* [DEPLOY-DELETE] : 배포 전 반드시 삭제 (섹션 안내 가이드) */}
        <span className="absolute top-2 left-4 text-[10px] uppercase font-mono text-red-500/50">Start: BrandStory Section</span>
      </div>
      <div 
        /* [V11.33] 전역 표준 5축 패딩 적용 */
        className="container mx-auto px-6 tablet-p:px-8 tablet:px-10 desktop-wide:px-12 desktop-cap:px-16 flex flex-col items-center"
      >
        <h2 
          /* [V11.33] 섹션 상징 문구 5단계 정문화 표준 프리셋 적용 */
          className={cn(
            'font-bold text-[#0D1A1F]/20 uppercase tracking-[0.2em] text-center transition-all duration-500',
            'text-4xl',                         // Mobile
            'tablet-p:text-5xl',                 // 744px
            'tablet:text-5xl',                   // 992px
            'desktop-wide:text-6xl',             // 1440px
            'desktop-cap:text-7xl'               // 1920px
          )}
        >
          Brand Story
        </h2>
      </div>
    </section>
  );
};
