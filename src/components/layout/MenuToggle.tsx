'use client';

import React, { useRef, useEffect, useCallback } from 'react';
import gsap from 'gsap';
import { useHeroContext, useDevice } from '@/context';
import { usePathname } from 'next/navigation';
import { INTERACTION_Z_INDEX } from '@/constants/interaction';
import { cn } from '@/lib/utils';

// ─────────────────────────────────────────────
// 상수: SVG 앵커 포인트 (viewBox 0 0 30 30 기준 - 스케일업 버전)
// ─────────────────────────────────────────────
// 기본 3선(☰): HAMBURGER
const LINES_HAMBURGER = {
  top:    { x1: 4,  y1: 8,  x2: 26, y2: 8 },
  mid:    { x1: 4,  y1: 15, x2: 26, y2: 15 },
  bot:    { x1: 4,  y1: 22, x2: 26, y2: 22 },
};

// 닫힘 호버/열림 예고(▷): ARROW_RIGHT
const LINES_ARROW_RIGHT = {
  top:    { x1: 5,  y1: 5,  x2: 25, y2: 15 },
  mid:    { x1: 25, y1: 15, x2: 5,  y2: 25 },
  bot:    { x1: 5,  y1: 25, x2: 5,  y2: 5  },
};

// 열림 기본(X): CLOSE_X
const LINES_CLOSE_X = {
  top:    { x1: 7,  y1: 7,  x2: 23, y2: 23 },
  mid:    { x1: 15, y1: 15, x2: 15, y2: 15 }, // 중앙으로 수축
  bot:    { x1: 23, y1: 7,  x2: 7,  y2: 23 },
};

// 열림 호버/닫힘 예고(◁): ARROW_LEFT
const LINES_ARROW_LEFT = {
  top:    { x1: 25, y1: 5,  x2: 5,  y2: 15 },
  mid:    { x1: 5,  y1: 15, x2: 25, y2: 25 },
  bot:    { x1: 25, y1: 25, x2: 25, y2: 5  },
};

const MORPH_DURATION = 0.35;
const MORPH_EASE = 'power2.inOut';

// ─────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────
interface MenuToggleProps {
  isOpen: boolean;
  onToggle: () => void;
}

/**
 * MenuToggle 컴포넌트 (v14.5)
 *
 * - 4단계 인터랙션:
 *   1. 닫힘 기본: ☰ (HAMBURGER)
 *   2. 닫힘 호버: ▷ (ARROW_RIGHT)
 *   3. 열림 기본: X (CLOSE_X)
 *   4. 열림 호버: ◁ (ARROW_LEFT)
 */
