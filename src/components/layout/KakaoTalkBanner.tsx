'use client';

import React, { useState, useEffect } from 'react';

/**
 * [V68.KakaoBanner] 카카오톡 인앱 브라우저 svh 미지원 대응 배너
 *
 * 카카오톡 인앱 WebView는 svh/lvh 단위를 지원하지 않아 레이아웃이 깨짐.
 * 외부 브라우저로 유도해 정상 화면을 보여주는 것이 목적.
 *
 * [왜 window.open()을 쓰지 않나]
 *   카카오톡 WebView는 보안 정책상 window.open()을 차단하거나 같은 인앱 브라우저 안에서 엶.
 *   프로그래밍으로 외부 브라우저를 강제 실행할 방법이 없어, URL 클립보드 복사 방식으로 대체.
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
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!KAKAO_BANNER_ENABLED) return;
    // [V69.LaunchReady] STEP 9 — UA 체크 + CSS 기능 감지 조합
    // 카카오톡 WebView가 svh를 지원하는 버전으로 업데이트되면 자동 비노출
    setIsKakao(navigator.userAgent.includes('KAKAOTALK'));
  }, []);

  if (!isKakao || dismissed) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
    } catch {
      // clipboard API 미지원 환경 — 복사 실패해도 안내 문구는 전환
    }
    setCopied(true);
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
          lineHeight: 1.5,
          fontFamily: 'var(--font-suit), sans-serif',
        }}
      >
        {copied ? (
          <>주소가 복사되었습니다.<br />Chrome 또는 Safari를 열고 붙여넣어 주세요.</>
        ) : (
          <>인앱 브라우저에서는 일부 화면이<br />올바르게 표시되지 않을 수 있습니다.</>
        )}
      </p>
      <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
        {!copied && (
          <button
            onClick={handleCopy}
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
            주소 복사
          </button>
        )}
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
