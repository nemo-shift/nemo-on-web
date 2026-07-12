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

    // 콘텐츠 초기 은폐
    gsap.set('.fnote-line', { opacity: 0, y: 24 });
    gsap.set(emphasisRef.current, { opacity: 0, scale: 0.88, y: 16 });

    // 본문 stagger 진입 (매 진입마다 재생)
    ScrollTrigger.create({
      trigger: sectionRef.current,
      start: 'top 70%',
      end: 'bottom 30%',
      onEnter: () => {
        gsap.to('.fnote-line', {
          opacity: 1, y: 0, duration: 0.9, stagger: 0.18, ease: 'power2.out',
        });
      },
      onLeave: () => {
        gsap.set('.fnote-line', { opacity: 0, y: 24 });
        gsap.set(emphasisRef.current, { opacity: 0, scale: 0.88, y: 16 });
      },
      onEnterBack: () => {
        gsap.to('.fnote-line', {
          opacity: 1, y: 0, duration: 0.9, stagger: 0.18, ease: 'power2.out',
        });
      },
      onLeaveBack: () => {
        gsap.set('.fnote-line', { opacity: 0, y: 24 });
        gsap.set(emphasisRef.current, { opacity: 0, scale: 0.88, y: 16 });
      },
    });

    // signatureEmphasis: 뷰포트 깊이 진입 시 scale-up 애니메이션 (매 진입마다 재생)
    ScrollTrigger.create({
      trigger: emphasisRef.current,
      start: 'top 80%',
      end: 'bottom 20%',
      onEnter: () => {
        gsap.to(emphasisRef.current, {
          opacity: 1, scale: 1, y: 0, duration: 1, ease: 'power2.out',
        });
      },
      onLeave: () => {
        gsap.set(emphasisRef.current, { opacity: 0, scale: 0.88, y: 16 });
      },
      onEnterBack: () => {
        gsap.to(emphasisRef.current, {
          opacity: 1, scale: 1, y: 0, duration: 1, ease: 'power2.out',
        });
      },
      onLeaveBack: () => {
        gsap.set(emphasisRef.current, { opacity: 0, scale: 0.88, y: 16 });
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
      className="relative w-full min-h-[100svh] z-[15] bg-[#0d1a1f] text-[#f0ebe3] flex flex-col items-center justify-center px-6 tablet-p:px-24 tablet:px-48 overflow-hidden"
    >
      <div className="max-w-2xl mx-auto w-full flex flex-col gap-8 tablet:gap-10">
        <span className="fnote-line text-xs tablet:text-sm font-semibold tracking-[0.2em] uppercase text-cyan-400/80">
          {ABOUT_FOUNDERS_NOTE_DATA.label}
        </span>
        {ABOUT_FOUNDERS_NOTE_DATA.lines.map((line, i) => (
          <p key={i} className="fnote-line font-suit font-light whitespace-pre-line leading-[1.9] text-[19px] tablet:text-[24px] text-[#f0ebe3]/90">
            {line}
          </p>
        ))}
        <p ref={emphasisRef} className="font-suit font-medium text-[28px] tablet:text-[36px] leading-tight text-[#f0ebe3] mt-4 origin-left">
          {ABOUT_FOUNDERS_NOTE_DATA.signatureEmphasis}
        </p>
        <p className="fnote-line font-suit font-light text-sm text-[#f0ebe3]/50 mt-1">
          {ABOUT_FOUNDERS_NOTE_DATA.signature}
        </p>
      </div>
    </section>
  );
}
