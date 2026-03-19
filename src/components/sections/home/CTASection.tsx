import React from 'react';
import { COLORS } from '@/constants/colors';

export const CTASection = () => {
  return (
    <section 
      className="relative w-full min-h-screen flex flex-col items-center justify-center overflow-hidden"
      style={{ backgroundColor: 'var(--bg, #0D1A1F)' }}
    >
      {/* [임시] 섹션 시작 가이드라인 */}
      <div className="absolute top-0 left-0 w-full border-t border-red-500/50 z-[100] pointer-events-none">
        <span className="absolute top-2 left-4 text-[10px] uppercase font-mono text-red-500/50">Start: CTA Section</span>
      </div>
      <h2 className="text-4xl md:text-7xl font-bold text-white/10 uppercase tracking-[0.2em] text-center">
        CTA Section
      </h2>
    </section>
  );
};
