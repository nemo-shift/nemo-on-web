'use client';

import React from 'react';
import { homeContent } from '@/data/homeContent';

type HeroSloganProps = {
  isOn: boolean;
  isMobile?: boolean;
};

/**
 * HeroSlogan 컴포넌트
 *
 * "불안을 끄고 / 기준을 켭니다" 슬로건.
 * - isOn=false: "불안을 끄고" 활성, "기준을 켭니다" 비활성
 * - isOn=true: "기준을 켭니다" 활성, "불안을 끄고" 비활성
 * OFF 상태에서는 전체 visibility:hidden 처리.
 * 모바일(768px 미만): 작은 폰트
 *
 * @param {boolean} isOn - ON/OFF 상태 [Required]
 * @param {boolean} isMobile - 모바일 뷰포트 여부 [Optional, HeroSection에서 주입]
 *
 * Example usage:
 * <HeroSlogan isOn={isOn} isMobile={isMobile} />
 */
export default function HeroSlogan({ isOn, isMobile = false }: HeroSloganProps): React.ReactElement {
  const [offText, onText] = homeContent.hero.slogan;

  return (
    <div
      style={{
        visibility: isOn ? 'visible' : 'hidden',
        opacity: isOn ? 1 : 0,
        transition: 'opacity 1s ease',
        marginBottom: '16px',
      }}
    >
      <style>{`
        .hero-slogan-line::after {
          content: '';
          position: absolute;
          bottom: -6px;
          left: 0;
          right: 0;
          height: 1.5px;
          background: linear-gradient(to right, var(--accent), transparent);
          opacity: 0.5;
        }
      `}</style>
      {/* 슬로건 라인 */}
      <div
        className="hero-slogan-line"
        style={{
          fontFamily: 'Noto Serif KR, serif',
          fontSize: isMobile ? 'clamp(22px, 7vw, 36px)' : 'clamp(28px, 4.2vw, 62px)',
          fontWeight: 700,
          lineHeight: 1.1,
          letterSpacing: '-.02em',
          display: 'flex',
          flexDirection: 'row',
          gap: isMobile ? 'clamp(8px, 2vw, 16px)' : 'clamp(8px, 1.2vw, 20px)',
          alignItems: 'flex-end',
          position: 'relative',
        }}
      >
        {/* "불안을 끄고" — isOn 시 흐려짐 */}
        <span
          style={{
            color: isOn
              ? 'rgba(13,26,31,.15)'
              : 'var(--fg)',
            transition: 'color .9s ease',
            display: 'block',
            textAlign: 'left',
          }}
        >
          {offText.split(' ').map((w, i) => (
            <React.Fragment key={i}>
              {i > 0 && <br />}
              {w}
            </React.Fragment>
          ))}
        </span>
        {/* "기준을 켭니다" — isOn 시 활성화 */}
        <span
          style={{
            color: isOn
              ? 'var(--fg)'
              : 'rgba(240,235,227,.12)',
            transition: 'color .9s ease',
            display: 'block',
            textAlign: 'left',
          }}
        >
          {onText.split(' ').map((w, i) => (
            <React.Fragment key={i}>
              {i > 0 && <br />}
              {w}
            </React.Fragment>
          ))}
        </span>
      </div>
    </div>
  );
}
