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
    });

    // 01 / PRELUDE 수직 페이드업
    gsap.set(['.intro-prelude-label', '.intro-prelude-title', '.intro-prelude-desc'], { opacity: 0, y: 30 });
    ScrollTrigger.create({
      trigger: '.intro-prelude-label',
      start: 'top 85%',
      onEnter: () => {
        gsap.to(['.intro-prelude-label', '.intro-prelude-title', '.intro-prelude-desc'], {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.15,
          ease: 'power2.out',
          overwrite: 'auto',
        });
      },
      onLeaveBack: () => {
        gsap.to(['.intro-prelude-label', '.intro-prelude-title', '.intro-prelude-desc'], {
          opacity: 0,
          y: 30,
          duration: 0.5,
          stagger: 0.05,
          ease: 'power2.in',
          overwrite: 'auto',
        });
      }
    });

    // 02 / WHAT WE DO 수직 페이드업
    gsap.set(['.intro-wwd-label', '.intro-wwd-title', '.intro-wwd-content'], { opacity: 0, y: 30 });
    ScrollTrigger.create({
      trigger: '.intro-wwd-label',
      start: 'top 85%',
      onEnter: () => {
        gsap.to(['.intro-wwd-label', '.intro-wwd-title', '.intro-wwd-content'], {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.15,
          ease: 'power2.out',
          overwrite: 'auto',
        });
      },
      onLeaveBack: () => {
        gsap.to(['.intro-wwd-label', '.intro-wwd-title', '.intro-wwd-content'], {
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
      id="offerings-intro"
      className="relative w-full bg-transparent text-[#0d1a1f]"
    >
      {/* 1. PRELUDE 핵심 슬로건 */}
      <section className="relative w-full h-[100dvh] tablet:h-auto tablet:min-h-screen py-16 tablet:py-32 px-6 tablet-p:px-24 tablet:px-48 flex flex-col justify-center bg-transparent">
        <div className="max-w-5xl mx-auto w-full flex flex-col gap-8">
          <span className="text-sm font-semibold tracking-[0.2em] uppercase text-cyan-600 intro-prelude-label">
            01 / PRELUDE
          </span>
          <h2 className="text-[clamp(28px,4.5vw,64px)] font-bold leading-tight whitespace-pre-line tracking-tight intro-prelude-title">
            {OFFERINGS_DATA.intro.mainCopy}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2 text-[clamp(14px,1.8vw,18px)] leading-relaxed font-light text-gray-600 intro-prelude-desc">
            <p className="whitespace-pre-line">
              {OFFERINGS_DATA.intro.description}
            </p>
            <p className="whitespace-pre-line text-gray-500">
              {OFFERINGS_DATA.intro.subDescription}
            </p>
          </div>
        </div>
      </section>

      {/* 01과 02 사이의 에디토리얼 구분선 */}
      <div className="max-w-5xl mx-auto px-6 tablet-p:px-24 tablet:px-48 flex justify-center">
        <div className="w-[180px] tablet-p:w-[320px] tablet:w-full h-[1px] bg-gray-200/50" />
      </div>

      {/* 2. WHAT WE DO 상세 영역 */}
      <section className="relative w-full h-[100dvh] tablet:h-auto tablet:min-h-screen py-16 tablet:py-32 px-6 tablet-p:px-24 tablet:px-48 flex flex-col justify-center bg-transparent">
        <div className="max-w-5xl mx-auto w-full flex flex-col gap-12">
          <div className="flex flex-col gap-4">
            <span className="text-sm font-semibold tracking-[0.2em] uppercase text-cyan-600 intro-wwd-label">
              02 / WHAT WE DO
            </span>
            <h3 className="text-[clamp(22px,3vw,40px)] font-semibold leading-snug whitespace-pre-line tracking-tight intro-wwd-title">
              {OFFERINGS_DATA.whatWeDo.mainCopy}
            </h3>
          </div>

          <div className="grid grid-cols-1 tablet:grid-cols-2 gap-8 tablet:gap-12 mt-2 intro-wwd-content">
            <div className="flex flex-col gap-6">
              <div className="text-[clamp(18px,2vw,28px)] font-bold text-cyan-600">
                {OFFERINGS_DATA.whatWeDo.highlightCopy}
              </div>
              <p className="text-sm sm:text-base leading-relaxed font-light text-gray-600 whitespace-pre-line">
                {OFFERINGS_DATA.whatWeDo.description}
              </p>
            </div>
            
            <div className="flex flex-col gap-4 tablet:gap-6 justify-end">
              <div className="p-5 tablet:p-6 rounded-xl bg-gray-50 border border-gray-100 flex flex-col gap-2">
                <span className="text-xs font-semibold tracking-wider text-cyan-600 uppercase">Studio Essence</span>
                <p className="text-xs sm:text-base font-light text-gray-600">{OFFERINGS_DATA.whatWeDo.studioDesc}</p>
              </div>
              <div className="p-5 tablet:p-6 rounded-xl bg-gray-50 border border-gray-100 flex flex-col gap-2">
                <span className="text-xs font-semibold tracking-wider text-cyan-600 uppercase">Lab Essence</span>
                <p className="text-xs sm:text-base font-light text-gray-600">{OFFERINGS_DATA.whatWeDo.labDesc}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </section>
  );
}
