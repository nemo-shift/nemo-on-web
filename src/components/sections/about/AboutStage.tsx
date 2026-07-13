'use client';

import React, { useEffect } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useHeroContext, useDevice } from '@/context';
import AboutHero from './hero/AboutHero';
import AboutPhilosophy from './philosophy/AboutPhilosophy';
import AboutFoundersNote from './founders-note/AboutFoundersNote';
import AboutMeaning from './meaning/AboutMeaning';
import AboutPrinciples from './principles/AboutPrinciples';
import AboutPromise from './promise/AboutPromise';
import StickyContactNemo from '@/components/ui/StickyContactNemo';
import { INTERACTION_Z_INDEX } from '@/constants/interaction';
import SubpageScrollHint from '@/components/ui/SubpageScrollHint';

export default function AboutStage() {
  const { toggle, setIsScrollable } = useHeroContext();
  const { interactionMode } = useDevice();

  useEffect(() => {
    // About 페이지는 구조적으로 스크롤이 가능해야 함 (홈페이지의 스크롤 잠금 해제)
    toggle();
    setIsScrollable(true);

    // [v26.98 UI Detail] 모바일 터치 관성 스크롤을 제어하여 핀 꼬임을 1차 방어 (홈페이지 싱크)
    if (interactionMode === 'touch') {
      ScrollTrigger.normalizeScroll({
        allowNestedScroll: true,
        momentum: 0
      });
    }

    // [Perfect Stacking Sync] 모든 서브 섹션들이 확실히 마운트된 직후,
    // 브라우저의 ScrollTrigger 물리 좌표 측정을 한 번 더 갱신하여 레이아웃 꼬임을 완벽 예방합니다.
    requestAnimationFrame(() => {
      ScrollTrigger.refresh();

    });

    // [Side-effect Free] 페이지 이탈 시 전역 설정 해제
    return () => {
      ScrollTrigger.normalizeScroll(false);
      delete document.body.dataset.headerTheme; // 다크 섹션 위치에서 이탈 시 헤더 테마 복원
    };
  }, [toggle, setIsScrollable, interactionMode]);

  return (
    <div id="about-stage" className="relative z-[1] w-full">
      {/* [V75/STEP D] About 전용 스크롤 힌트 — 하단 근접 시 자동 소멸 */}
      <SubpageScrollHint />
      {/* 스티키 문의 버튼 — fixed 오버레이, wrapper 밖 */}
      <StickyContactNemo />
      {/* 콘텐츠 영역 — 섹션 사이 미세 틈에서 고정 Footer 비침 방지용 안전 배경 */}
      <div className="relative w-full bg-[#f7f1e9]">

        {/* 1. Hero Section */}
        <AboutHero />

        {/* 2. Sections Wrapper (For Stacking Overlay) */}
        <div
          id="about-sections-wrapper"
          className="relative w-full"
          style={{ zIndex: INTERACTION_Z_INDEX.Z_CONTENT }}
        >
          <AboutPhilosophy />
          <AboutFoundersNote />
          <AboutMeaning />
          <AboutPrinciples />
          <AboutPromise />
        </div>

      </div>
    </div>
  );
}
