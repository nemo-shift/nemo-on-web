'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform, MotionValue } from 'framer-motion';
import { COLORS } from '@/constants/colors';

export const MessageSection = () => {
  const containerRef = useRef<HTMLElement>(null);
  
  return (
    <section 
      ref={containerRef} 
      id="section-message" 
      className="relative w-full h-[800vh]"
      style={{ backgroundColor: 'transparent' }}
    >
      {/* [임시] 섹션 시작 가이드라인 */}
      <div className="absolute top-0 left-0 w-full border-t border-red-500/50 z-[100] pointer-events-none">
        <span className="absolute top-2 left-4 text-[10px] uppercase font-mono text-red-500/50">Start: Message Section</span>
      </div>
      <div 
        className="sticky top-0 left-0 w-full h-screen flex items-center justify-center overflow-hidden"
        style={{ zIndex: 20 }}
      >
        <h2 className="text-4xl md:text-6xl font-bold text-black/12 uppercase tracking-[0.2em]">
          Core Message
        </h2>
      </div>
    </section>
  );
};
