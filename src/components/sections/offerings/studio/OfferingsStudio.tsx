'use client';

import React from 'react';
import Link from 'next/link';
import { OFFERINGS_DATA } from '@/data/offerings';

export default function OfferingsStudio() {
  const data = OFFERINGS_DATA.studio;

  return (
    <div 
      id="offering-section-studio"
      className="w-screen h-screen flex-shrink-0 flex flex-col justify-center bg-transparent text-white px-6 sm:px-12 md:px-24"
    >
      <div className="max-w-5xl mx-auto w-full flex flex-col gap-8">
        
        {/* 라벨 */}
        <div className="flex items-center gap-4 studio-header">
          <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase bg-cyan-950 text-cyan-300 border border-cyan-800">
            Offerings 01
          </span>
          <span className="text-sm font-semibold tracking-wider text-cyan-400 uppercase">
            STUDIO
          </span>
        </div>

        {/* 메인 타이틀 & 서브 */}
        <div className="flex flex-col gap-4 studio-title">
          <h2 className="text-[clamp(36px,5vw,60px)] font-bold tracking-tight text-white leading-tight">
            {data.title}
          </h2>
          <p className="text-[clamp(18px,2.5vw,26px)] font-light text-cyan-100/70 leading-snug">
            {data.subTitle}
          </p>
        </div>

        {/* 세부 내용 및 업무 분류 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-4">
          <div className="flex flex-col gap-6 studio-content">
            <p className="text-base sm:text-lg leading-relaxed font-light text-gray-300">
              {data.description}
            </p>
            <p className="text-sm sm:text-base leading-relaxed font-light text-gray-400 border-l-2 border-cyan-500 pl-4">
              {data.detailDescription}
            </p>
          </div>

          {/* 하는 일 태그 그룹 */}
          <div className="flex flex-col gap-6 studio-caps">
            <h4 className="text-xs font-bold uppercase tracking-widest text-cyan-400">
              Core Capabilities
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

        {/* CTA 상세 보기 링크 */}
        <div className="mt-8 studio-cta">
          <Link 
            href={data.link}
            className="inline-flex items-center gap-2 text-sm sm:text-base font-medium text-cyan-400 hover:text-cyan-300 transition-colors group"
          >
            <span>Studio 자세히 보기</span>
            <span className="transform translate-x-0 group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>

      </div>
    </div>
  );
}
