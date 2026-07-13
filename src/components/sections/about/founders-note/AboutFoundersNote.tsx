'use client';

import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ABOUT_FOUNDERS_NOTE_DATA } from '@/data/about';
import { useHeaderThemeSync } from '@/hooks';

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function AboutFoundersNote() {
  const sectionRef = useRef<HTMLElement>(null);
  const emphasisRef = useRef<HTMLParagraphElement>(null);

  useHeaderThemeSync(sectionRef);

  useGSAP(() => {
    if (!sectionRef.current || !emphasisRef.current) return;

    const items = gsap.utils.toArray<HTMLElement>('.fnote-line');
    gsap.set(items, { opacity: 0, y: 24 });
    gsap.set(emphasisRef.current, { opacity: 0, scale: 0.88, y: 16 });

    // 각 라인 개별 ScrollTrigger
    items.forEach((item) => {
      gsap.to(item, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: item,
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
      });
    });

    // 강조 문장 스케일업
    gsap.to(emphasisRef.current, {
      opacity: 1,
      scale: 1,
      y: 0,
      duration: 1,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: emphasisRef.current,
        start: 'top 82%',
        toggleActions: 'play none none reverse',
      },
    });

    // 배경색 전환: FoundersNote(dark) → Meaning(cream) 스르르 전환
    gsap.to(sectionRef.current, {
      backgroundColor: '#f7f1e9',
      ease: 'none',
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'bottom 80%',
        end: 'bottom 20%',
        scrub: true,
      },
    });
  }, { scope: sectionRef });

  return (
    <section
      ref={sectionRef}
      id="about-founders-note"
      className="relative w-full min-h-[calc(100svh+60px)] tablet:min-h-[calc(100svh+80px)] z-[15] bg-[#0d1a1f] text-[#f0ebe3] flex flex-col items-center justify-center py-16 tablet-p:py-20 px-6 tablet-p:px-24 tablet:px-48 overflow-hidden"
    >
      <div className="max-w-2xl mx-auto w-full">

        {/* 라벨 */}
        <span className="fnote-line block text-xs tablet:text-sm font-semibold tracking-[0.2em] uppercase text-cyan-400/80 mb-10 tablet:mb-14">
          {ABOUT_FOUNDERS_NOTE_DATA.label}
        </span>

        {/* 큰 인용부호 장식 */}
        <div className="fnote-line mb-3 tablet:mb-8">
          <span className="font-suit text-[48px] tablet:text-[72px] leading-none text-cyan-400/15 select-none">
            &ldquo;
          </span>
        </div>

        {/* 본문 단락들 — 왼쪽 세로선으로 서신 느낌 */}
        <div className="border-l border-[#f0ebe3]/10 pl-6 tablet:pl-8 flex flex-col gap-6 tablet:gap-8">
          {ABOUT_FOUNDERS_NOTE_DATA.lines.map((line, i) => (
            <p
              key={i}
              className="fnote-line font-suit font-light whitespace-pre-line leading-[1.7] tablet-p:leading-[1.9] text-[15px] tablet-p:text-[19px] tablet:text-[21px] text-[#f0ebe3]/80"
            >
              {line}
            </p>
          ))}
        </div>

        {/* 구분선 */}
        <div className="fnote-line my-8 tablet:my-12 ml-6 tablet:ml-8">
          <div className="h-[1px] w-16 bg-cyan-400/20" />
        </div>

        {/* 강조 문장 — 중앙 정렬, 크고 선명하게 */}
        <div className="ml-6 tablet:ml-8">
          <p
            ref={emphasisRef}
            className="font-suit font-medium text-[20px] tablet-p:text-[28px] tablet:text-[36px] leading-tight text-[#f0ebe3] origin-left"
          >
            {ABOUT_FOUNDERS_NOTE_DATA.signatureEmphasis}
          </p>
        </div>

        {/* 서명 */}
        <p className="fnote-line font-suit font-light text-sm text-[#f0ebe3]/40 mt-6 tablet:mt-8 ml-6 tablet:ml-8">
          {ABOUT_FOUNDERS_NOTE_DATA.signature}
        </p>

      </div>
    </section>
  );
}
