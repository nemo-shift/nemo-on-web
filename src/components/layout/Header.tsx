'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useHeroContext } from '@/context/HeroContext';
import { homeContent } from '@/data/homeContent';

/**
 * Header 컴포넌트
 *
 * position: fixed, 투명 배경, pointer-events: none (햄버거만 pointer-events: auto)
 * - 좌측: NEMO:ON 로고 (isOn=false: 크림색, isOn=true: 다크색)
 * - 우측: 햄버거 버튼 (2줄, 40×40 클릭 영역)
 * - 메뉴 열면: 전체화면 오버레이, 좌측 로고 / 우측 네비 / 우상단 X
 */
export default function Header(): React.ReactElement {
  const { isOn } = useHeroContext();
  const [menuOpen, setMenuOpen] = useState(false);
  const { navLinks } = homeContent.hero;

  const logoColor = isOn ? '#0d1a1f' : '#e8d5b0';
  const lineColor = isOn ? '#0d1a1f' : '#f0ebe3';

  return (
    <>
      <header
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 9000,
          background: 'transparent',
          pointerEvents: 'none',
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          transition: 'color 0.3s ease',
        }}
      >
        {/* 좌측 로고 — 네모:ON */}
        <Link
          href="/"
          style={{
            pointerEvents: 'auto',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            color: logoColor,
            transition: 'color .7s ease',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-bebas)',
              fontSize: 'clamp(18px, 2vw, 28px)',
              letterSpacing: '.14em',
            }}
          >
            네모
          </span>
          <span
            style={{
              position: 'relative',
              display: 'inline-flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '3px',
              margin: '0 5px',
            }}
          >
            <span
              style={{
                width: 0,
                height: 0,
                borderLeft: '5px solid transparent',
                borderRight: '5px solid transparent',
                borderBottom: '9px solid #0891b2',
                transition: 'border-color .7s',
              }}
            />
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                border: `1px solid ${isOn ? '#0891b2' : '#c4a882'}`,
                background: 'transparent',
                transition: 'border-color .7s',
              }}
            />
          </span>
          <span
            style={{
              fontFamily: 'var(--font-bebas)',
              fontSize: 'clamp(18px, 2vw, 28px)',
              letterSpacing: '.14em',
            }}
          >
            ON
          </span>
        </Link>

        {/* 우측 햄버거 버튼 */}
        <button
          type="button"
          aria-label="메뉴 열기"
          onClick={() => setMenuOpen(true)}
          style={{
            pointerEvents: 'auto',
            width: 40,
            height: 40,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
          }}
        >
          <span
            style={{
              width: 22,
              height: 1.5,
              backgroundColor: lineColor,
              transition: 'background-color .7s ease',
            }}
          />
          <span
            style={{
              width: 22,
              height: 1.5,
              backgroundColor: lineColor,
              transition: 'background-color .7s ease',
            }}
          />
        </button>
      </header>

      {/* 전체화면 메뉴 오버레이 */}
      {menuOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="메뉴"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9100,
            background: '#0a0a0a',
            display: 'flex',
            flexDirection: 'column',
            padding: '24px',
            animation: 'menuFadeIn 0.3s ease forwards',
          }}
        >
          <style>{`
            @keyframes menuFadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
          `}</style>

          {/* 상단: 로고 + X 버튼 */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '48px',
            }}
          >
            <Link
              href="/"
              onClick={() => setMenuOpen(false)}
              style={{
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                color: '#f0ebe3',
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-bebas)',
                  fontSize: 'clamp(18px, 2vw, 28px)',
                  letterSpacing: '.14em',
                }}
              >
                네모
              </span>
              <span
                style={{
                  display: 'inline-flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '3px',
                  margin: '0 5px',
                }}
              >
                <span
                  style={{
                    width: 0,
                    height: 0,
                    borderLeft: '5px solid transparent',
                    borderRight: '5px solid transparent',
                    borderBottom: '9px solid #0891b2',
                  }}
                />
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    border: '1px solid #c4a882',
                    background: 'transparent',
                  }}
                />
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-bebas)',
                  fontSize: 'clamp(18px, 2vw, 28px)',
                  letterSpacing: '.14em',
                }}
              >
                ON
              </span>
            </Link>

            <button
              type="button"
              aria-label="메뉴 닫기"
              onClick={() => setMenuOpen(false)}
              style={{
                width: 40,
                height: 40,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#f0ebe3',
                fontSize: 24,
                fontWeight: 300,
              }}
            >
              ×
            </button>
          </div>

          {/* 네비게이션 링크 */}
          <nav
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
              paddingLeft: '8px',
            }}
          >
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                style={{
                  fontSize: 'clamp(18px, 3vw, 28px)',
                  letterSpacing: '.1em',
                  color: '#f0ebe3',
                  textDecoration: 'none',
                  textTransform: 'uppercase',
                  transition: 'opacity .2s',
                }}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </>
  );
}
