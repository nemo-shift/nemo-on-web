"use client";

import React, { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { OFFERINGS_DATA } from "@/data/offerings";
import { useDevice } from "@/context";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

export default function OfferingsHero() {
  const containerRef = useRef<HTMLElement>(null);
  const nemoRef = useRef<HTMLDivElement>(null);

  const { isMobileView, isTabletPortrait, isInitialized } = useDevice();

  useGSAP(
    () => {
      if (!isInitialized || !containerRef.current || !nemoRef.current) return;

      // 스크롤 엔진 및 오차 리셋
      const lenis = (window as any).lenis;
      if (lenis) {
        lenis.start();
        lenis.scrollTo(0, { immediate: true });
      }
      window.scrollTo(0, 0);

      requestAnimationFrame(() => {
        ScrollTrigger.refresh();
      });

      // 화면 뷰포트에 따른 네모 초기 사이즈 설정
      const initSize = isMobileView
        ? { w: 120, h: 120 }
        : isTabletPortrait
          ? { w: 150, h: 150 }
          : { w: 180, h: 180 };

      // 네모 초기 세팅
      gsap.set(nemoRef.current, {
        width: initSize.w,
        height: initSize.h,
        borderRadius: 6,
        //backgroundColor: "#0891b2", // 브랜드 대표 Teal 컬러
        backgroundColor: "#E8734A", // 브랜드 대표 Teal 컬러
      });

      // 메인 스크롤 애니메이션 타임라인
      const tl = gsap.timeline({
        scrollTrigger: {
          id: "offerings-hero-trigger",
          refreshPriority: 10,
          trigger: containerRef.current,
          start: "top top",
          end: () => `+=${window.innerHeight * 2}`,
          pin: true,
          scrub: 1,
          onLeave: () => {
            const lenis = (window as any).lenis;
            const targetTrigger = ScrollTrigger.getById(
              "offerings-intro-trigger",
            );
            const targetScroll = targetTrigger
              ? targetTrigger.start
              : "#offerings-intro";

            if (lenis) {
              lenis.scrollTo(targetScroll, {
                immediate: true,
                force: true,
              });
            }
          },
        },
      });

      // 네모가 화면을 100vw, 100vh로 덮으며 완전한 직각으로 변하는 애니메이션
      tl.to(
        nemoRef.current,
        {
          width: "100vw",
          height: "100vh",
          borderRadius: 0,
          duration: 1,
          ease: "power2.inOut",
        },
        0,
      );

      // 3단계 키워드 순간 교체 (툭 툭 연출)
      // 0.33 지점에서 [담다] 아웃 -> [닮다] 인
      tl.set(".offerings-keyword-0", { opacity: 0 }, 0.33);
      tl.set(".offerings-keyword-1", { opacity: 1 }, 0.33);

      // 0.66 지점에서 [닮다] 아웃 -> [ON] 인
      tl.set(".offerings-keyword-1", { opacity: 0 }, 0.66);
      tl.set(".offerings-keyword-2", { opacity: 1 }, 0.66);
    },
    {
      dependencies: [isInitialized, isMobileView, isTabletPortrait],
      scope: containerRef,
    },
  );

  if (!isInitialized) return null;

  return (
    <section
      ref={containerRef}
      id="offerings-hero"
      className="relative w-full h-screen flex items-center justify-center overflow-hidden"
      style={{
        //background: 'linear-gradient(135deg, #ccf7fe 0%, #ffffff 40%, #ffffff 60%, #f9ede0 100%)'
        background:
          "linear-gradient(135deg, #f9ede0 0%, #ffffff 40%, #ffffff 60%, #f9ede0 100%)",
      }}
    >
      {/* 배경 고정 헤더 타이틀 */}
      <h1 className="absolute top-[clamp(170px,24vh,280px)] left-4 tablet-p:top-[clamp(160px,22vh,260px)] tablet-p:left-12 tablet:top-[clamp(140px,20vh,280px)] tablet:left-48 text-[clamp(58px,14vw,88px)] tablet-p:text-[clamp(76px,12vw,110px)] tablet:text-[clamp(96px,9vw,150px)] font-dm font-bold tracking-wider uppercase text-[#0d1a1f] select-none pointer-events-none z-20">
        OFFERINGS
      </h1>

      {/* 팽창하는 브랜드 네모 */}
      <div
        ref={nemoRef}
        className="absolute flex items-center justify-center overflow-hidden will-change-transform shadow-2xl z-10"
      >
        <div className="relative w-full h-full flex items-center justify-center">
          {OFFERINGS_DATA.hero.keywords.map((kw, i) => (
            <div
              key={kw.num}
              className={`offerings-keyword-${i} absolute flex flex-col items-center justify-center text-white text-center`}
              style={{
                opacity: i === 0 ? 1 : 0, // 첫 번째 키워드가 처음에 노출
              }}
            >
              <span className="font-bold text-[clamp(28px,6vw,90px)] leading-none tracking-tight">
                {kw.word}
              </span>
              <span className="text-[clamp(12px,1.5vw,20px)] mt-3 font-light tracking-[0.2em] opacity-80 uppercase">
                {kw.desc}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
