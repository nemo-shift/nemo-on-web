'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * GSAP ScrollTrigger 전역 정리 컴포넌트
 * 라우트 변경 시 ScrollTrigger 인스턴스 및 pin-spacer 등 정리
 *
 * Example usage:
 * <GlobalScrollTriggerCleanup />
 */
export default function GlobalScrollTriggerCleanup(): null {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (pathname === '/') return; // 홈은 GlobalInteractionStage가 직접 관리
    
    // [Surgical Precision Cleanup]
    // 신규 페이지(About 등)의 뼈대와 트리거가 무차별적으로 뜯겨나가지 않도록
    // 오직 과거 홈페이지(/)에 속해 있던 잔여 ScrollTrigger와 고정 핀 스페이서들만 저격하여 안전하게 소멸시킵니다.
    const allTriggers = ScrollTrigger.getAll();
    allTriggers.forEach((trigger) => {
      const el = trigger.trigger as HTMLElement;
      if (el && (
        el.id === 'home-stage' ||
        el.id === 'section-hero' ||
        el.id === 'section-pain' ||
        el.id === 'section-message' ||
        el.id === 'section-forwho' ||
        el.id === 'section-brand-story' ||
        el.id === 'section-cta' ||
        el.id === 'sections-content-wrapper' ||
        el.closest('#home-stage')
      )) {
        // 홈페이지 잔여물만 강제 소멸 및 레이아웃 상태 원복
        trigger.kill(true);
      }
    });

    // 홈페이지 관련 마크업 및 pin-spacer가 확실히 사멸되도록 후속 정리
    const homepagePinSpacers = document.querySelectorAll(
      '#home-stage .pin-spacer, #home-stage .gsap-pin-spacer, .pin-spacer[id*="home"], .gsap-pin-spacer[id*="home"]'
    );
    homepagePinSpacers.forEach((spacer) => spacer.remove());

    // 브라우저의 전체적인 ScrollTrigger 측정 좌표를 다시 싱크
    ScrollTrigger.refresh();
  }, [pathname]);

  return null;
}
