'use client';

import React from 'react';
import { OFFERINGS_DATA } from '@/data/offerings';

export default function OfferingsLab() {
  const data = OFFERINGS_DATA.lab;

  return (
    <div
      id="offering-section-lab"
      className="w-screen h-[100svh] flex-shrink-0 flex flex-col justify-center bg-transparent text-[#0d1a1f] px-6 tablet-p:px-12 tablet:px-24"
    >
      <div className="max-w-5xl mx-auto w-full flex flex-col gap-8">

        {/* 장식 가로선 + 타이틀 */}
        <div className="flex flex-col gap-6 lab-header lab-title">
          <div className="h-[2px] w-16 bg-slate-400/60" />
          <div className="flex flex-col gap-4">
            <h2 className="text-[clamp(36px,5vw,60px)] font-bold tracking-tight text-[#0d1a1f] leading-tight">
              {data.title}
            </h2>
            <p className="text-[clamp(18px,2.5vw,26px)] font-light text-slate-600 leading-snug">
              {data.subTitle}
            </p>
          </div>
        </div>

        {/* 세부 내용 */}
        <div className="grid grid-cols-1 tablet:grid-cols-2 gap-12 mt-4">
          <div className="flex flex-col gap-6 lab-content-left">
            <p className="text-base tablet-p:text-lg leading-relaxed font-light text-slate-700">
              {data.description}
            </p>
            <p className="text-sm tablet-p:text-base leading-relaxed font-light text-slate-500 border-l-2 border-slate-400 pl-4">
              {data.detailDescription}
            </p>
          </div>

          {/* 실험 태그 그룹 */}
          <div className="flex flex-col gap-6 lab-content-right">
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500">
              Currently Experimenting
            </h4>
            <div className="flex flex-wrap gap-2 tablet-p:gap-3">
              {data.experiments.map((exp, idx) => (
                <div
                  key={idx}
                  className="px-3 py-1.5 tablet-p:px-4 tablet-p:py-2 rounded-lg bg-slate-800/5 border border-slate-300 text-xs tablet-p:text-sm font-light text-slate-700 transition-all hover:bg-slate-800/10"
                >
                  {exp}
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
