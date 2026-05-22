'use client';

import React from 'react';
import { OFFERINGS_DATA } from '@/data/offerings';

export default function OfferingsOutro() {
  const data = OFFERINGS_DATA.closing;

  return (
    <section 
      id="offerings-outro"
      className="relative w-full min-h-screen py-32 px-6 sm:px-12 md:px-24 flex flex-col justify-center bg-white text-[#0d1a1f]"
    >
      <div className="max-w-4xl mx-auto w-full text-center flex flex-col gap-12">
        
        {/* 아웃트로 라벨 */}
        <span className="text-xs sm:text-sm font-semibold tracking-[0.25em] uppercase text-cyan-600">
          NEMO:ON ESSENCE
        </span>

        {/* 메인 슬로건 */}
        <h3 className="text-[clamp(28px,4.5vw,56px)] font-bold leading-tight tracking-tight text-[#0d1a1f] whitespace-pre-line">
          {data.mainCopy}
        </h3>

        {/* 구분 바 */}
        <div className="w-12 h-[2px] bg-cyan-500 mx-auto" />

        {/* 상세 설명 */}
        <p className="text-base sm:text-xl font-light text-gray-600 max-w-2xl mx-auto leading-relaxed whitespace-pre-line">
          {data.description}
        </p>

      </div>
    </section>
  );
}
