'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useHeaderTheme } from '@/hooks';
import { STICKY_CONTACT_DATA } from '@/data/shared';
import { INTERACTION_Z_INDEX } from '@/constants/interaction';

gsap.registerPlugin(useGSAP);

export default function StickyContactNemo() {
  const [isExpanded, setIsExpanded] = useState(false);
  const leftRef = useRef<HTMLAnchorElement>(null);
  const topRef = useRef<HTMLAnchorElement>(null);
  const headerTheme = useHeaderTheme();

  useGSAP(() => {
    if (!isExpanded) return;
    if (leftRef.current) {
      gsap.fromTo(leftRef.current,
        { opacity: 0, x: 12, scale: 0.9 },
        { opacity: 1, x: 0, scale: 1, duration: 0.3, ease: 'power2.out' }
      );
    }
    if (topRef.current) {
      gsap.fromTo(topRef.current,
        { opacity: 0, y: 12, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, duration: 0.3, delay: 0.06, ease: 'power2.out' }
      );
    }
  }, { dependencies: [isExpanded] });

  const isDarkBg = headerTheme === 'light';

  const optionClass = `w-12 h-12 rounded-lg flex items-center justify-center text-[11px] font-medium shadow-lg transition-colors leading-tight text-center whitespace-pre-line ${
    isDarkBg
      ? 'bg-[#E8734A]/80 text-white hover:bg-[#E8734A]'
      : 'bg-[#9ca3af]/80 text-white hover:bg-[#9ca3af]'
  }`;

  return (
    <div
      className="fixed bottom-6 right-6 tablet:bottom-10 tablet:right-10"
      style={{ zIndex: INTERACTION_Z_INDEX.Z_UI_GUIDE }}
    >
      <div className="relative">
        {/* 위쪽 옵션 (브랜드진단) */}
        {isExpanded && (
          <Link
            ref={topRef}
            href={STICKY_CONTACT_DATA.options[1].href}
            className={`absolute bottom-[calc(100%+8px)] right-0 ${optionClass}`}
          >
            {STICKY_CONTACT_DATA.options[1].label}
          </Link>
        )}

        <div className="flex items-end gap-2">
          {/* 왼쪽 옵션 (Contact) */}
          {isExpanded && (
            <Link
              ref={leftRef}
              href={STICKY_CONTACT_DATA.options[0].href}
              className={optionClass}
            >
              {STICKY_CONTACT_DATA.options[0].label}
            </Link>
          )}

          {/* 메인 트리거 버튼 */}
          <button
            type="button"
            aria-expanded={isExpanded}
            aria-label="문의 및 진단 메뉴 열기"
            onClick={() => setIsExpanded((v) => !v)}
            className={`w-14 h-14 rounded-lg flex items-center justify-center text-sm font-semibold tracking-wide shadow-lg transition-all duration-300 hover:scale-105 ${
              isDarkBg
                ? 'bg-[#f0ebe3] text-[#0d1a1f] hover:bg-white'
                : 'bg-[#0d1a1f] text-[#f0ebe3] hover:bg-[#0d1a1f]/90'
            }`}
          >
            {isExpanded ? 'off' : STICKY_CONTACT_DATA.trigger}
          </button>
        </div>
      </div>
    </div>
  );
}
