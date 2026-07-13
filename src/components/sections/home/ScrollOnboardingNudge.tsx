'use client';

import React from 'react';
import { useHeroContext, useDevice } from '@/context';
import { useScrollIdleNudge } from '@/hooks';
import { INTERACTION_Z_INDEX } from '@/constants/interaction';

/**
 * [V74.ScrollGuidance] 화면 중앙에 뜨는 스크롤 온보딩 배너.
 * 유휴 상태(스크롤 입력 없음)가 감지될 때만 등장.
 *
 * interactionMode 분기:
 *  - 'touch' → 손가락 아이콘 + 캐스케이드 화살표 애니
 *  - 'mouse' → 마우스 아이콘 + 휠 슬라이드 애니
 */

const ANIM_STYLES = `
  @keyframes nso-wheel-drop {
    0%              { transform: translateY(-3px); opacity: 0; }
    15%             { opacity: 1; transform: translateY(0); }
    70%             { opacity: 1; transform: translateY(5px); }
    88%, 100%       { opacity: 0; transform: translateY(5px); }
  }
  @keyframes nso-arrow-cascade {
    0%, 100%        { opacity: 0; transform: translateY(-3px); }
    25%             { opacity: 1; transform: translateY(0); }
    60%             { opacity: 0; transform: translateY(3px); }
  }
`;

/** 마우스 아이콘 + 휠 슬라이드 */
function MouseScrollIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      {/* 마우스 바디 */}
      <rect x="6.5" y="2" width="11" height="18" rx="5.5" stroke="currentColor" strokeWidth="1.5" />
      {/* 중앙 분할선 */}
      <line x1="12" y1="2" x2="12" y2="8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      {/* 애니메이션 휠 */}
      <rect
        x="10.5" y="5.5" width="3" height="4" rx="1.5"
        fill="currentColor"
        style={{ animation: 'nso-wheel-drop 1.6s ease-in-out infinite' }}
      />
    </svg>
  );
}

/** 캐스케이드 화살표 (터치) */
function TouchScrollIcon({ size }: { size: number }) {
  const arrowW = Math.round(size * 0.9);
  const arrowH = Math.round(size * 0.45);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      {([0, 0.28, 0.56] as const).map((delay, i) => (
        <svg
          key={i}
          width={arrowW} height={arrowH}
          viewBox="0 0 20 10"
          fill="none"
          aria-hidden="true"
          style={{ animation: `nso-arrow-cascade 1.4s ease-in-out infinite ${delay}s` }}
        >
          <path d="M2 2 L10 8 L18 2" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ))}
    </div>
  );
}

export default function ScrollOnboardingNudge(): React.ReactElement | null {
  const {
    isOn,
    isScrollable,
    isCtaFocused,
    hasDismissedScrollNudge,
    setHasDismissedScrollNudge,
  } = useHeroContext();
  const { isMobileView, isTabletPortrait, interactionMode } = useDevice();

  const active = isOn && isScrollable && !isCtaFocused && !hasDismissedScrollNudge;
  const { shouldShow, dismiss } = useScrollIdleNudge({ active });

  const isTouch = interactionMode === 'touch';
  const isPureMobile = isMobileView && !isTabletPortrait;
  const iconSize = isPureMobile ? 36 : isTabletPortrait ? 50 : 60;

  if (!active) return null;

  return (
    <>
      <style>{ANIM_STYLES}</style>
      <div
        onClick={dismiss}
        role="button"
        aria-label="안내 닫기"
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: `translate(-50%, -50%) scale(${shouldShow ? 1 : 0.96})`,
          zIndex: INTERACTION_Z_INDEX.Z_UI_GUIDE + 1,
          opacity: shouldShow ? 1 : 0,
          transition: 'opacity 0.5s ease, transform 0.5s ease',
          pointerEvents: shouldShow ? 'auto' : 'none',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: isPureMobile ? 14 : isTabletPortrait ? 18 : 20,
          padding: isPureMobile ? '44px 44px 36px' : isTabletPortrait ? '64px 56px 52px' : '72px 64px 60px',
          borderRadius: 16,
          background: 'rgba(8,12,11,0.92)',
          border: '1px solid rgba(93,202,165,0.18)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
        }}
      >
        {/* 다시 보지 않기 */}
        <button
          type="button"
          onPointerDown={(e) => {
            e.stopPropagation();
            setHasDismissedScrollNudge(true);
          }}
          style={{
            position: 'absolute',
            top: isPureMobile ? 10 : 12,
            right: isPureMobile ? 10 : 14,
            background: 'transparent',
            border: 'none',
            color: 'rgba(240,235,227,0.4)',
            cursor: 'pointer',
            padding: 0,
            fontSize: 11,
            letterSpacing: '0.02em',
            textDecoration: 'underline',
            textUnderlineOffset: 2,
          }}
        >
          다시 보지 않기
        </button>

        {/* 아이콘 */}
        <div style={{ color: '#5DCAA5' }}>
          {isTouch ? (
            <TouchScrollIcon size={iconSize} />
          ) : (
            <MouseScrollIcon size={iconSize} />
          )}
        </div>

        {/* scroll 텍스트 */}
        <p style={{
          margin: 0,
          fontSize: isMobileView ? 11 : 12,
          letterSpacing: '0.14em',
          color: 'rgba(240,235,227,0.45)',
          fontFamily: 'var(--font-dm-mono, monospace)',
          textTransform: 'uppercase',
        }}>
          scroll
        </p>
      </div>
    </>
  );
}
