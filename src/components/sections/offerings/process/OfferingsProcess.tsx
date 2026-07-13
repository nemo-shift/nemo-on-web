'use client';

import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { OFFERINGS_DATA } from '@/data/offerings';

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function OfferingsProcess() {
  const sectionRef = useRef<HTMLElement>(null);
  const data = OFFERINGS_DATA.process;

  useGSAP(() => {
    if (!sectionRef.current) return;

    const items = gsap.utils.toArray<HTMLElement>('.process-item');
    gsap.set(items, { opacity: 0, y: 28 });

    items.forEach((item) => {
      gsap.to(item, {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: item,
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
      });
    });

    // 타임라인 세로선 드로잉 애니메이션
    const line = sectionRef.current.querySelector('.timeline-line') as HTMLElement;
    if (line) {
      gsap.set(line, { scaleY: 0, transformOrigin: 'top center' });
      gsap.to(line, {
        scaleY: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: '.timeline-wrapper',
          start: 'top 70%',
          end: 'bottom 50%',
          scrub: true,
        },
      });
    }
  }, { scope: sectionRef });

  return (
    <section
      ref={sectionRef}
      className="process-section relative w-full bg-[#f7f1e9] py-24 tablet-p:py-32 tablet:py-48 px-6 tablet-p:px-12 tablet:px-24 overflow-hidden"
    >
      {/* ── 1. 공감 인용 블록 ── */}
      <div className="max-w-3xl mx-auto w-full mb-20 tablet:mb-32">
        <span className="process-item block text-xs tablet:text-sm font-semibold tracking-[0.2em] uppercase text-cyan-600 mb-10 tablet:mb-14">
          03 / PROCESS
        </span>

        <div className="flex flex-wrap gap-3 tablet:gap-4">
          {data.empathyList.map((line, i) => (
            <div
              key={i}
              className="process-item px-5 py-3 tablet:px-6 tablet:py-3.5 rounded-full border border-[#0d1a1f]/10 bg-white/50 backdrop-blur-sm"
            >
              <span className="font-suit font-light text-[#0d1a1f]/60 text-[14px] tablet-p:text-[15px] tablet:text-[16px]">
                &ldquo;{line}&rdquo;
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── 2. 전환 문장 ── */}
      <div className="max-w-3xl mx-auto w-full mb-20 tablet:mb-32">
        <div className="process-item">
          <div className="h-[2px] w-12 bg-cyan-500/40 mb-8" />
          <p className="font-suit font-bold text-[#0d1a1f] text-[clamp(22px,3.5vw,36px)] leading-snug whitespace-pre-line">
            {data.transition}
          </p>
        </div>
      </div>

      {/* ── 3. 타임라인 ── */}
      <div className="timeline-wrapper relative max-w-4xl mx-auto w-full mb-20 tablet:mb-32">
        {/* 세로 연결선 (데스크톱만) */}
        <div className="hidden tablet:block absolute left-[52px] top-0 bottom-0 w-[1px]">
          <div className="timeline-line absolute inset-0 bg-cyan-500/20" />
        </div>

        <div className="flex flex-col gap-0">
          {data.steps.map((step, i) => (
            <div
              key={step.no}
              className="process-item group relative"
            >
              {/* 카드 본체 */}
              <div className="flex gap-0 tablet:gap-8 items-start py-6 tablet:py-8">
                {/* 왼쪽: 큰 번호 */}
                <div className="hidden tablet:flex w-[104px] shrink-0 items-start justify-center pt-1">
                  <span className="relative z-[1] font-suit font-bold text-[36px] text-cyan-500/20 leading-none select-none">
                    {step.no}
                  </span>
                </div>

                {/* 오른쪽: 콘텐츠 */}
                <div className="flex-1 tablet:border-b tablet:border-[#0d1a1f]/5 tablet:pb-8">
                  {/* 모바일 번호 + 이름 */}
                  <div className="flex items-baseline gap-3 mb-2">
                    <span className="tablet:hidden font-suit font-bold text-[24px] text-cyan-500/25 leading-none">
                      {step.no}
                    </span>
                    <h3 className="font-suit font-semibold text-[#0d1a1f] text-[18px] tablet-p:text-[20px] tablet:text-[22px] leading-tight">
                      {step.name}
                    </h3>
                  </div>

                  {/* 목적 + 산출물 */}
                  <div className="flex flex-col tablet:flex-row tablet:items-baseline gap-2 tablet:gap-8 mt-3">
                    <p className="font-suit font-light text-[#0d1a1f]/60 text-[14px] tablet-p:text-[15px] tablet:text-[16px] leading-relaxed flex-1">
                      {step.purpose}
                    </p>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-cyan-600/8 text-cyan-700/80 font-suit font-medium text-[12px] tablet:text-[13px] tracking-wide shrink-0">
                      <span className="w-1 h-1 rounded-full bg-cyan-500/50" />
                      {step.output}
                    </span>
                  </div>
                </div>
              </div>

              {/* 모바일 구분선 (마지막 제외) */}
              {i < data.steps.length - 1 && (
                <div className="tablet:hidden h-[1px] bg-[#0d1a1f]/5 ml-10" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── 4. 마무리 문장 ── */}
      <div className="max-w-3xl mx-auto w-full">
        <p className="process-item font-suit font-light text-[#0d1a1f]/40 text-[14px] tablet-p:text-[15px] tablet:text-[16px] leading-relaxed max-w-xl">
          {data.closing}
        </p>
      </div>
    </section>
  );
}
