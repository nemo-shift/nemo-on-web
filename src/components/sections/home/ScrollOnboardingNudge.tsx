'use client';

import React from 'react';
import { useHeroContext, useDevice } from '@/context';
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
  const { isMobileView } = useDevice();

  // [V75/STEP E] hasDismissedScrollNudge가 true면 active 자체를 끔 — 타이머도 중단됨
  const active = isOn && isScrollable && !isTransitioning && !hasDismissedScrollNudge;
  const { shouldShow, dismiss, isRepeat } = useScrollIdleNudge({ active });

  if (!active) return null;

  return (
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
        // [V74/STEP9] 보일 때만 클릭 가능 — 숨겨진 상태에서 콘텐츠 클릭을 막지 않도록
        pointerEvents: shouldShow ? 'auto' : 'none',
        cursor: 'pointer',
        textAlign: 'center',
        // [V78] 모바일은 좁은 화면 폭 대비 패딩을 줄이고, 화면 폭에 비례한
        // 너비를 써서 텍스트가 숨 쉴 공간을 확보 — 줄바꿈 개선이 목적.
        padding: isMobileView ? '24px 22px' : '34px 40px',
        borderRadius: 12,
        background: 'rgba(8,12,11,0.92)',
        border: '1px solid rgba(93,202,165,0.18)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
        width: isMobileView ? 'calc(100vw - 56px)' : undefined,
        maxWidth: isMobileView ? 300 : 360,
      }}
    >
      {/* [V75/STEP E] 우측 상단 — "다시 보지 않기" 텍스트 링크 */}
      <button
        type="button"
        // [V77 Fix] 활동 감지 훅이 window에서 pointerdown을 수신하므로,
        // click 시점에는 이미 dismiss로 pointerEvents:none이 되어 click이
        // 버튼에 도달하지 못하는 레이스가 있었다. 버블링 순서상 타깃(버튼)의
        // pointerdown이 window 리스너보다 항상 먼저 실행되므로, 이 단계에서
        // 영구 플래그를 설정하고 전파를 끊어 레이스를 원천 차단한다.
        onPointerDown={(e) => {
          e.stopPropagation();
          setHasDismissedScrollNudge(true);
        }}
        style={{
          position: 'absolute',
          top: isMobileView ? 10 : 12,
          right: isMobileView ? 10 : 14,
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

      <div
        style={{
          width: isMobileView ? 28 : 34,
          height: isMobileView ? 28 : 34,
          border: '1.5px solid #5DCAA5',
          borderRadius: 6,
          margin: isMobileView ? '0 auto 14px' : '0 auto 20px',
          position: 'relative',
        }}
        className="animate-nemo-pulse"
      >
        <div
          style={{
            width: isMobileView ? 6 : 8,
            height: isMobileView ? 6 : 8,
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
      <p style={{ fontSize: isMobileView ? 14 : 16, fontWeight: 500, color: '#F0EBE3', margin: '0 0 6px', letterSpacing: '-0.01em' }}>
        {isRepeat ? '스크롤해서 이야기를 이어가보세요' : '스크롤해서 이야기를 시작해보세요'}
      </p>
      <p style={{ fontSize: isMobileView ? 12 : 13, color: 'rgba(240,235,227,0.55)', margin: 0, fontFamily: 'var(--font-eb-garamond, inherit)' }}>
        브랜드가 켜지는 과정을 함께 따라가 보세요
      </p>
    </div>
  );
}