export default function MenuToggle({ isOpen, onToggle }: MenuToggleProps): React.ReactElement | null {
  const { isOn, isScrollable } = useHeroContext();
  const { isMobile, isTabletPortrait, interactionMode } = useDevice();
  const pathname = usePathname();
  const isHome = pathname === '/';

  const lineTopRef    = useRef<SVGLineElement>(null);
  const lineMidRef    = useRef<SVGLineElement>(null);
  const lineBotRef    = useRef<SVGLineElement>(null);
  const containerRef  = useRef<HTMLButtonElement>(null);
  const isHoveringRef = useRef(false);

  // ─────────────────────────────────────────
  // 노출 조건 체크
  // ─────────────────────────────────────────
  const isVisible = !isHome || (isOn && isScrollable);

  // ─────────────────────────────────────────
  // SVG 선 한 번에 모핑하는 유틸
  // ─────────────────────────────────────────
  const morphTo = useCallback((
    target: typeof LINES_HAMBURGER,
    duration = MORPH_DURATION,
    ease = MORPH_EASE,
  ) => {
    const lines = [lineTopRef.current, lineMidRef.current, lineBotRef.current];
    const keys  = ['top', 'mid', 'bot'] as const;

    lines.forEach((line, i) => {
      if (!line) return;
      
      // X 상태로 모핑할 때 중간 선의 opacity 조절 (병렬 처리)
      if (target === LINES_CLOSE_X && keys[i] === 'mid') {
        gsap.to(line, { opacity: 0, duration: 0.2 });
      } else {
        gsap.to(line, { opacity: 1, duration: 0.2 });
      }

      gsap.to(line, {
        attr: target[keys[i]],
        duration,
        ease,
      });
    });
  }, []);

  // ─────────────────────────────────────────
  // 현재 상태에 따른 아이콘 형태 결정 및 적용
  // ─────────────────────────────────────────
  const updateIconForm = useCallback((duration?: number) => {
    // [Bug Fix] 터치 기기에서는 호버 상태(삼각형 모핑)를 강제로 무시
    const isHover = interactionMode === 'mouse' ? isHoveringRef.current : false;
    
    if (isOpen) {
      // 열림 상태: 호버 시 ◁, 기본 시 X
      morphTo(isHover ? LINES_ARROW_LEFT : LINES_CLOSE_X, duration);
    } else {
      // 닫힘 상태: 호버 시 ▷, 기본 시 ☰
      morphTo(isHover ? LINES_ARROW_RIGHT : LINES_HAMBURGER, duration);
    }
  }, [isOpen, morphTo, interactionMode]);

  // ─────────────────────────────────────────
  // 초기 상태 세팅 (GSAP 독점 제어)
  // ─────────────────────────────────────────
  useEffect(() => {
    ([lineTopRef, lineMidRef, lineBotRef]).forEach((ref, i) => {
      const key = ['top', 'mid', 'bot'][i] as keyof typeof LINES_HAMBURGER;
      if (ref.current) {
        gsap.set(ref.current, { attr: LINES_HAMBURGER[key] });
      }
    });
  }, []);

  // ─────────────────────────────────────────
  // isOpen 변화 → 열림/닫힘 모핑
  // ─────────────────────────────────────────
  useEffect(() => {
    updateIconForm();
  }, [isOpen, updateIconForm]);

  // ─────────────────────────────────────────
  // 호버 핸들러
  // ─────────────────────────────────────────
  const handleMouseEnter = useCallback(() => {
    isHoveringRef.current = true;
    updateIconForm(0.25);
  }, [updateIconForm]);

  const handleMouseLeave = useCallback(() => {
    isHoveringRef.current = false;
    updateIconForm(0.25);
  }, [updateIconForm]);

  // ─────────────────────────────────────────
  // 버튼 컬러 — 홈/서브페이지 분기 및 열림 상태 고속
  // ─────────────────────────────────────────
  const strokeColor = isOpen 
    ? '#0d1a1f' // 메뉴 열림 시: 항상 어두운 색 (크림색 배경 대비)
    : (isHome ? 'var(--header-fg, #f0ebe3)' : '#0d1a1f');

  if (!isVisible) return null;

  // 기기별 크기 3단 정기 분기 (v14.3)
  // 1. Mobile (Pure): 24px / 40px
  // 2. Tablet (Portrait): 30px / 48px
  // 3. PC (Desktop): 36px / 56px
  let iconSize = 36;
  let containerSize = 56;

  if (isMobile) {
    iconSize = 28;
    containerSize = 40;
  } else if (isTabletPortrait) {
    iconSize = 34;
    containerSize = 48;
  }

  return (
    <button
      ref={containerRef}
      type="button"
      aria-label={isOpen ? '메뉴 닫기' : '메뉴 열기'}
      aria-expanded={isOpen}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onToggle}
      className={cn(
        'fixed flex items-center justify-center bg-transparent border-none cursor-pointer p-0 transition-all duration-500',
        'top-5 right-6',                        // Mobile
        'tablet-p:top-6 tablet-p:right-8',      // 744px
        'tablet:top-7 tablet:right-10',         // 992px
        'desktop-wide:top-8 desktop-wide:right-12', // 1440px
        'desktop-cap:top-10 desktop-cap:right-16'   // 1920px
      )}
      style={{
        width: containerSize,
        height: containerSize,
        zIndex: INTERACTION_Z_INDEX.MENU_TOGGLE,
      }}
    >
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 30 30"
        fill="none"
        overflow="visible"
        aria-hidden="true"
      >
        {/* ── 위 선 (Top) ── */}
        <line
          ref={lineTopRef}
          x1={LINES_HAMBURGER.top.x1}
          y1={LINES_HAMBURGER.top.y1}
          x2={LINES_HAMBURGER.top.x2}
          y2={LINES_HAMBURGER.top.y2}
          stroke={strokeColor}
          strokeWidth="2.0"
          strokeLinecap="round"
          style={{ transition: 'stroke 0.3s ease' }}
        />
        {/* ── 중간 선 (Mid) ── */}
        <line
          ref={lineMidRef}
          x1={LINES_HAMBURGER.mid.x1}
          y1={LINES_HAMBURGER.mid.y1}
          x2={LINES_HAMBURGER.mid.x2}
          y2={LINES_HAMBURGER.mid.y2}
          stroke={strokeColor}
          strokeWidth="2.0"
          strokeLinecap="round"
          style={{ transition: 'stroke 0.3s ease' }}
        />
        {/* ── 아래 선 (Bot) ── */}
        <line
          ref={lineBotRef}
          x1={LINES_HAMBURGER.bot.x1}
          y1={LINES_HAMBURGER.bot.y1}
          x2={LINES_HAMBURGER.bot.x2}
          y2={LINES_HAMBURGER.bot.y2}
          stroke={strokeColor}
          strokeWidth="2.0"
          strokeLinecap="round"
          style={{ transition: 'stroke 0.3s ease' }}
        />
      </svg>
    </button>
  );
}
