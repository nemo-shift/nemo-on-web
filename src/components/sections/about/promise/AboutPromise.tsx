import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ABOUT_PROMISE_DATA } from '@/data/about';
import { ABOUT_STAGE_STYLES } from '../AboutStage.styles';

gsap.registerPlugin(ScrollTrigger);

export default function AboutPromise() {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLSpanElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!containerRef.current || !titleRef.current || !contentRef.current) return;

    // 본문 콘텐츠 초기 은폐 (초기 진입 시에는 오직 검은색 타이틀만 노출)
    gsap.set(contentRef.current, { opacity: 0, y: 60 });

    const tl = gsap.timeline({
      scrollTrigger: {
        id: 'about-promise-trigger',
        refreshPriority: 1, // 🔗 [체인 링크] 의미 섹션이 끝난 뒤 계산되도록 최하위 우선순위 배정
        trigger: containerRef.current,
        start: 'top top',
        // [Zero-Gap Sync] 섹션의 물리적 높이인 1.8배(180vh) 동안 완벽하게 핀 고정 유지 (독서 버퍼 보증)
        end: () => `+=${window.innerHeight * 1.8}`,
        scrub: true,
        pin: true,
        pinSpacing: true, // 마지막 섹션이므로 spacing을 활성화하여 푸터가 자연스럽게 리빌되도록 유도
      }
    });

    // 1. 거대 타이틀: 0%에서 40% 지점까지 오파시티 옅어짐 (지속시간 0.4)
    tl.to(titleRef.current, {
      opacity: 0.04,
      duration: 0.4,
      ease: 'none'
    }, 0);

    // 2. 본문 콘텐츠: 20% 지점부터 시작하여 50% 지점까지 등장 완료 (지속시간 0.3)
    // [기획 명세 준수]: 이전 섹션의 콘텐츠가 다 보여진 상태를 유지하므로, 페이드아웃 퇴장 없이 1.0 상태를 유지합니다.
    tl.to(contentRef.current, {
      opacity: 1,
      y: 0,
      duration: 0.3,
      ease: 'power2.out'
    }, 0.2); // 20% 스크롤 지점 등장

    // 3. [50% 스크롤 독서 버퍼] 50% 지점부터 100% 지점까지는 아무런 움직임 없이 완전히 정지하여 여유로운 독서 시간 확보 (지속시간 0.5)
    tl.to({}, { duration: 0.5 }, 0.5);

  }, { scope: containerRef });

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
      id="about-promise"
      className="relative w-full h-[180vh] bg-white z-30 overflow-hidden"
    >
      {/* 섹션 안내 가이드 : 섹션 별 구분 원할때 주석 해제 */}
      {/*<div className="absolute top-0 left-0 w-full border-t border-red-500/50 z-[100] pointer-events-none">
        <span className="absolute top-2 left-4 text-[10px] uppercase font-mono text-red-500/50">Start: Promise Section</span>
      </div>*/}
      {/* 100vh 풀스크린 뷰포트 영역 (pin 대상) */}
      <div className="w-full h-screen flex flex-col items-center justify-center relative">
        
        {/* 거대 배경 타이틀 (선명한 검은색에서 시작) */}
        <span 
          ref={titleRef}
          className={`absolute font-dm font-black uppercase text-[#0d1a1f] select-none text-center leading-none z-0 ${ABOUT_STAGE_STYLES.promise.bgTitle.size} ${ABOUT_STAGE_STYLES.promise.bgTitle.top} ${ABOUT_STAGE_STYLES.promise.bgTitle.tracking}`}
        >
          {ABOUT_PROMISE_DATA.bgTitle}
        </span>

        {/* 전면 본문 콘텐츠 레이어 */}
        <div 
          ref={contentRef}
          className={`relative z-10 container mx-auto px-6 text-center text-[#0d1a1f] ${ABOUT_STAGE_STYLES.promise.content.maxWidth} ${ABOUT_STAGE_STYLES.promise.content.yOffset}`}
        >
          <div className={`flex flex-col w-fit mx-auto text-left ${ABOUT_STAGE_STYLES.promise.content.gap}`}>
            {ABOUT_PROMISE_DATA.paragraphs.map((p, idx) => (
              <p 
                key={idx} 
                className={`font-suit font-light whitespace-pre-line text-[#0d1a1f]/90 ${ABOUT_STAGE_STYLES.promise.content.fontSize} ${ABOUT_STAGE_STYLES.promise.content.leading}`}
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
