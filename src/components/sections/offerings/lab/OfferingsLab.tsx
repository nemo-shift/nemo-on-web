'use client';

import React from 'react';
import Link from 'next/link';
import { OFFERINGS_DATA } from '@/data/offerings';

export default function OfferingsLab() {
  const data = OFFERINGS_DATA.lab;

  return (
    <div 
      id="offering-section-lab"
      className="w-screen h-screen flex-shrink-0 flex flex-col justify-center bg-[#f1f5f9] text-[#0d1a1f] px-6 sm:px-12 md:px-24"
    >
      <div className="max-w-5xl mx-auto w-full flex flex-col gap-8">
        
        {/* 라벨 */}
        <div className="flex items-center gap-4 lab-header">
          <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase bg-slate-200 text-slate-700 border border-slate-300">
            Offerings 02
          </span>
          <span className="text-sm font-semibold tracking-wider text-slate-500 uppercase">
            LAB.
          </span>
        </div>

        {/* 메인 타이틀 & 서브 */}
        <div className="flex flex-col gap-4 lab-title">
          <h2 className="text-[clamp(36px,5vw,60px)] font-bold tracking-tight text-[#0d1a1f] leading-tight">
            {data.title}
          </h2>
          <p className="text-[clamp(18px,2.5vw,26px)] font-light text-slate-600 leading-snug">
            {data.subTitle}
          </p>
        </div>

        {/* 세부 내용 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-4">
          <div className="flex flex-col gap-6 lab-content-left">
            <p className="text-base sm:text-lg leading-relaxed font-light text-slate-700">
              {data.description}
            </p>
          </div>

          <div className="flex flex-col gap-6 justify-between lab-content-right">
            <p className="text-sm sm:text-base leading-relaxed font-light text-slate-500 border-l-2 border-slate-400 pl-4">
              {data.detailDescription}
            </p>
            <div className="text-xs tracking-widest text-slate-400 uppercase font-semibold">
              Experimental Label / Tool / Prototype
            </div>
          </div>
        </div>

        {/* CTA 상세 보기 링크 */}
        <div className="mt-8 lab-cta">
          <Link 
            href={data.link}
            className="inline-flex items-center gap-2 text-sm sm:text-base font-medium text-slate-800 hover:text-slate-900 transition-colors group"
          >
            <span>Lab 자세히 보기</span>
            <span className="transform translate-x-0 group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>

      </div>
    </div>
  );
}
