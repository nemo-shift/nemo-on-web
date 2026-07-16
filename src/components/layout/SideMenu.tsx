'use client';

import React, { useRef, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Home } from 'lucide-react';
import { useDevice, useHeroContext } from '@/context';
import { NAV_LINKS } from '@/data/nav';
import { INTERACTION_Z_INDEX, MENU_WIDTH } from '@/constants/interaction';
import { COLORS } from '@/constants/colors';
// [V78] markPushNav 제거 — popstate 기반 스크롤 복원으로 전환 (LenisScrollRestoration)

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

  // [v11.33 Refactoring] 기기 판별 조건(if) 제거에 따른 isMobileView 신호 완전 소멸
  
  // ── Refs ──
  const containerRef = useRef<HTMLDivElement>(null);
  const layer1Ref = useRef<HTMLDivElement>(null);
  const layer2Ref = useRef<HTMLDivElement>(null);
  const mainPanelRef = useRef<HTMLDivElement>(null);
  const dimRef = useRef<HTMLDivElement>(null);
  const menuItemsRef = useRef<(HTMLDivElement | null)[]>([]);
  const homeButtonRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const isAnimatingRef = useRef(false);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const prevIsOpenRef = useRef(false);           // [V78] 실제 전환만 감지하는 가드
  const pendingNavHrefRef = useRef<string | null>(null);  // [V78] 내비게이션 목적지 저장
  const navFallbackRef = useRef<ReturnType<typeof setTimeout> | null>(null); // fallback 타이머

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

    // 3) fixed 요소 딤 처리 (전 기기 공통 적용)
    const dimTargets = getDimTargets();
    if (dimTargets.length > 0) {
      tl.to(dimTargets, {
        opacity: 0.3,
        duration: TIMING.DIM_DURATION,
        ease: 'power2.out',
      }, 0);
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

    // 4) 메뉴 텍스트 + 홈 버튼 Stagger 등장
    const items = [homeButtonRef.current, ...menuItemsRef.current].filter(Boolean);
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (typeof window !== 'undefined' && (window as any).lenis) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).lenis.stop();
    }
  }, [getDimTargets]);

  // ─────────────────────────────────────────
  // 닫기 애니메이션
  // ─────────────────────────────────────────
  // [V78] 레이어 슬라이드아웃 — 내비게이션 완료 후 또는 단순 닫기 시 호출
  const revealAndReset = useCallback(() => {
    const tl = gsap.timeline({
      onComplete: () => {
        isAnimatingRef.current = false;
        gsap.set(containerRef.current, { visibility: 'hidden', pointerEvents: 'none' });

        // Lenis 스크롤 복원
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const lenis = (window as any).lenis;
        if (lenis) lenis.start();

        ScrollTrigger.refresh();
        onClose();
      },
    });
    tlRef.current = tl; // [V78] 단일 소유권 — kill 로직이 제어 가능하도록

    const items = [homeButtonRef.current, ...menuItemsRef.current].filter(Boolean);
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

    const dimTargets = getDimTargets();
    tl.to(dimRef.current, {
      opacity: 0,
      duration: TIMING.DIM_DURATION,
      ease: 'power2.in',
    }, '-=0.3');

    if (dimTargets.length > 0) {
      tl.to(dimTargets, {
        opacity: 1,
        duration: TIMING.DIM_DURATION,
        ease: 'power2.out',
      }, '-=0.3');
    }
  }, [getDimTargets, onClose]);

  const animateClose = useCallback((targetHref?: string, scrollToTop?: boolean) => {
    // 기존 진행 중인 애니메이션 강제 중단
    if (tlRef.current) {
      tlRef.current.kill();
    }
    isAnimatingRef.current = true;

    // ── 내비게이션이 있는 경우: 레이어를 덮은 채 유지 ──
    if (targetHref) {
      // 메뉴 텍스트만 페이드아웃 (레이어는 그대로)
      const items = [homeButtonRef.current, ...menuItemsRef.current].filter(Boolean);
      const tl = gsap.timeline({
        onComplete: () => {
          // [V78.4] 홈 이탈 시에만 ScrollTrigger 전역 kill (20000px+ pin-spacer 되감기 방지)
          // 서브페이지 간 이동은 GlobalScrollTriggerCleanup이 전담
          if (isHome) {
            ScrollTrigger.getAll().forEach(st => st.kill());
          }
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const lenis = (window as any).lenis;
          if (lenis) lenis.scrollTo(0, { immediate: true });
          window.scrollTo(0, 0);

          // [V78.2] 폴링 대신 pendingNavHrefRef에 목적지 저장
          // → useEffect([pathname])에서 도착을 감지하여 revealAndReset() 호출
          pendingNavHrefRef.current = targetHref;

          // fallback: 최대 2.5초 대기 (느린 네트워크 대비)
          navFallbackRef.current = setTimeout(() => {
            if (pendingNavHrefRef.current) {
              pendingNavHrefRef.current = null;
              revealAndReset();
            }
          }, 2500);

          router.push(targetHref);
        },
      });
      tlRef.current = tl;

      tl.to(items, {
        y: -20,
        opacity: 0,
        duration: 0.2,
        ease: 'power2.in',
      });

      return;
    }

    // ── 내비게이션 없는 경우: 기존 닫기 동작 (레이어 슬라이드아웃) ──
    if (scrollToTop) {
      // 같은 페이지 재클릭 — 슬라이드아웃 후 최상단 스크롤
      const tl = gsap.timeline({
        onComplete: () => {
          isAnimatingRef.current = false;
          gsap.set(containerRef.current, { visibility: 'hidden', pointerEvents: 'none' });

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const lenis = (window as any).lenis;
          if (lenis) lenis.start();
          ScrollTrigger.refresh();
          onClose();

          // [V74.ScrollGuidance/STEP8] 서브페이지는 GSAP 핀과 무관하므로 즉시 점프
          if (lenis) {
            lenis.scrollTo(0, { immediate: true });
          } else {
            window.scrollTo({ top: 0, behavior: 'auto' });
          }
        },
      });
      tlRef.current = tl;

      const items = [homeButtonRef.current, ...menuItemsRef.current].filter(Boolean);
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

      const dimTargets = getDimTargets();
      tl.to(dimRef.current, {
        opacity: 0,
        duration: TIMING.DIM_DURATION,
        ease: 'power2.in',
      }, '-=0.3');

      if (dimTargets.length > 0) {
        tl.to(dimTargets, {
          opacity: 1,
          duration: TIMING.DIM_DURATION,
          ease: 'power2.out',
        }, '-=0.3');
      }

      return;
    }

    // 단순 닫기 (Escape, 딤 클릭 등)
    revealAndReset();
  }, [getDimTargets, onClose, revealAndReset, router]);

  // ─────────────────────────────────────────
  // [V78.1] isOpen "전환" 감지 — 콜백 정체성 변경으로 인한 재발사 방지
  // ─────────────────────────────────────────
  useEffect(() => {
    const prev = prevIsOpenRef.current;

    if (isOpen && !prev) {
      // false → true 전환: 열기
      prevIsOpenRef.current = true;
      animateOpen();
    } else if (!isOpen && prev) {
      // true → false 전환: 닫기
      prevIsOpenRef.current = false;
      const isVisible = containerRef.current?.style.visibility === 'visible';
      if (isVisible) {
        animateClose();
      }
    }
    // 콜백 정체성만 바뀐 경우 (전환 없음) → 아무것도 하지 않음
  }, [isOpen, animateOpen, animateClose]);

  // ─────────────────────────────────────────
  // [V78.2] pathname 변경 감지 → 내비게이션 도착 시 레이어 걷어내기
  // ─────────────────────────────────────────
  useEffect(() => {
    if (!pendingNavHrefRef.current) return;
    if (pathname === pendingNavHrefRef.current) {
      // 도착 확인 — fallback 타이머 정리 + 레이어 슬라이드아웃
      pendingNavHrefRef.current = null;
      if (navFallbackRef.current) {
        clearTimeout(navFallbackRef.current);
        navFallbackRef.current = null;
      }
      revealAndReset();
    }
  }, [pathname, revealAndReset]);

  // ─────────────────────────────────────────
  // 접근성: Escape 닫기 + 포커스 트랩 + 포커스 저장/복원
  // ─────────────────────────────────────────
  useEffect(() => {
    if (isOpen) {
      // 메뉴 열릴 때: 현재 포커스 저장 → 닫힌 후 복원용
      returnFocusRef.current = document.activeElement as HTMLElement;

      // 초기 포커스: 오픈 애니메이션 완료 후 홈 버튼에 포커스
      const focusTimer = setTimeout(() => {
        const firstBtn = homeButtonRef.current?.querySelector<HTMLElement>('button');
        firstBtn?.focus();
      }, (TIMING.LAYER_DURATION + TIMING.TEXT_STAGGER * MENU_ITEMS.length + TIMING.TEXT_DURATION) * 1000 + 100);

      // Escape 닫기 + Tab 포커스 트랩
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          animateClose();
          return;
        }
        if (e.key === 'Tab' && mainPanelRef.current) {
          const focusables = Array.from(
            mainPanelRef.current.querySelectorAll<HTMLElement>('button:not([disabled])')
          );
          if (focusables.length === 0) return;
          const first = focusables[0];
          const last = focusables[focusables.length - 1];
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => {
        clearTimeout(focusTimer);
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      // 메뉴 닫힐 때: 이전 포커스 복원 (닫기 애니 완료 후)
      const restoreTimer = setTimeout(() => {
        returnFocusRef.current?.focus();
      }, TIMING.CLOSE_DURATION * 1000 + 50);
      return () => clearTimeout(restoreTimer);
    }
  }, [isOpen, animateClose]);

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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (typeof window !== 'undefined' && (window as any).lenis) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).lenis.start();
      }

      onClose();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen, getDimTargets, onClose]);

  // ─────────────────────────────────────────
  // 메뉴 열림 시 프리페치
  // ─────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    MENU_ITEMS.forEach(({ href }) => router.prefetch(href));
    router.prefetch('/');
  }, [isOpen, router]);

  // ─────────────────────────────────────────
  // 메뉴 항목 클릭 핸들러
  // ─────────────────────────────────────────

  // [V78] navigateTo 제거 — animateClose(targetHref)로 통합.
  // 내비게이션 시 레이어를 덮은 채 유지 → 페이지 전환 완료 후 슬라이드아웃.

  const handleHomeClick = () => {
    if (isHome) {                    // ③ 기존 특례 유지
      animateClose();
    } else {
      animateClose('/');             // targetHref 전달 → 레이어 유지 + 라우팅
    }
  };

  const handleItemClick = (href: string) => {
    if (pathname === href) {         // ② 같은 페이지: 기존 동작 그대로
      animateClose(undefined, true);
      return;
    }
    animateClose(href);              // targetHref 전달 → 레이어 유지 + 라우팅
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
      className="side-menu-container fixed inset-0 pointer-events-none"
      style={{ zIndex: INTERACTION_Z_INDEX.Z_MENU_DRAWER, visibility: 'hidden' }}
    >
      {/* ── 딤 오버레이 (PC/태블릿만 — 모바일에서는 숨김) ── */}
      <div
        ref={dimRef}
        className="absolute inset-0 pointer-events-auto hidden tablet-p:block"
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
        <div className="flex flex-col h-full px-8 py-6 tablet-p:px-12 tablet-p:py-8">

          {/* ── 홈 버튼 (좌상단) ── */}
          <div ref={homeButtonRef} className="opacity-0 mt-3 tablet-p:mt-6 tablet:mt-8">
            <button
              type="button"
              onClick={handleHomeClick}
              className="group flex items-center gap-2 bg-transparent border-none cursor-pointer p-0"
            >
              <Home
                className="transition-colors duration-300 group-hover:text-[var(--accent)] w-6 h-6 tablet-p:w-8 tablet-p:h-8 tablet:w-11 tablet:h-11"
                style={{ color: COLORS.TEXT.DARK }}
              />
            </button>
          </div>

          {/* ── 메뉴 항목 (Stagger 등장 대상) ── */}
          <nav className="flex-1 flex flex-col justify-center gap-8 tablet-p:gap-10">
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

      {/* ── CSS 변수: 반응형 패널 너비 (Mobile / Tablet / PC) ── */}
      <style>{`
        .side-menu-container {
          --menu-width: ${MENU_WIDTH.MOBILE};
        }
        @media (min-width: 744px) {
          .side-menu-container {
            --menu-width: ${MENU_WIDTH.TABLET_PORTRAIT};
          }
        }
        @media (min-width: 992px) {
          .side-menu-container {
            --menu-width: ${MENU_WIDTH.TABLET_LANDSCAPE};
          }
        }
        @media (min-width: 1280px) {
          .side-menu-container {
            --menu-width: ${MENU_WIDTH.PC};
          }
        }
      `}</style>
    </div>
  );
}
