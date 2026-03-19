import React, { useRef } from 'react';
import Image from 'next/image';
import { FOR_WHO_LIST } from '@/data/home/forwho';

export const ForWhoSection = () => {
  const containerRef = useRef<HTMLElement>(null);
  
  return (
    <section 
      ref={containerRef} 
      id="section-forwho" 
      className="relative w-full h-[1000vh]"
      style={{ backgroundColor: 'transparent' }}
    >
      {/* [임시] 섹션 시작 가이드라인 */}
      <div className="absolute top-0 left-0 w-full border-t border-red-500/50 z-[100] pointer-events-none">
        <span className="absolute top-2 left-4 text-[10px] uppercase font-mono text-red-500/50">Start: ForWho Section</span>
      </div>
      <div 
        className="sticky top-0 left-0 w-full h-screen flex items-center justify-center overflow-hidden"
        style={{ zIndex: 20 }}
      >
        <h2 className="text-4xl md:text-6xl font-bold text-black/12 uppercase tracking-[0.2em]">
          Target Audience
        </h2>
      </div>
    </section>
  );
};
