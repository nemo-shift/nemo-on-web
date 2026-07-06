'use client';

import React from 'react';
import { useHeroContext } from '@/context';
import { useScrollIdleNudge } from '@/hooks';
import { INTERACTION_Z_INDEX } from '@/constants/interaction';

/**
 * [V74.ScrollGuidance] 화면 중앙에 뜨는 스크롤 온보딩 배너.
 * 유휴 상태(스크롤 입력 없음)가 감지될 때만 등장 — 위치·타이밍 모두
 * 여정 진행률과 무관한 독립 오버레이.
 *
 * ⚠️ 카피 초안 — 배포 전 최종 문구 확인 필요.
 * ⚠️ background는 다크 히어로 배경 기준값.
 *    라이트 배경 구간에서 배너가 뜰 가능성이 있으면 --scroll-hint-fg 방식의
 *    반전 처리가 필요함 — 발견 시 사용자에게 보고 후 지시받을 것.
 */
export default function ScrollOnboardingNudge(): React.ReactElement | null {
  const {
    isOn,
    isScrollable,
    isTransitioning,
    hasDismissedScrollNudge,
    setHasDismissedScrollNudge,
  } = useHeroContext();

  // [V75/STEP E] hasDismissedScrollNudge가 true면 active 자체를 끔 — 타이머도 중단됨
  const active = isOn && isScrollable && !isTransitioning && !hasDismissedScrollNudge;
  const { shouldShow, dismiss, isRepeat } = useScrollIdleNudge({ active });

  if (!active) return null;

  return (
    <div
      onClick={dismiss}
      onTouchStart={dismiss}
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
        // [V74/STEP9] 보일 때만 클릭 가능 — 숨겨진 상태에서 콘텐츠 클릭을 막지 않도록
        pointerEvents: shouldShow ? 'auto' : 'none',
        cursor: 'pointer',
        textAlign: 'center',
        padding: '34px 40px',                          // [V75/STEP E] 확대
        borderRadius: 12,
        background: 'rgba(8,12,11,0.92)',              // [V75/STEP B]
        border: '1px solid rgba(93,202,165,0.18)',     // [V75/STEP B]
        boxShadow: '0 8px 32px rgba(0,0,0,0.35)',      // [V75/STEP B]
        maxWidth: 360,                                 // [V75/STEP E] 확대
      }}
    >
      {/* [V75/STEP E] 우측 상단 X — "다시 보지 않기" (본체 클릭과 역할 분리) */}
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setHasDismissedScrollNudge(true); }}
        aria-label="다시 보지 않기"
        style={{
          position: 'absolute',
          top: 10,
          right: 10,
          background: 'transparent',
          border: 'none',
          color: 'rgba(240,235,227,0.5)',
          cursor: 'pointer',
          padding: 4,
          lineHeight: 0,
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>

      <div
        style={{
          width: 34,
          height: 34,
          border: '1.5px solid #5DCAA5',
          borderRadius: 6,
          margin: '0 auto 20px',
          position: 'relative',
        }}
        className="animate-nemo-pulse"
      >
        <div
          style={{
            width: 8,
            height: 8,
            background: '#5DCAA5',
            borderRadius: '50%',
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%,-50%)',
          }}
        />
      </div>
      {/* [V75/STEP A] 최초/재등장 카피 분기 */}
      <p style={{ fontSize: 16, fontWeight: 500, color: '#F0EBE3', margin: '0 0 6px', letterSpacing: '-0.01em' }}>
        {isRepeat ? '스크롤해서 이야기를 이어가보세요' : '스크롤해서 이야기를 시작해보세요'}
      </p>
      <p style={{ fontSize: 13, color: 'rgba(240,235,227,0.55)', margin: 0, fontFamily: 'var(--font-eb-garamond, inherit)' }}>
        브랜드가 켜지는 과정을 함께 따라가 보세요
      </p>
    </div>
  );
}
