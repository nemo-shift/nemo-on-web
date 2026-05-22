'use client';

import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import { OFFERINGS_DATA } from '@/data/offerings';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

export default function OfferingsIntro() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    if (!sectionRef.current) return;

    // 히어로 팽창과 매끄러운 스크롤 동기화를 위해 트리거 등록
    ScrollTrigger.create({
      id: 'offerings-intro-trigger',
      trigger: sectionRef.current,
      start: 'top top',
      end: 'bottom bottom',
      // 필요 시 추후 추가적인 페이드인/아웃 인터랙션 얹을 수 있도록 기반 마련
    });
  }, { scope: sectionRef });

  return (
    <section 
      ref={sectionRef}
      id="offerings-intro"
      className="relative w-full min-h-screen py-32 px-6 sm:px-12 md:px-24 flex flex-col justify-center bg-white text-[#0d1a1f]"
    >
      <div className="max-w-5xl mx-auto w-full flex flex-col gap-24">
        
        {/* 1. Intro 핵심 슬로건 */}
        <div className="flex flex-col gap-8">
          <span className="text-sm font-semibold tracking-[0.2em] uppercase text-cyan-600">
            01 / INTRO
          </span>
          <h2 className="text-[clamp(32px,5vw,64px)] font-bold leading-tight whitespace-pre-line tracking-tight">
            {OFFERINGS_DATA.intro.mainCopy}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4 text-[clamp(16px,2vw,20px)] leading-relaxed font-light text-gray-600">
            <p className="whitespace-pre-line">
              {OFFERINGS_DATA.intro.description}
            </p>
            <p className="whitespace-pre-line text-gray-500">
              {OFFERINGS_DATA.intro.subDescription}
            </p>
          </div>
        </div>

        {/* 1px 구분선 */}
        <div className="w-full h-[1px] bg-gray-200" />

        {/* 2. What We Do 상세 영역 */}
        <div className="flex flex-col gap-12">
          <div className="flex flex-col gap-4">
            <span className="text-sm font-semibold tracking-[0.2em] uppercase text-cyan-600">
              02 / WHAT WE DO
            </span>
            <h3 className="text-[clamp(24px,3.5vw,40px)] font-semibold leading-snug whitespace-pre-line tracking-tight">
              {OFFERINGS_DATA.whatWeDo.mainCopy}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-4">
            <div className="flex flex-col gap-6">
              <div className="text-[clamp(20px,2.5vw,28px)] font-bold text-cyan-600">
                {OFFERINGS_DATA.whatWeDo.highlightCopy}
              </div>
              <p className="text-base sm:text-lg leading-relaxed font-light text-gray-600 whitespace-pre-line">
                {OFFERINGS_DATA.whatWeDo.description}
              </p>
            </div>
            
            <div className="flex flex-col gap-6 justify-end">
              <div className="p-6 rounded-xl bg-gray-50 border border-gray-100 flex flex-col gap-2">
                <span className="text-xs font-semibold tracking-wider text-cyan-600 uppercase">Studio Essence</span>
                <p className="text-sm sm:text-base font-light text-gray-600">{OFFERINGS_DATA.whatWeDo.studioDesc}</p>
              </div>
              <div className="p-6 rounded-xl bg-gray-50 border border-gray-100 flex flex-col gap-2">
                <span className="text-xs font-semibold tracking-wider text-cyan-600 uppercase">Lab Essence</span>
                <p className="text-sm sm:text-base font-light text-gray-600">{OFFERINGS_DATA.whatWeDo.labDesc}</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
