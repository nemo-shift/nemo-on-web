import React from 'react';
import { COLORS } from '@/constants/colors';
import { cn } from '@/lib/utils';

export const CTASection = () => {
  return (
    <section 
      id="section-cta"
      className="relative w-full h-[100vh] flex flex-col items-center justify-center overflow-hidden bg-[#0D1A1F]"
    >
      {/* [DEPLOY-DELETE] : 배포 전 반드시 삭제 (섹션 안내 가이드) */}
      {/* <div className="absolute top-0 left-0 w-full border-t border-red-500/50 z-[100] pointer-events-none">
        <span className="absolute top-2 left-4 text-[10px] uppercase font-mono text-red-500/50">Start: CTA Section</span>
      </div> */}
      
      <div 
        id="cta-content"
        className="container mx-auto px-6 tablet-p:px-8 tablet:px-10 desktop-wide:px-12 desktop-cap:px-16 flex flex-col items-center relative"
      >
        {/* 터미널 메시지 영역 */}
        {/* [V12] 3단계 반응형 뼈대 (Mobile / Tablet Portrait / PC) */}
        <div className={cn(
          "flex flex-col items-start mx-auto w-full",
          "max-w-[90vw]",                  // Tier 1: Mobile
          "tablet-p:max-w-[80vw]",         // Tier 2: Tablet Portrait
          "tablet:max-w-[700px]",          // Tier 3: The Rest (PC/Landscape)
          "space-y-4 tablet-p:space-y-6",
          "min-h-[160px] tablet-p:min-h-[200px] tablet:min-h-[240px]"
        )}>
          {[1, 2, 3].map((num) => (
            <div key={num} className="flex items-start justify-start min-h-[1.5em] w-full">
              <p 
                id={`cta-msg-${num}`} 
                className={cn(
                  "font-mono font-medium leading-relaxed text-left whitespace-pre-wrap",
                  "text-base",                     // Tier 1
                  "tablet-p:text-xl",               // Tier 2
                  "tablet:text-2xl",                // Tier 3
                  "text-[#00FF41]"
                )}
              >
                {/* GSAP에서 텍스트를 채워 넣을 공간 */}
              </p>
              {/* 마지막 라인에만 깜빡이는 커서 배치 */}
              {num === 3 && (
                <span id="cta-terminal-cursor" className="text-[#00FF41] animate-terminal-cursor font-mono ml-2 text-xl tablet-p:text-2xl tablet:text-3xl" style={{ display: 'none' }}>|</span>
              )}
            </div>
          ))}
        </div>

        {/* YES/NO 버튼 영역 (반응형 뼈대) */}
        <div 
          id="cta-buttons" 
          className={cn(
            "mt-12 tablet-p:mt-16 flex items-center justify-center opacity-0 translate-y-8",
            "space-x-6",                    // Tier 1
            "tablet-p:space-x-10",           // Tier 2
            "tablet:space-x-16"              // Tier 3
          )}
        >
          <button className="group relative px-8 tablet-p:px-10 py-3 border border-[#00FF41]/40 hover:border-[#00FF41] transition-all duration-300">
            <span className="relative z-10 font-mono text-[#00FF41] text-lg tablet-p:text-xl tracking-widest">YES</span>
            <div className="absolute inset-0 bg-[#00FF41]/0 group-hover:bg-[#00FF41]/10 transition-all duration-300" />
          </button>
          <button className="group relative px-8 tablet-p:px-10 py-3 border border-white/20 hover:border-white/40 transition-all duration-300 opacity-50 hover:opacity-100">
            <span className="relative z-10 font-mono text-white text-lg tablet-p:text-xl tracking-widest">NO</span>
          </button>
        </div>
      </div>
    </section>
  );
};
