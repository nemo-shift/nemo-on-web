'use client';

import React from 'react';
import { OFFERINGS_DATA } from '@/data/offerings';

export default function OfferingsStudio() {
  const data = OFFERINGS_DATA.studio;

  return (
    <div
      id="offering-section-studio"
      className="w-screen h-[100svh] flex-shrink-0 flex flex-col justify-center bg-transparent text-white px-6 tablet-p:px-12 tablet:px-24"
    >
      <div className="max-w-5xl mx-auto w-full flex flex-col gap-8">

        {/* 장식 세로선 + 타이틀 */}
        <div className="flex items-stretch gap-6 studio-header studio-title">
          <div className="w-[2px] bg-cyan-400/60 shrink-0" />
          <div className="flex flex-col gap-4">
            <h2 className="text-[clamp(36px,5vw,60px)] font-bold tracking-tight text-white leading-tight">
              {data.title}
            </h2>
            <p className="text-[clamp(18px,2.5vw,26px)] font-light text-cyan-100/70 leading-snug">
              {data.subTitle}
            </p>
          </div>
        </div>

        {/* 세부 내용 및 업무 분류 */}
        <div className="grid grid-cols-1 tablet:grid-cols-2 gap-12 mt-4">
          <div className="flex flex-col gap-6 studio-content">
            <p className="text-base tablet-p:text-lg leading-relaxed font-light text-gray-300">
              {data.description}
            </p>
          </div>

          {/* 하는 일 태그 그룹 */}
          <div className="flex flex-col gap-6 studio-caps">
            <h4 className="text-xs font-bold uppercase tracking-widest text-cyan-400">
              Every Project Includes
            </h4>
            <div className="flex flex-wrap gap-3">
              {data.works.map((work, idx) => (
                <div
                  key={idx}
                  className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm font-light text-gray-200 transition-all hover:bg-white/10 studio-cap-tag"
                >
                  {work}
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
