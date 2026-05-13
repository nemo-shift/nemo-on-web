'use client';

import React, { useRef, useEffect } from 'react';
import { useHeroContext } from '@/context';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { NemoIcon } from '@/components/ui';
import { cn } from '@/lib/utils';
import { INTERACTION_Z_INDEX } from '@/constants/interaction';

/**
 * Footer 컴포넌트 [V5.2 Reveal Pattern]
 * - 기획서 3단 레이아웃 구현
 * - Fixed 하단 고정 (z-index: -1)
 */
export default function Footer({ isHomeStage = false }: { isHomeStage?: boolean }): React.ReactElement {
  const { setFooterHeight, isTimelineReady } = useHeroContext();
  const footerRef = useRef<HTMLElement>(null);
  const currentYear = new Date().getFullYear();
  const pathname = usePathname();
  const isHome = pathname === '/';
  // [V11.34] ResizeObserver에 200ms 디바운스를 적용하여 리사이즈 중 부하 임계점 제어
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const element = footerRef.current;
    if (!element) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const actualHeight = element.offsetHeight;
        if (actualHeight > 0) {
          // [V11.34] 기존 타이머가 있다면 취소하고 마지막 1회만 실행
          if (debounceRef.current) clearTimeout(debounceRef.current);
          
          debounceRef.current = setTimeout(() => {
            setFooterHeight(actualHeight);
            debounceRef.current = null;
          }, 200); 
        }
      }
    });

    observer.observe(element);
    return () => {
      observer.disconnect();
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [setFooterHeight]);

  // [V11.Separation] 전역 레이아웃에서 호출된 푸터가 홈 페이지(/)일 경우 렌더링 제외 (이중 렌더링 방지)
  // [Hooks 규칙 준수] 모든 Hook 호출 이후에 리턴하도록 위치 조정
  if (isHome && !isHomeStage) {
    return <></>; 
  }

  return (
    <footer 
      ref={footerRef}
      /* 
       * [V11.33] 푸터 레이아웃 구조 정규화 (Final Tuning)
       * - 부모(footer) 레벨에 overflow-hidden을 배치하여 전체 스크롤 안전성 확보
       * - 자식(h2)의 overflow-hidden을 해제하여 텍스트 잘림 현상을 근본적으로 차단
       * - leading-none을 활용해 폰트 고유 여백을 제거하고 정석적인 gap/pt 수치로 밀착감 재현
       */

      //푸터 높이 안에서의 패딩등 조절
      className={cn(
        isHomeStage ? 'relative' : 'fixed bottom-0 left-0',
        'w-full flex flex-col transition-all duration-500 text-[#f0ebe3] select-none overflow-hidden',
        'h-[450px] px-6 py-12 pb-[80px]',                 // Mobile (Safety Margin for Browser UI)
        'tablet-p:h-[500px] tablet-p:px-8 tablet-p:py-14 tablet-p:pb-14',   // 744px
        'tablet:h-[600px] tablet:px-10 tablet:py-8',        // 992px
        'desktop-wide:h-[600px] desktop-wide:px-12 desktop-wide:py-12', // 1440px (User 기준)
        'desktop-cap:h-[750px] desktop-cap:px-16 desktop-cap:py-16'   // 1920px (User 기준)
      )}
      style={{ 
        backgroundColor: '#0a0a0a', 
        zIndex: isHomeStage ? INTERACTION_Z_INDEX.Z_FOOTER_UNDER : INTERACTION_Z_INDEX.Z_BEHIND_BG,
        pointerEvents: 'auto',
        // [V5.4 Fix] 홈페이지 진입 시 타임라인/레이아웃 준비 전 푸터 노출(Flash) 증상 차단
        opacity: isHome && !isTimelineReady ? 0 : 1,
        transition: 'opacity 0.3s'
      }}
    >
      {/* [상부 그룹] 상단(Get in touch)과 중앙(로고)의 밀착된 리듬 제어 */}
      <div className={cn(
        'flex flex-col transition-all duration-500',
        'gap-2',                              // Mobile: leading-none과 조합하여 초밀착
        'tablet-p:gap-3',                     // 744px
        'tablet:gap-4',                       // 992px
        'desktop-wide:gap-2',                 // 1440px: 사용자 미학적 기준 역계산
        'desktop-cap:gap-3'                   // 1920px: 사용자 미학적 기준 역계산
      )}>
        {/* 1. 상단: Get in touch */}
        <div className="flex justify-end pt-4">
          <Link 
            href="/contact"
            data-cursor="contact"
            className={cn(
              'font-medium tracking-tight hover:opacity-70 transition-all duration-500 leading-none',
              'text-lg tablet-p:text-xl tablet:text-2xl desktop-wide:text-3xl'
            )}
          >
            Get in touch
          </Link>
        </div>

        {/* 2. 중앙: 네모:ON 빅타이포 (정석적인 패딩 조절로 밀착 유지) */}
        <div className={cn(
          'flex items-center justify-center pointer-events-none transition-all duration-500',
          'pt-2',                             // Mobile: 마이너스 마진 제거 후 보정
          'tablet-p:pt-3',                    // 744px
          'tablet:pt-4',                      // 992px
          'desktop-wide:pt-2',                // 1440px
          'desktop-cap:pt-0'                  // 1920px
        )}>
          <h2 
            /* [V11.33] 메가 타이포그래피 정교화: leading-none으로 폰트 박스 최적화 */
            className={cn(
              'font-bold leading-none tracking-tighter whitespace-nowrap overflow-visible transition-all duration-500',
              'text-[clamp(60px,18vw,200px)]',             // Mobile
              'tablet-p:text-[clamp(100px,20vw,300px)]',     // 744px
              'tablet:text-[clamp(120px,22vw,450px)]',       // 992px
              'desktop-wide:text-[clamp(100px,18vw,450px)]',   // 1440px
              'desktop-cap:text-[clamp(120px,20vw,480px)]'   // 1920px
            )}
          >
            <span className="font-esamanru">네모</span>
            <NemoIcon 
              style={{ transform: 'translateY(-5vw)' }}
              gapClassName="gap-[0.5vw]"
              className="px-[2vw] mb-[2vw]"
              triangleClassName="border-l-[clamp(15px,3vw,60px)] border-r-[clamp(15px,3vw,60px)] border-b-[clamp(22.5px,4.5vw,90px)]"
              triangleStyle={{ transform: 'translateY(-2vw)' }}
              circleClassName={cn(
                'w-[clamp(22.5px,4.5vw,90px)] h-[clamp(22.5px,4.5vw,90px)] border-[0.6vw] transition-all duration-500',
                '-translate-y-[1.2vw] tablet-p:translate-y-0'
              )}
            />
            <span className="font-gmarket">ON</span>
          </h2>
        </div>
      </div>

      {/* 3. 하단: 소셜 및 저작권 (mt-auto를 통해 바닥에 완전히 고착) */}
      <div 
        className={cn(
          'flex flex-col tablet:flex-row justify-between items-end tablet:items-center gap-6 mt-auto border-t border-white/10 pt-8 transition-all duration-500'
        )}
      >
        <div className="flex items-center gap-6 text-sm font-medium tracking-wide">
          <a 
            href="https://threads.net" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-[#0891b2] transition-colors"
          >
            Threads
          </a>
          <a 
            href="https://instagram.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-[#0891b2] transition-colors"
          >
            Instagram
          </a>
          {/* [V11.33] 모바일에서 구분선 숨김 */}
          <span className="w-[1px] h-3 bg-white/20 mx-1 hidden tablet:block" />
          <Link 
            href="/privacy"
            className="hover:text-[#0891b2] transition-colors"
          >
            개인정보처리방침
          </Link>
        </div>
        
        <p 
          /* [V11.33] 저작권 텍스트 기기별 가독성 보정 */
          className={cn(
            'font-light tracking-wider transition-all duration-500 text-white/40',
            'text-[10px] tablet-p:text-[11px] tablet:text-xs'
          )}
        >
          © {currentYear} 네모:ON All rights reserved.
        </p>
      </div>
    </footer>
  );
}
