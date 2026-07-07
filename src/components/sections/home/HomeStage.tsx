"use client";

import React, { useRef, useEffect } from "react";
import { useHeroContext, useDevice } from "@/context";
import HeroSection from "./hero/HeroSection";
import { PainSection, PainSectionHandle } from "./pain/PainSection";
import { MessageSection, MessageSectionHandle } from "./message/MessageSection";
import { ForWhoSection, ForWhoSectionHandle } from "./forwho/ForWhoSection";
import { BrandStorySection } from "./story/BrandStorySection";
import { CTASection } from "./cta/CTASection";
import { Footer } from "@/components/layout";
import GlobalInteractionStage from "./GlobalInteractionStage";
import { INTERACTION_Z_INDEX } from "@/constants/interaction";

/**
 * HomeStage 컴포넌트: 전체 페이지의 섹션 스택 관리
 * - GSAP & ScrollTrigger를 활용한 전역 인터랙션은 GlobalInteractionStage에서 총괄합니다.
 */
export default function HomeStage(): React.ReactElement {
  const { isOn, isTransitioning, toggle, footerHeight, setIsTransitioning } = useHeroContext();

  // [V74.ScrollGuidance/STEP6] CTA에서 남은 isTransitioning 잔여 상태 정리.
  // 홈에 진입하는 모든 경로(최초 방문, 뒤로가기)에서 힌트/배너가 정상 재작동하도록 리셋.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { setIsTransitioning(false); }, []);
  const { isMobile, interactionMode, isMobileView, isTabletPortrait } =
    useDevice();
  const containerRef = useRef<HTMLDivElement>(null);

  // [V11.55] 각 섹션 내부 엘리먼트 제어를 위한 Ref 핸들
  const painRef = useRef<PainSectionHandle>(null);
  const messageRef = useRef<MessageSectionHandle>(null);
  const forwhoRef = useRef<ForWhoSectionHandle>(null);
  const sectionsContentRef = useRef<HTMLDivElement>(null);

  // Note: 기존의 useLogoJourney 및 Framer Motion 스크롤 감시 로직은
  // Phase 5 아키텍처 전환에 따라 GlobalInteractionStage의 GSAP 타임라인으로 이관됩니다.
  // [v16.3] 'isScrollable'은 HeroContext에서 전역 관리됩니다.

  return (
    <main className="relative w-full overflow-x-hidden">
      {/* 0.1 베이스 고정 배경색 레이어 */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: "var(--bg)",
          zIndex: INTERACTION_Z_INDEX.Z_BEHIND_BG,
        }}
      />
      {/* 0.2 히어로 온모드 전용 배경 이미지 레이어 */}
      {/* bottom: -250px: 뷰포트 아래 250px 여유 확보 → translateY 패닝 시 공백 없음 */}

      <div
        id="hero-bg-layer"
        className="fixed left-0 right-0 top-0 pointer-events-none"
        style={{
          bottom: -600,
          backgroundImage: "url('/images/home/white-light.webp')",
          backgroundSize: "cover",
          backgroundPosition: "center top",
          backgroundRepeat: "no-repeat",
          opacity: isOn ? 1 : 0,
          transition: "opacity 0.7s ease",
          zIndex: INTERACTION_Z_INDEX.Z_BEHIND_BG + 1,
        }}
      />

      {/* 0.3 페인 섹션 전용 배경 이미지 레이어 (크로스페이드) */}

      {isOn && (
        <div
          id="pain-bg-layer"
          className="fixed inset-0 pointer-events-none"
          style={{
            backgroundImage: "url('/images/home/blue-light.webp')",
            backgroundSize: "cover",
            backgroundPosition: "center top",
            backgroundRepeat: "no-repeat",
            transform: isMobile
              ? "scale(1.75) translateY(21%)" // 모바일 (<744px)
              : isTabletPortrait
                ? "scale(1.45) translateY(15%)" // 태블릿 세로 (744-991px)
                : "scale(1.4) translateY(15%)", // PC (≥992px)
            filter: "brightness(0.7)",
            opacity: 0,
            zIndex: INTERACTION_Z_INDEX.Z_BEHIND_BG + 2,
          }}
        />
      )}

      {/* 0. Global Interaction Layer (Outside pinned area for stable fixed positioning) */}
      <GlobalInteractionStage
        isMobile={isMobile}
        interactionMode={interactionMode}
        isMobileView={isMobileView}
        isTabletPortrait={isTabletPortrait}
        isOn={isOn}
        isTransitioning={isTransitioning}
        painRef={painRef}
        messageRef={messageRef}
        forwhoRef={forwhoRef}
        sectionsContentRef={sectionsContentRef}
      />

      {/* 콘텐츠 영역: Z_CONTENT(100)로 GlobalInteractionStage(Z_STAGE_WRAPPER:50)보다 상위 쌓임 맥락 확보 */}
      <div
        id="home-stage"
        ref={containerRef}
        className="relative w-full"
        style={{
          zIndex: INTERACTION_Z_INDEX.Z_CONTENT,
          touchAction: isMobile ? "pan-y" : "auto", // [V66.Phase3.2-Hotfix] iOS 첫 터치 뻑뻑함 해결
        }}
      >
        {/* 모든 섹션을 포함하는 래퍼: 섹션 이동 및 배경색 전환을 위한 핵심 ID(sections-content-wrapper) 탑재 */}
        <div
          id="sections-content-wrapper"
          ref={sectionsContentRef}
          className="relative w-full"
          style={{ zIndex: INTERACTION_Z_INDEX.Z_CONTENT }}
        >
          {/* 1. Hero Section */}
          <HeroSection id="section-hero" isOn={isOn} onToggle={toggle} />

          {/* 2-5. Journey Sections (Always in DOM for ScrollTrigger Stability) */}
          <div
            className={
              isOn
                ? "opacity-100 visible"
                : "opacity-0 invisible pointer-events-none transition-all duration-700"
            }
          >
            <PainSection ref={painRef} interactionMode={interactionMode} />
            <MessageSection ref={messageRef} />
            <ForWhoSection ref={forwhoRef} />
            <BrandStorySection />
            {/* [V11.4] 백스페이스 삭제 연출을 위한 물리적 브릿지 공간 확보 */}
            <div id="section-bridge" className="w-full h-[100svh]" />
            <CTASection />
            <Footer isHomeStage={true} />
          </div>
        </div>

        {/* [v5.3 Fix] 홈페이지(Pinned) 한정: 물리적 스페이서 대신 GSAP pinSpacing이 공간을 확보하므로 높이를 0으로 격리 */}
        <div className="h-0 pointer-events-none" />
      </div>
    </main>
  );
}
