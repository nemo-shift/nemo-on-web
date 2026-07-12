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

    // 콘텐츠 + 그라디언트 초기 은폐
    gsap.set('.principle-item', { opacity: 0, x: -24 });
    // 콘텐츠 stagger 진입
    ScrollTrigger.create({
      trigger: sectionRef.current,
      start: 'top 40%',
      end: 'bottom 30%',
      onEnter: () => {
        gsap.to('.principle-item', {
          opacity: 1, x: 0, duration: 0.7, stagger: 0.12, ease: 'power2.out',
        });
      },
      onLeave: () => {
        gsap.set('.principle-item', { opacity: 0, x: -24 });
        gsap.set(['.principle-edge-top', '.principle-edge-bottom'], { opacity: 0 });
      },
      onEnterBack: () => {
        gsap.to('.principle-item', {
          opacity: 1, x: 0, duration: 0.7, stagger: 0.12, ease: 'power2.out',
        });
        gsap.to(['.principle-edge-top', '.principle-edge-bottom'], {
          opacity: 1, duration: 0.6, ease: 'power1.out',
        });
      },
      onLeaveBack: () => {
        gsap.set('.principle-item', { opacity: 0, x: -24 });
        gsap.set(['.principle-edge-top', '.principle-edge-bottom'], { opacity: 0 });
      },
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
      className="relative w-full min-h-[100svh] z-[25] bg-[#0d1a1f] text-[#f0ebe3] flex flex-col items-center justify-center px-6 tablet-p:px-24 tablet:px-48 overflow-hidden"
    >
      <div className="max-w-3xl mx-auto w-full flex flex-col gap-10 tablet:gap-14">
        <span className="principle-item text-xs tablet:text-sm font-semibold tracking-[0.2em] uppercase text-cyan-400/80">
          {ABOUT_PRINCIPLES_DATA.label}
        </span>
        <div className="flex flex-col gap-6 tablet:gap-8">
          {ABOUT_PRINCIPLES_DATA.items.map((item, i) => (
            <div key={i} className="principle-item flex items-baseline gap-4 tablet:gap-5 border-l-2 border-cyan-400/40 pl-5 tablet:pl-7">
              <span className="font-suit font-light text-cyan-400/50 shrink-0 text-[16px] tablet:text-[22px]">
                {String(i + 1).padStart(2, '0')}
              </span>
              <p className="font-suit font-light leading-snug text-[#f0ebe3]/90 text-[19px] tablet:text-[28px]">
                {item}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
