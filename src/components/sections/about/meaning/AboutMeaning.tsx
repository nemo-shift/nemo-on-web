import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ABOUT_MEANING_DATA } from '@/data/about';

gsap.registerPlugin(ScrollTrigger);

export default function AboutMeaning() {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLSpanElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // [임시 격리] 히어로 섹션 복원 및 검증을 위해 ScrollTrigger 고정을 임시 격리합니다.
  /*
  useGSAP(() => {
    if (!containerRef.current || !titleRef.current || !contentRef.current) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
        pin: true,
        pinSpacing: false, // 다음 섹션 카드가 위로 덮어씌울 수 있도록 spacing 비활성화
      }
    });

    // 1. 거대 타이틀: 스크롤에 따라 선명한 검은색(1)에서 은은한 워터마크(0.04)로 옅어짐 (블러 없음)
    tl.to(titleRef.current, {
      opacity: 0.04,
      ease: 'none'
    }, 0);

    // 2. 본문 콘텐츠: 서서히 페이드인하며 올라왔다가, 다음 섹션이 오기 전에 페이드아웃
    tl.fromTo(contentRef.current,
      { opacity: 0, y: 60 },
      { opacity: 1, y: 0, ease: 'power2.out' },
      0.05
    )
    .to(contentRef.current,
      { opacity: 0, y: -40, ease: 'power2.in' },
      0.8
    );

  }, { scope: containerRef });
  */

  const renderParagraph = (text: string) => {
    // **text** 패턴을 찾아 <strong> 태그로 분할 렌더링하여 고품격 두께를 줍니다.
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        const cleanText = part.slice(2, -2);
        return (
          <strong key={index} className="font-extrabold text-[#0d1a1f]">
            {cleanText}
          </strong>
        );
      }
      return part;
    });
  };

  return (
    <section 
      ref={containerRef}
      id="about-meaning"
      className="relative w-full h-[180vh] bg-[#fcfbfa] z-20 overflow-hidden"
    >
      {/* 섹션 안내 가이드 : 섹션 별 구분 원할때 주석 해제 */}
      <div className="absolute top-0 left-0 w-full border-t border-red-500/50 z-[100] pointer-events-none">
        <span className="absolute top-2 left-4 text-[10px] uppercase font-mono text-red-500/50">Start: Meaning Section</span>
      </div>
      {/* 100vh 풀스크린 뷰포트 영역 (pin 대상) */}
      <div className="w-full h-screen flex flex-col items-center justify-center relative">
        
        {/* 거대 배경 타이틀 (선명한 검은색에서 시작) */}
        <span 
          ref={titleRef}
          className="absolute font-dm text-[clamp(40px,8vw,130px)] font-black uppercase tracking-widest text-[#0d1a1f] select-none text-center leading-none z-0"
        >
          {ABOUT_MEANING_DATA.bgTitle}
        </span>

        {/* 전면 본문 콘텐츠 레이어 */}
        <div 
          ref={contentRef}
          className="relative z-10 container mx-auto px-6 max-w-4xl text-center text-[#0d1a1f]"
        >
          <div className="flex flex-col gap-6 md:gap-8">
            {ABOUT_MEANING_DATA.paragraphs.map((p, idx) => (
              <p 
                key={idx} 
                className="text-lg md:text-xl font-suit font-light leading-relaxed whitespace-pre-line text-[#0d1a1f]/90"
              >
                {renderParagraph(p)}
              </p>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
