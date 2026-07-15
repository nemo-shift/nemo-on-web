'use client';

import React, { useRef, useEffect } from 'react';
import { useHeroContext } from '@/context';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { NemoIcon } from '@/components/ui';
import { cn } from '@/lib/utils';
import { renderBrandText } from '@/lib/renderBrandText';
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
  const router = useRouter();
  const isHome = pathname === '/';

  const handleContactClick = (e: React.MouseEvent) => {
    if (pathname === '/contact') {
      // [Footer Fix] 같은 페이지로의 Link는 Next가 라우트 전환으로
      // 인식하지 않아 LenisScrollRestoration의 pathname 감시 useEffect가
      // 재실행되지 않는다 — 직접 최상단으로 이동시킨다.
      e.preventDefault();
      const lenis = (window as any).lenis;
      if (lenis) {
        lenis.scrollTo(0, { immediate: true }); // STEP8과 동일 정책: 즉시 이동
      } else {
        window.scrollTo(0, 0);
      }
    } else {
      // [Footer Fix] 다른 페이지에서 이동하는 경우, 저장된 스크롤 위치로
      // 잘못 복원되지 않도록 명시적 이동 플래그를 남긴다.
      try { sessionStorage.setItem('PUSH_NAV', '1'); } catch { /* ignore */ }
    }
  };
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
      id="site-footer"
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
        'footer-pb w-full flex flex-col transition-all duration-500 text-[#f0ebe3] select-none overflow-hidden',
        'min-h-[340px] px-6 pt-6 pb-8',                        // Mobile
        'tablet-p:min-h-[500px] tablet-p:px-8 tablet-p:py-14 tablet-p:pb-14',   // 744px
        'tablet:min-h-[420px] tablet:px-10 tablet:py-2',        // 992px
        'desktop-wide:min-h-[420px] desktop-wide:px-12 desktop-wide:py-4', // 1440px (User 기준)
        'desktop-cap:min-h-[550px] desktop-cap:px-16 desktop-cap:py-6'   // 1920px (User 기준)
      )}
      style={{
        backgroundColor: '#0a0a0a',
        zIndex: isHomeStage ? INTERACTION_Z_INDEX.Z_FOOTER_UNDER : 0,
        pointerEvents: 'auto',
        // [V5.4 Fix] 홈페이지 진입 시 타임라인/레이아웃 준비 전 푸터 노출(Flash) 증상 차단
        opacity: isHome && !isTimelineReady ? 0 : 1,
        transition: 'opacity 0.3s',
        // [V67.ViewportFix] paddingBottom은 .footer-pb 클래스로 이동 (globals.css).
        // 카카오 인앱 분기를 인라인 style이 아닌 CSS 클래스로 처리해야
        // 첫 렌더부터 적용되어 footerHeight 60px 게이트(재빌드) 트리거를 방지할 수 있음.
      }}
    >
      {/* [상부 그룹] 브랜드 빅타이포 */}
      <div className={cn(
        'flex flex-col transition-all duration-500',
        'gap-2',
        'tablet-p:gap-3',
        'tablet:gap-4',
        'desktop-wide:gap-2',
        'desktop-cap:gap-3'
      )}>
        <div className="absolute top-[92px] right-6 tablet-p:absolute tablet-p:top-[140px] tablet-p:right-8 tablet:absolute tablet:top-[60px] tablet:right-10 desktop-wide:top-[70px] desktop-wide:right-12 desktop-cap:top-[220px] flex justify-end">
          <Link
            href="/contact"
            data-cursor="contact"
            onClick={handleContactClick}
            className={cn(
              'font-medium tracking-tight hover:opacity-70 transition-all duration-500 leading-none',
              'text-lg tablet-p:text-2xl tablet:text-2xl desktop-wide:text-3xl'
            )}
          >
            Get in touch
          </Link>
        </div>

        {/* 브랜드 빅타이포 */}
        <div className={cn(
          'flex items-center justify-center pointer-events-none transition-all duration-500',
          'pt-24',                            // Mobile
          'tablet-p:pt-20',                   // 744px
          'tablet:mt-8 tablet:pt-4',             // 992px
          'desktop-wide:-mt-20 desktop-wide:pt-2',
          'desktop-cap:mt-16 desktop-cap:pt-0'
        )}>
          <h2
            className={cn(
              'font-bold leading-none tracking-tighter whitespace-nowrap overflow-visible transition-all duration-500',
              'text-[clamp(70px,20vw,220px)]',
              'tablet-p:text-[clamp(100px,20vw,290px)]',
              'tablet:text-[clamp(120px,20vw,320px)]',
              'desktop-wide:text-[clamp(110px,20vw,480px)]',
              'desktop-cap:text-[clamp(130px,22vw,480px)]'
            )}
          >
            <span className="font-syne">nemo</span>
            <NemoIcon
              style={{ transform: 'translateY(-3vw)' }}
              gapClassName="gap-[0.5vw]"
              className="px-[2vw] mb-[2vw]"
              triangleClassName="border-l-[clamp(12px,2.5vw,50px)] border-r-[clamp(12px,2.5vw,50px)] border-b-[clamp(18px,3.8vw,75px)] tablet-p:border-l-[clamp(8px,1.6vw,32px)] tablet-p:border-r-[clamp(8px,1.6vw,32px)] tablet-p:border-b-[clamp(12px,2.4vw,48px)]"
              triangleStyle={{ transform: 'translateY(-2vw)' }}
              circleClassName={cn(
                'w-[clamp(18px,3.8vw,75px)] h-[clamp(18px,3.8vw,75px)] tablet-p:w-[clamp(12px,2.4vw,48px)] tablet-p:h-[clamp(12px,2.4vw,48px)] border-[0.5vw] transition-all duration-500',
                '-translate-y-[1.2vw] tablet-p:translate-y-0'
              )}
            />
            <span className="font-syne">on</span>
          </h2>
        </div>
      </div>


      {/* 3. 하단: 소셜 및 저작권 */}
      <div
        className={cn(
          'flex flex-row justify-between items-center gap-4 border-t border-white/10 pt-4 transition-all duration-500',
          'mt-4',                                                                    // Mobile
          'tablet-p:absolute tablet-p:bottom-[24px] tablet-p:left-8 tablet-p:right-8', // Tablet-P
          'tablet:bottom-[12px] tablet:left-10 tablet:right-10',                   // Tablet
          'desktop-wide:bottom-[12px] desktop-wide:left-12 desktop-wide:right-12',
          'desktop-cap:bottom-[16px] desktop-cap:left-16 desktop-cap:right-16',
        )}
      >
        <div className="flex items-center gap-6 text-sm font-medium tracking-wide">
          <a
            href="https://define.nemoon.co"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#0891b2] transition-colors"
          >
            DE:FINE
          </a>
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
          © {currentYear} {renderBrandText('nemo:on')} All rights reserved.
        </p>
      </div>
    </footer>
  );
}
