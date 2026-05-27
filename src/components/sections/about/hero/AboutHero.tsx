"use client";

import React, { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { ABOUT_HERO_DATA } from "@/data/about";
import { useDevice } from "@/context";
import { NEMO_RESPONSIVE_LAYOUT } from "@/constants/interaction";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

export default function AboutHero() {
  const containerRef = useRef<HTMLElement>(null);
  const nemoRef = useRef<HTMLDivElement>(null);

  const { isMobileView, isTabletPortrait, isInitialized } = useDevice();

  useGSAP(
    () => {
      if (!isInitialized || !containerRef.current || !nemoRef.current) return;

      // [Zero-Point Sync] 이전 페이지의 스크롤 잔상이 남아있어 ScrollTrigger가
      // 이미 통과한 것으로 오판하여 onLeave(스냅)를 즉시 때려버리는 레이스 컨디션을 원천 차단합니다.
      const lenis = (window as any).lenis;
      if (lenis) {
        lenis.start(); // 혹시 잠겨있을지 모를 스크롤 엔진 복원
        lenis.scrollTo(0, { immediate: true }); // 즉시 스크롤을 0으로 리셋
      }
      window.scrollTo(0, 0); // 브라우저 백업 리셋

      // [Architectural Warning & Future Scalability]
      // 1. `ScrollTrigger.refresh()`를 rAF 내부에서 실행하면 페이지 내의 '모든' ScrollTrigger 인스턴스가 일제히 재계산됩니다.
      // 2. 현재 About 페이지는 AboutHero에만 트리거가 있어 안전하지만, 향후 하위 섹션(Philosophy, Meaning, Promise 등)에
      //    추가적인 ScrollTrigger를 도입할 때, 하위 섹션의 마운트 및 레이아웃(이미지 로딩 등)이 완전히 완료되지 않은 시점에
      //    본 rAF가 먼저 실행되어 하위 섹션들의 시작 좌표가 0px 등으로 오측정되는 사이드 이펙트가 발생할 수 있습니다.
      // 3. [대응 가이드]: 향후 하위 섹션에 ScrollTrigger를 추가할 때는, 모든 하위 컴포넌트들의 마운트 무결성이 확보된
      //    최종 렌더링 완료 시점(예: useEffect 마운트 타이밍)에 명시적으로 ScrollTrigger.refresh()를 한 번 더 호출해 주는
      //    설계를 반드시 지켜야 합니다.
      requestAnimationFrame(() => {
        ScrollTrigger.refresh();
      });

      // 기기 환경에 맞는 초기 네모 사이즈 가져오기 (텍스트가 잘 보이도록 기존보다 크게 설정)
      const initSize = isMobileView
        ? { w: 120, h: 120 }
        : isTabletPortrait
          ? { w: 150, h: 150 }
          : { w: 180, h: 180 };

      // 1. 초기 상태 세팅
      gsap.set(nemoRef.current, {
        width: initSize.w,
        height: initSize.h,
        borderRadius: 6, // 초기에는 살짝 둥근 모서리
        backgroundColor: "#0891b2", // 브랜드 Teal 컬러
      });

      // 2. 메인 타임라인 생성 (스크롤 동기화)
      const tl = gsap.timeline({
        scrollTrigger: {
          id: "about-hero-trigger", // 🔗 [체인 링크] 하위 섹션 결속용 고유 ID 부여
          refreshPriority: 10, // 🔗 [체인 링크] 히어로 핀 넓이를 항상 최우선으로 먼저 계산하도록 강제 보장
          trigger: containerRef.current,
          start: "top top",
          // [Scroll Compression] 무의미한 빈 스크롤 감지폭을 없애기 위해 기존 4배에서 2배로 호흡 압축
          end: () => `+=${window.innerHeight * 2}`,
          pin: true,
          scrub: 1, // 부드러운 스크러빙
          onLeave: () => {
            // 팽창 완료 지점에서 전역 Lenis 스크롤 인스턴스를 활용해 다음 섹션으로 스냅 이동
            const lenis = (window as any).lenis;

            // 🔗 [체인 링크] 철학 트리거가 완벽하게 동기화 계산해 낸 진짜 물리적 시작 좌표(start)를 타겟팅
            const targetTrigger = ScrollTrigger.getById(
              "about-philosophy-trigger",
            );
            const targetScroll = targetTrigger
              ? targetTrigger.start
              : "#about-philosophy";

            if (lenis) {
              // [오작동 해결] lenis.stop()이 scrollTo 명령까지 잠가버리던 현상을 지우고, 즉시(immediate: true) 다이렉트 텔레포트 적용
              lenis.scrollTo(targetScroll, {
                immediate: true,
                force: true,
              });
            }
          },
        },
      });

      // 네모 팽창 (스크롤 처음부터 끝까지 지속적으로 커짐)
      tl.to(
        nemoRef.current,
        {
          width: "100vw",
          height: "100vh",
          borderRadius: 0, // 커지면서 완전한 직각으로 변형
          duration: 1,
          ease: "power2.inOut",
        },
        0,
      );

      // 3. 텍스트 순간 교체 (툭 툭 바뀌는 연출)
      // 부드러운 페이드나 스케일 모션 없이, 특정 임계점에서 불투명도(opacity)만 즉시 전환(set)합니다.

      // 0.25 지점에서 [기록] 아웃 -> [관점] 인
      tl.set(".keyword-0", { opacity: 0 }, 0.25);
      tl.set(".keyword-1", { opacity: 1 }, 0.25);

      // 0.55 지점에서 [관점] 아웃 -> [+] 인
      tl.set(".keyword-1", { opacity: 0 }, 0.55);
      tl.set(".keyword-2", { opacity: 1 }, 0.55);

      // 0.85 지점에서 [+] 아웃 -> [ON] 인 (최종 완성 시점인 85%까지 띄워 무의미한 빈 스크롤을 원천 제거)
      tl.set(".keyword-2", { opacity: 0 }, 0.85);
      tl.set(".keyword-3", { opacity: 1 }, 0.85);
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
      id="about-hero"
      className="relative w-full h-screen flex items-center justify-center overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, #ccf7fe 0%, #ffffff 40%, #ffffff 60%, #f9ede0 100%)",
        //"linear-gradient(135deg, #f9ede0 0%, #ffffff 40%, #ffffff 60%, #ccf7fe 100%)",
      }}
    >
      {/* 배경 고정 타이틀 (검은색, 사라지지 않음. z-20으로 설정하여 네모가 이 글자 밑으로 팽창함) */}
      <h1 className="about-hero-title absolute top-[clamp(150px,22vh,260px)] left-8 tablet-p:top-[clamp(140px,20vh,240px)] tablet-p:left-34 tablet:top-[clamp(140px,20vh,280px)] tablet:left-48 text-[clamp(64px,16vw,96px)] tablet-p:text-[clamp(76px,12vw,110px)] tablet:text-[clamp(96px,9vw,150px)] font-dm font-bold tracking-widest uppercase text-[#0d1a1f] select-none pointer-events-none z-20">
        {ABOUT_HERO_DATA.title}
      </h1>

      {/* 팽창하는 네모 컨테이너 */}
      <div
        ref={nemoRef}
        className="absolute flex items-center justify-center overflow-hidden will-change-transform shadow-2xl z-10"
      >
        <div className="relative w-full h-full flex items-center justify-center">
          {ABOUT_HERO_DATA.keywords.map((kw, i) => (
            <div
              key={kw.id}
              className={`keyword-${i} absolute flex flex-col items-center justify-center text-white text-center`}
              style={{
                opacity: i === 0 ? 1 : 0, // 첫 번째 키워드만 초기에 보이도록
              }}
            >
              <span className="font-bold text-[clamp(24px,5vw,80px)] leading-none tracking-tight">
                {kw.text}
              </span>
              {kw.sub && (
                <span className="text-[clamp(12px,1.5vw,20px)] mt-3 font-light tracking-[0.2em] opacity-80 uppercase">
                  {kw.sub}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
