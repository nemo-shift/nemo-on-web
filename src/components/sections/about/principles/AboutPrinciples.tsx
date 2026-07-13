'use client';

import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ABOUT_PRINCIPLES_DATA } from '@/data/about';
import { useHeaderThemeSync } from '@/hooks';

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function AboutPrinciples() {
  const sectionRef = useRef<HTMLElement>(null);

  useHeaderThemeSync(sectionRef);

  useGSAP(() => {
    if (!sectionRef.current) return;

    const items = gsap.utils.toArray<HTMLElement>('.principle-item');

    gsap.set(items, { opacity: 0, y: 24 });

    // 취소선: CSS line-through + textDecorationColor 투명에서 시작
    const texts = gsap.utils.toArray<HTMLElement>('.principle-text');
    gsap.set(texts, { textDecoration: 'line-through', textDecorationColor: 'transparent' });

    // 섹션 진입 시 순차 stagger로 하나씩 등장 + 취소선 드로잉
    const masterTl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top 60%',
        toggleActions: 'play none none reverse',
      },
    });

    items.forEach((item, i) => {
      const text = item.querySelector('.principle-text');
      const offset = i * 0.35;

      masterTl.to(item, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power2.out',
      }, offset);

      if (text) {
        masterTl.to(text, {
          textDecorationColor: 'rgba(248, 113, 113, 0.3)',
          duration: 0.6,
          ease: 'power2.inOut',
        }, offset + 0.5);
      }
    });

    // 배경색 전환: Principles(dark) → Promise(white) 스르르 전환
    gsap.to(sectionRef.current, {
      backgroundColor: '#ffffff',
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
      id="about-principles"
      className="relative w-full min-h-[calc(100svh+60px)] tablet:min-h-[calc(100svh+80px)] z-[25] bg-[#0d1a1f] text-[#f0ebe3] flex flex-col items-center justify-center px-6 tablet-p:px-24 tablet:px-48 overflow-hidden"
    >
      <div className="max-w-3xl mx-auto w-full flex flex-col gap-12 tablet:gap-16">
        <span className="principle-item text-xs tablet:text-sm font-semibold tracking-[0.2em] uppercase text-cyan-400/80">
          {ABOUT_PRINCIPLES_DATA.label}
        </span>

        <div className="flex flex-col gap-8 tablet:gap-10">
          {ABOUT_PRINCIPLES_DATA.items.map((item, i) => (
            <div
              key={i}
              className="principle-item relative group"
            >
              {/* ✕ 마크 + 텍스트 */}
              <div className="flex items-start gap-4 tablet:gap-6">
                <span className="shrink-0 mt-1 font-suit font-light text-[22px] tablet:text-[28px] text-red-400/30 leading-none select-none">
                  ✕
                </span>
                <p className="principle-text font-suit font-light leading-relaxed text-[#f0ebe3]/80 text-[17px] tablet-p:text-[22px] tablet:text-[26px] decoration-[1.5px]">
                  {item}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
