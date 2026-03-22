'use client';

import React, { useRef, useEffect, useCallback } from 'react';
import gsap from 'gsap';
import { useHeroContext } from '@/context';
import { usePathname } from 'next/navigation';
import { INTERACTION_Z_INDEX } from '@/constants/interaction';

// ─────────────────────────────────────────────
// 상수: SVG 앵커 포인트 (viewBox 0 0 24 24 기준)
// ─────────────────────────────────────────────
// 기본 3선(☰) 상태
const LINES_DEFAULT = {
  // 위 선: (3, 6) → (21, 6)
  top:    { x1: 3,  y1: 6,  x2: 21, y2: 6 },
  // 중간 선: (3, 12) → (21, 12)
  mid:    { x1: 3,  y1: 12, x2: 21, y2: 12 },
  // 아래 선: (3, 18) → (21, 18)
  bot:    { x1: 3,  y1: 18, x2: 21, y2: 18 },
};

// 호버 상태: ◀ (왼쪽 삼각형 윤곽선 — 안쪽 투명)
// 삼각형 꼭짓점: 왼쪽(4, 12) / 오른쪽 상단(20, 4) / 오른쪽 하단(20, 20)
const LINES_HOVER = {
  top:    { x1: 20, y1: 4,  x2: 4,  y2: 12 }, // 오른쪽 상단 → 왼쪽 꼭짓점
  mid:    { x1: 4,  y1: 12, x2: 20, y2: 20 }, // 왼쪽 꼭짓점 → 오른쪽 하단
  bot:    { x1: 20, y1: 20, x2: 20, y2: 4  }, // 오른쪽 하단 → 오른쪽 상단 (닫힘 변)
};

