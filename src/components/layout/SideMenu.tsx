'use client';

import React, { useRef, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { NAV_LINKS } from '@/data/nav';
import { INTERACTION_Z_INDEX } from '@/constants/interaction';
import { COLORS } from '@/constants/colors';

// ─────────────────────────────────────────────
// 메뉴 항목 (기획서 기준 4개)
// ─────────────────────────────────────────────
const MENU_ITEMS = NAV_LINKS.filter(l =>
  ['About', 'Offerings', 'Diagnosis', 'Contact'].includes(l.label)
);

// ─────────────────────────────────────────────
// 레이어 컬러 (기획서 기준)
// ─────────────────────────────────────────────
const LAYER_COLORS = {
  LAYER_1: COLORS.ACCENT,     // #E8734A (브랜드 오렌지)
  LAYER_2: COLORS.BRAND,      // #0891b2 (브랜드 틸)
  MAIN: COLORS.BG.CREAM,      // #f7f1e9 (크림)
};

// ─────────────────────────────────────────────
// 애니메이션 타이밍
// ─────────────────────────────────────────────
const TIMING = {
  LAYER_STAGGER: 0.08,
  LAYER_DURATION: 0.55,
  TEXT_STAGGER: 0.07,
  TEXT_DURATION: 0.45,
  DIM_DURATION: 0.4,
  CLOSE_DURATION: 0.4,
};

// ─────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────
interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * SideMenu 컴포넌트 (v12.0)
 *
 * - PC: 35vw / 태블릿: 55vw / 모바일: 100vw 패널 슬라이드
 * - 3중 레이어(Orange → Teal → Cream) Stagger 진입
 * - 딤 처리: 콘텐츠 오버레이 + fixed 요소(GlobalInteractionStage, Header) opacity 조절
 * - 서브페이지 분기: pathname 기반으로 GlobalInteractionStage 딤 처리 제외
 * - 스크롤: lenis.stop()/start()만 사용 (overflow: hidden 및 padding-right 보정 없음)
 * - 내부 스크롤: data-lenis-prevent 속성으로 패널 내부 독립 스크롤 허용
 * - 라우팅: GSAP onComplete 콜백 안에서 router.push() 실행
 * - 엣지케이스: 리사이즈 시 강제 닫힘, popstate(뒤로가기) 시 강제 닫힘
 */
export default function SideMenu({ isOpen, onClose }: SideMenuProps): React.ReactElement {
  const router = useRouter();
  const pathname = usePathname();
  const isHome = pathname === '/';

  // ── Refs ──
  const containerRef = useRef<HTMLDivElement>(null);
  const layer1Ref = useRef<HTMLDivElement>(null);
  const layer2Ref = useRef<HTMLDivElement>(null);
  const mainPanelRef = useRef<HTMLDivElement>(null);
  const dimRef = useRef<HTMLDivElement>(null);
  const menuItemsRef = useRef<(HTMLDivElement | null)[]>([]);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const isAnimatingRef = useRef(false);

  // ─────────────────────────────────────────
  // 딤 처리 대상 수집 (경로별 분기)
  // ─────────────────────────────────────────
  const getDimTargets = useCallback(() => {
    const targets: HTMLElement[] = [];

    // 헤더는 항상 딤 대상
    const headerEl = document.querySelector('header') as HTMLElement;
    if (headerEl) targets.push(headerEl);

    // GlobalInteractionStage는 홈('/')에서만 존재하므로 홈일 때만 딤 처리
    if (isHome) {
      const globalStage = document.querySelector('.global-interaction-stage') as HTMLElement;
      if (globalStage) targets.push(globalStage);
    }

    return targets;
  }, [isHome]);

  // ─────────────────────────────────────────
  // 열기 애니메이션
  // ─────────────────────────────────────────
  // 초기 마운트 시 레이어 위치 세팅 (GSAP이 독점 제어)
  useEffect(() => {
    gsap.set([layer1Ref.current, layer2Ref.current, mainPanelRef.current], { xPercent: 100 });
    gsap.set(dimRef.current, { opacity: 0 });
  }, []);

  const animateOpen = useCallback(() => {
    // 기존 진행 중인 애니메이션 강제 중단
    if (tlRef.current) {
      tlRef.current.kill();
    }
    isAnimatingRef.current = true;

    const tl = gsap.timeline({
      onComplete: () => { isAnimatingRef.current = false; },
    });
    tlRef.current = tl;

    // 1) 컨테이너 보이기
    tl.set(containerRef.current, { visibility: 'visible', pointerEvents: 'auto' });

    // 2) 딤 오버레이 페이드인 (PC/태블릿만 — 모바일에서는 CSS로 숨김)
    tl.to(dimRef.current, {
      opacity: 0.6,
      duration: TIMING.DIM_DURATION,
      ease: 'power2.out',
    }, 0);

    // 3) fixed 요소 딤 처리 (PC/태블릿만, 경로별 분기 적용)
    const isMobileView = window.innerWidth < 768;
    if (!isMobileView) {
      const dimTargets = getDimTargets();
      if (dimTargets.length > 0) {
        tl.to(dimTargets, {
          opacity: 0.3,
          duration: TIMING.DIM_DURATION,
          ease: 'power2.out',
        }, 0);
      }
    }

    // 4) 3중 레이어 슬라이드인 (오른쪽 → 왼쪽)
    const layers = [layer1Ref.current, layer2Ref.current, mainPanelRef.current];
    layers.forEach((layer, i) => {
      tl.fromTo(layer,
        { xPercent: 100 },
        {
          xPercent: 0,
          duration: TIMING.LAYER_DURATION,
          ease: 'power3.inOut',
        },
        TIMING.LAYER_STAGGER * i,
      );
    });

    // 4) 3중 레이어 슬라이드인 (오른쪽 → 왼쪽)
    const items = menuItemsRef.current.filter(Boolean);
    tl.fromTo(items,
      { y: 40, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: TIMING.TEXT_DURATION,
        stagger: TIMING.TEXT_STAGGER,
        ease: 'power2.out',
      },
      '-=0.15',
    );

    // 7) Lenis 스크롤 정지 (overflow: hidden 추가하지 않음)
    if (typeof window !== 'undefined' && window.lenis) {
      window.lenis.stop();
    }
  }, [getDimTargets]);

  // ─────────────────────────────────────────
  // 닫기 애니메이션
  // ─────────────────────────────────────────
  const animateClose = useCallback((targetHref?: string) => {
    // 기존 진행 중인 애니메이션 강제 중단
    if (tlRef.current) {
      tlRef.current.kill();
    }
    isAnimatingRef.current = true;

    const tl = gsap.timeline({
      onComplete: () => {
        isAnimatingRef.current = false;

        // 컨테이너 숨기기
        gsap.set(containerRef.current, { visibility: 'hidden', pointerEvents: 'none' });

        // Lenis 스크롤 복원
        if (typeof window !== 'undefined' && window.lenis) {
          window.lenis.start();
        }

        // ScrollTrigger 좌표 갱신 (Lenis 멈춤 중 레이아웃 틀어짐 방지)
        ScrollTrigger.refresh();

        // 상태 초기화
        onClose();

        // 라우팅: onComplete 안에서 실행 → 애니메이션 끊김 방지
        if (targetHref) {
          router.push(targetHref);
        }
      },
    });

    // 1) 메뉴 텍스트 & 모든 레이어 동시 슬라이드아웃 (All-at-once)
    const items = menuItemsRef.current.filter(Boolean);
    const layers = [mainPanelRef.current, layer2Ref.current, layer1Ref.current];

    tl.to(layers, {
      xPercent: 100,
      duration: TIMING.CLOSE_DURATION,
      ease: 'power3.inOut',
    }, 0);

    tl.to(items, {
      y: -20,
      opacity: 0,
      duration: 0.2,
      ease: 'power2.in',
    }, 0);

    // 4) 딤 해제
    tl.to(dimRef.current, {
      opacity: 0,
      duration: TIMING.DIM_DURATION,
      ease: 'power2.in',
    }, '-=0.3');

    // 5) fixed 요소 opacity 원복 (PC/태블릿만, 경로별 분기 적용)
    const isMobileView = window.innerWidth < 768;
    if (!isMobileView) {
      const dimTargets = getDimTargets();
      if (dimTargets.length > 0) {
        tl.to(dimTargets, {
          opacity: 1,
          duration: TIMING.DIM_DURATION,
          ease: 'power2.out',
        }, '-=0.3');
      }
    }
  }, [getDimTargets, onClose, router]);

  // ─────────────────────────────────────────
  // isOpen 변화 감지 → 열기 애니메이션
  // ─────────────────────────────────────────
  useEffect(() => {
    if (isOpen) {
      animateOpen();
    } else {
      // isOpen이 false로 변했는데 메뉴가 아직 열려있는 상태라면 닫기 애니메이션 실행
      const isVisible = containerRef.current?.style.visibility === 'visible';
      if (isVisible) {
        animateClose();
      }
    }
  }, [isOpen, animateOpen, animateClose]);

  // ─────────────────────────────────────────
  // 엣지케이스: 브라우저 뒤로가기 (popstate)
  // ─────────────────────────────────────────
  useEffect(() => {
    const handlePopState = () => {
      if (isOpen) animateClose();
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isOpen, animateClose]);

  // ─────────────────────────────────────────
  // 엣지케이스: 리사이즈 시 강제 닫기
  // ─────────────────────────────────────────
  useEffect(() => {
    const handleResize = () => {
      if (!isOpen) return;

      // 진행 중인 타임라인 강제 중지
      if (tlRef.current) {
        tlRef.current.kill();
        isAnimatingRef.current = false;
      }

      // 즉시 초기화 (애니메이션 없이 리셋)
      gsap.set(containerRef.current, { visibility: 'hidden' });
      gsap.set([layer1Ref.current, layer2Ref.current, mainPanelRef.current], { xPercent: 100 });
      gsap.set(dimRef.current, { opacity: 0 });

      // fixed 요소 원복
      const dimTargets = getDimTargets();
      if (dimTargets.length > 0) {
        gsap.set(dimTargets, { opacity: 1 });
      }

      // Lenis 원복
      if (typeof window !== 'undefined' && window.lenis) {
        window.lenis.start();
      }

      onClose();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen, getDimTargets, onClose]);

  // ─────────────────────────────────────────
  // 메뉴 항목 클릭 핸들러 (onComplete 라우팅)
  // ─────────────────────────────────────────
  const handleItemClick = (href: string) => {
    // 현재 페이지와 동일하면 그냥 닫기
    if (pathname === href) {
      animateClose();
      return;
    }
    animateClose(href);
  };

  // ─────────────────────────────────────────
  // 닫기 버튼 클릭 핸들러
  // ─────────────────────────────────────────
  const handleCloseClick = () => {
    animateClose();
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: INTERACTION_Z_INDEX.MENU, visibility: 'hidden' }}
    >
      {/* ── 딤 오버레이 (PC/태블릿만 — 모바일에서는 숨김) ── */}
      <div
        ref={dimRef}
        className="absolute inset-0 pointer-events-auto hidden md:block"
        style={{ backgroundColor: '#000', opacity: 0 }}
        onClick={handleCloseClick}
      />

      {/* ── 레이어 1: 오렌지 ── */}
      <div
        ref={layer1Ref}
        className="absolute top-0 right-0 h-full pointer-events-none"
        style={{
          width: 'var(--menu-width)',
          backgroundColor: LAYER_COLORS.LAYER_1,
        }}
      />

      {/* ── 레이어 2: 틸 ── */}
      <div
        ref={layer2Ref}
        className="absolute top-0 right-0 h-full pointer-events-none"
        style={{
          width: 'var(--menu-width)',
          backgroundColor: LAYER_COLORS.LAYER_2,
        }}
      />

      {/* ── 메인 패널 (크림) ── */}
      <div
        ref={mainPanelRef}
        className="absolute top-0 right-0 h-full pointer-events-auto overflow-y-auto"
        data-lenis-prevent
        style={{
          width: 'var(--menu-width)',
          backgroundColor: LAYER_COLORS.MAIN,
        }}
      >
        <div className="flex flex-col h-full px-8 py-6 md:px-12 md:py-8">

          {/* ── 메뉴 항목 (Stagger 등장 대상) ── */}
          <nav className="flex-1 flex flex-col justify-center gap-8 md:gap-10">
            {MENU_ITEMS.map((link, i) => (
              <div
                key={link.label}
                ref={el => { menuItemsRef.current[i] = el; }}
                className="opacity-0"
              >
                <button
                  type="button"
                  onClick={() => handleItemClick(link.href)}
                  className="group flex items-baseline gap-4 bg-transparent border-none cursor-pointer p-0 text-left w-full"
                >
                  <span
                    className="text-xs font-mono font-bold transition-colors duration-300 group-hover:text-[var(--accent)]"
                    style={{ color: COLORS.ACCENT }}
                  >
                    0{i + 1}
                  </span>
                  <span
                    className="font-suit text-[clamp(28px,5vw,52px)] font-black tracking-tighter uppercase transition-all duration-300 group-hover:translate-x-3 group-hover:text-[var(--accent)]"
                    style={{ color: COLORS.TEXT.DARK }}
                  >
                    {link.label}
                  </span>
                </button>
              </div>
            ))}
          </nav>

          {/* ── 하단 여백 ── */}
          <div className="h-8" />
        </div>
      </div>

      {/* ── CSS 변수: 반응형 패널 너비 (Mobile: 100vw / Tablet: 55vw / PC: 35vw) ── */}
      <style>{`
        :root {
          --menu-width: 100vw;
        }
        @media (min-width: 768px) {
          :root {
            --menu-width: 55vw;
          }
        }
        @media (min-width: 1024px) {
          :root {
            --menu-width: 35vw;
          }
        }
      `}</style>
    </div>
  );
}
