import React from 'react';

export const BrandStorySection = () => {
  return (
    <section 
      className="relative w-full min-h-screen py-64 flex flex-col items-center justify-center"
      style={{ backgroundColor: 'var(--bg, #faf7f2)' }}
    >
      {/* [임시] 섹션 시작 가이드라인 */}
      <div className="absolute top-0 left-0 w-full border-t border-red-500/50 z-[100] pointer-events-none">
        <span className="absolute top-2 left-4 text-[10px] uppercase font-mono text-red-500/50">Start: BrandStory Section</span>
      </div>
      <h2 className="text-4xl md:text-5xl font-bold text-[#0D1A1F]/20 uppercase tracking-[0.2em] text-center">
        Brand Story
      </h2>
    </section>
  );
};