// 열림 상태: ▶ (오른쪽 삼각형 윤곽선)
// 삼각형 꼭짓점: 오른쪽(20, 12) / 왼쪽 상단(4, 4) / 왼쪽 하단(4, 20)
const LINES_OPEN = {
  top:    { x1: 4,  y1: 4,  x2: 20, y2: 12 }, // 왼쪽 상단 → 오른쪽 꼭짓점
  mid:    { x1: 20, y1: 12, x2: 4,  y2: 20 }, // 오른쪽 꼭짓점 → 왼쪽 하단
  bot:    { x1: 4,  y1: 20, x2: 4,  y2: 4  }, // 왼쪽 하단 → 왼쪽 상단 (닫힘 변)
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
 * MenuToggle 컴포넌트 (v13.0)
 *
 * - 항상 화면 우측 상단 고정(position: fixed)
 * - z-index: MENU_TOGGLE (10003) — SideMenu 패널(10002) 위
 * - 3단계 SVG 선 모핑 (GSAP):
 *   - 기본: 3선(☰)
 *   - 호버 (Closed): 왼쪽 삼각형(◀)
 *   - 열림: 오른쪽 삼각형(▶)
 * - 노출 조건:
 *   - 홈(/): isOn && isScrollable 둘 다 true일 때만 노출
 *   - 서브페이지: 항상 노출
 */
export default function MenuToggle({ isOpen, onToggle }: MenuToggleProps): React.ReactElement | null {
  const { isOn, isScrollable } = useHeroContext();
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
    target: typeof LINES_DEFAULT,
    duration = MORPH_DURATION,
    ease = MORPH_EASE,
  ) => {
    const lines = [lineTopRef.current, lineMidRef.current, lineBotRef.current];
    const keys  = ['top', 'mid', 'bot'] as const;

    lines.forEach((line, i) => {
      if (!line) return;
      gsap.to(line, {
        attr: target[keys[i]],
        duration,
        ease,
      });
    });
  }, []);

  // ─────────────────────────────────────────
  // 초기 상태 세팅 (GSAP 독점 제어)
  // ─────────────────────────────────────────
  useEffect(() => {
    ([lineTopRef, lineMidRef, lineBotRef]).forEach((ref, i) => {
      const key = ['top', 'mid', 'bot'][i] as keyof typeof LINES_DEFAULT;
      if (ref.current) {
        gsap.set(ref.current, { attr: LINES_DEFAULT[key] });
      }
    });
  }, []);

  // ─────────────────────────────────────────
  // isOpen 변화 → 열림/닫힘 모핑
  // ─────────────────────────────────────────
  useEffect(() => {
    if (isOpen) {
      // 열림: ▶
      morphTo(LINES_OPEN);
    } else {
      // 닫힘: 이미 호버 중이면 ◀, 아니면 ☰
      morphTo(isHoveringRef.current ? LINES_HOVER : LINES_DEFAULT);
    }
  }, [isOpen, morphTo]);

  // ─────────────────────────────────────────
  // 호버 핸들러 (닫힌 상태에서만 반응)
  // ─────────────────────────────────────────
  const handleMouseEnter = useCallback(() => {
    isHoveringRef.current = true;
    if (!isOpen) {
      morphTo(LINES_HOVER, 0.25);
    }
  }, [isOpen, morphTo]);

  const handleMouseLeave = useCallback(() => {
    isHoveringRef.current = false;
    if (!isOpen) {
      morphTo(LINES_DEFAULT, 0.25);
    }
  }, [isOpen, morphTo]);

  // ─────────────────────────────────────────
  // 버튼 컬러 — 홈/서브페이지 분기 및 열림 상태 고속
  // ─────────────────────────────────────────
  const strokeColor = isOpen 
    ? '#0d1a1f' // 메뉴 열림 시: 항상 어두운 색 (크림색 배경 대비)
    : (isHome ? 'var(--header-fg, #f0ebe3)' : '#0d1a1f');

  if (!isVisible) return null;

  return (
    <button
      ref={containerRef}
      type="button"
      aria-label={isOpen ? '메뉴 닫기' : '메뉴 열기'}
      aria-expanded={isOpen}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onToggle}
      className="fixed flex items-center justify-center bg-transparent border-none cursor-pointer p-0"
      style={{
        // 헤더의 px-6 py-5 md:px-12 md:py-8 에 맞춰 위치 동기화
        top: 'clamp(16px, 2vw, 32px)',
        right: 'clamp(24px, 3vw, 48px)',
        width: 40,
        height: 40,
        zIndex: INTERACTION_Z_INDEX.MENU_TOGGLE,
      }}
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        overflow="visible"
        aria-hidden="true"
      >
        {/* ── 위 선 (Top) ── */}
        <line
          ref={lineTopRef}
          x1={LINES_DEFAULT.top.x1}
          y1={LINES_DEFAULT.top.y1}
          x2={LINES_DEFAULT.top.x2}
          y2={LINES_DEFAULT.top.y2}
          stroke={strokeColor}
          strokeWidth="1.5"
          strokeLinecap="round"
          style={{ transition: 'stroke 0.3s ease' }}
        />
        {/* ── 중간 선 (Mid) ── */}
        <line
          ref={lineMidRef}
          x1={LINES_DEFAULT.mid.x1}
          y1={LINES_DEFAULT.mid.y1}
          x2={LINES_DEFAULT.mid.x2}
          y2={LINES_DEFAULT.mid.y2}
          stroke={strokeColor}
          strokeWidth="1.5"
          strokeLinecap="round"
          style={{ transition: 'stroke 0.3s ease' }}
        />
        {/* ── 아래 선 (Bot) ── */}
        <line
          ref={lineBotRef}
          x1={LINES_DEFAULT.bot.x1}
          y1={LINES_DEFAULT.bot.y1}
          x2={LINES_DEFAULT.bot.x2}
          y2={LINES_DEFAULT.bot.y2}
          stroke={strokeColor}
          strokeWidth="1.5"
          strokeLinecap="round"
          style={{ transition: 'stroke 0.3s ease' }}
        />
      </svg>
    </button>
  );
}
