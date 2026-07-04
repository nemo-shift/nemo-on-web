'use client';

import React, { useState, useEffect } from 'react';

/**
 * [V68.KakaoBanner] 카카오톡 인앱 브라우저 svh 미지원 대응 배너
 *
 * 카카오톡 인앱 WebView는 svh/lvh 단위를 지원하지 않아 레이아웃이 깨짐.
 * 외부 브라우저로 유도해 정상 화면을 보여주는 것이 목적.
 *
 * ─── 비활성화 방법 (카카오톡 WebView가 svh 지원 버전으로 업데이트되면) ────
 *   1. 아래 KAKAO_BANNER_ENABLED 를 false 로 변경 → 배너 즉시 비노출.
 *   2. 완전히 제거할 때: layout.tsx 에서 <KakaoTalkBanner /> 삭제 후 이 파일 삭제.
 *      globals.css 의 [V68.LegacyWebViewFallback] @supports 블록도 함께 삭제.
 * ────────────────────────────────────────────────────────────────────────────
 */

// ─── 비활성화 스위치 ─────────────────────────────────────────────────────────
// 카카오톡이 svh를 지원하는 WebView 버전으로 업데이트되면 false 로 변경
const KAKAO_BANNER_ENABLED = true;
// ─────────────────────────────────────────────────────────────────────────────

export default function KakaoTalkBanner() {
  const [isKakao, setIsKakao] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!KAKAO_BANNER_ENABLED) return;
    setIsKakao(navigator.userAgent.includes('KAKAOTALK'));
  }, []);

  if (!isKakao || dismissed) return null;

  const handleOpen = () => {
    window.open(window.location.href, '_blank');
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 99999,
        backgroundColor: 'rgba(13, 26, 31, 0.97)',
        borderTop: '1px solid rgba(240, 235, 227, 0.12)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        padding: '14px 20px',
        paddingBottom: 'calc(14px + env(safe-area-inset-bottom, 0px))',
      }}
    >
      <p
        style={{
          margin: 0,
          flex: 1,
          color: 'rgba(240, 235, 227, 0.8)',
          fontSize: '13px',
          lineHeight: 1.4,
          fontFamily: 'var(--font-suit), sans-serif',
        }}
      >
        인앱 브라우저에서는 일부 화면이<br />올바르게 표시되지 않을 수 있습니다.
      </p>
      <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
        <button
          onClick={handleOpen}
          style={{
            backgroundColor: '#e8734a',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            padding: '8px 14px',
            fontSize: '13px',
            fontFamily: 'var(--font-suit), sans-serif',
            fontWeight: 600,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          브라우저로 열기
        </button>
        <button
          onClick={() => setDismissed(true)}
          style={{
            backgroundColor: 'transparent',
            color: 'rgba(240, 235, 227, 0.4)',
            border: '1px solid rgba(240, 235, 227, 0.15)',
            borderRadius: '6px',
            padding: '8px 10px',
            fontSize: '13px',
            fontFamily: 'var(--font-suit), sans-serif',
            cursor: 'pointer',
          }}
        >
          ✕
        </button>
      </div>
    </div>
  );
}
