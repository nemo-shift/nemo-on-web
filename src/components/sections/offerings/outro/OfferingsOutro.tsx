'use client';

import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import { OFFERINGS_DATA } from '@/data/offerings';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

export default function OfferingsOutro() {
  const data = OFFERINGS_DATA.closing;
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    if (!sectionRef.current) return;

    // OUTRO 수직 페이드업
    gsap.set(['.outro-label', '.outro-title', '.outro-bar', '.outro-desc'], { opacity: 0, y: 30 });
    ScrollTrigger.create({
      trigger: '.outro-label',
      start: 'top 85%',
      onEnter: () => {
        gsap.to(['.outro-label', '.outro-title', '.outro-bar', '.outro-desc'], {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.15,
          ease: 'power2.out',
          overwrite: 'auto',
        });
      },
      onLeaveBack: () => {
        gsap.to(['.outro-label', '.outro-title', '.outro-bar', '.outro-desc'], {
          opacity: 0,
          y: 30,
          duration: 0.5,
          stagger: 0.05,
          ease: 'power2.in',
          overwrite: 'auto',
        });
      }
    });
  }, { scope: sectionRef });

  return (
    <section 
      ref={sectionRef}
      id="offerings-outro"
      className="relative w-full min-h-screen pb-[40vh] tablet-p:pb-[50vh] tablet:pb-[60vh] pt-[40vh] px-6 tablet-p:px-12 tablet:px-24 flex flex-col justify-start bg-transparent text-[#0d1a1f]"
    >
      <div className="max-w-4xl mx-auto w-full text-center flex flex-col gap-12">
        
        {/* 아웃트로 라벨 */}
        <span className="text-xs sm:text-sm font-semibold tracking-[0.25em] uppercase text-cyan-600 outro-label">
          NEMO:ON ESSENCE
        </span>

        {/* 메인 슬로건 */}
        <h3 className="text-[clamp(28px,4.5vw,56px)] font-bold leading-tight tracking-tight text-[#0d1a1f] whitespace-pre-line outro-title">
          {data.mainCopy}
        </h3>

        {/* 구분 바 */}
        <div className="w-12 h-[2px] bg-cyan-500 mx-auto outro-bar" />

        {/* 상세 설명 */}
        <p className="text-base sm:text-xl font-light text-gray-600 max-w-2xl mx-auto leading-relaxed whitespace-pre-line outro-desc">
          {data.description}
        </p>

      </div>
    </section>
  );
}
