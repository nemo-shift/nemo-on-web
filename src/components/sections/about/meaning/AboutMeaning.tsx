import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ABOUT_MEANING_DATA } from '@/data/about';
import { ABOUT_STAGE_STYLES } from '../AboutStage.styles';
import { ABOUT_SCROLL_MULTIPLIERS } from '@/constants/sub-interaction';
import { renderBrandText } from '@/lib/renderBrandText';

gsap.registerPlugin(ScrollTrigger);

export default function AboutMeaning() {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLSpanElement>(null);
  const phase1Ref = useRef<HTMLDivElement>(null);
  const phase2Ref = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null); // 🆕 메타 라벨용 ref 추가

  // [Zero-Gap Sync] 스크롤 여유 및 관성 방어를 위한 가중치 배율 (상수 파일 sub-interaction.ts 연동)
  const scrollMultiplier = ABOUT_SCROLL_MULTIPLIERS.MEANING;

  useGSAP(() => {
    if (!containerRef.current || !titleRef.current || !phase1Ref.current || !phase2Ref.current || !labelRef.current) return;

    // 본문 콘텐츠 및 메타 라벨 초기 은폐 (오직 거대 타이틀만 선명하게 보이도록 방어)
    gsap.set(phase1Ref.current, { opacity: 0, y: 30, x: 0 }); // 1번은 수직 상승 진입
    gsap.set(phase2Ref.current, { opacity: 0, y: 0, x: -40 });  // 2번은 왼쪽(x: -40)에서 대기 (일방향 가로 진입용)
    gsap.set(labelRef.current, { opacity: 0, y: 20 }); // 라벨 초기 은폐

    const tl = gsap.timeline({
      scrollTrigger: {
        id: 'about-meaning-trigger',
        refreshPriority: 3, // 🔗 [체인 링크] 철학이 먼저 계산된 뒤 계산되도록 우선순위 배정
        trigger: containerRef.current,
        start: 'top top',
        // [Zero-Gap Sync] 섹션의 물리적 높이 동안 완벽하게 핀 고정 유지 (Promise가 100% 덮을 때까지)
        end: () => `+=${window.innerHeight * scrollMultiplier}`,
        scrub: true,
        pin: true,
        pinSpacing: false, // 다음 섹션 카드가 위로 덮어씌울 수 있도록 spacing 비활성화
      }
    });

    // 1. 거대 타이틀: 0%에서 20% 지점까지 오파시티 옅어지며 단독 퇴장 (지속시간 0.2)
    tl.to(titleRef.current, {
      opacity: 0.04,
      duration: 0.2,
      ease: 'none'
    }, 0);

    // 2. Phase 1 콘텐츠 및 메타 라벨 동시 등장: 20% 지점까지 빠르게 등장 완료 (지속시간 0.1)
    tl.to(phase1Ref.current, {
      opacity: 1,
      y: 0,
      duration: 0.1,
      ease: 'power2.out'
    }, 0.1);

    tl.to(labelRef.current, {
      opacity: 1,
      y: 0,
      duration: 0.1,
      ease: 'power2.out'
    }, 0.1); // 라벨도 10% 지점 싱크!

    // 3. [Phase 1 정독 구간] 20%부터 42% 지점까지 완전 고정 유지 (지속시간 0.22)
    tl.to({}, { duration: 0.22 }, 0.2);

    // 4. [가로 순차 스왑 모션] 42%~49% 1번 퇴장 ➔ 49%~53% 비움 ➔ 53%~60% 2번 안착 (x축 시차 겹침 방어)
    tl.to(phase1Ref.current, {
      opacity: 0,
      x: -40,
      duration: 0.07,
      ease: 'power2.in'
    }, 0.42);

    tl.to(phase2Ref.current, {
      opacity: 1,
      x: 0,
      duration: 0.07,
      ease: 'power2.out'
    }, 0.53); // 1번이 사라진 후 빈 공간 대기하다가 58% 지점부터 2번이 진입 시작

    // 5. [Phase 2 정독 구간 극대화] 60%부터 98% 지점까지 스크롤 내리는 내내 완전 고정 (지속시간 0.38)
    tl.to({}, { duration: 0.38 }, 0.6); // 30% 휠 거리에 달하는 넓은 정독 존 확보!

    // 6. [오버레이 지연 마감 대기] 98%부터 100% 지점까지 비로소 다음 카드를 위해 대기 (지속시간 0.02)
    tl.to({}, { duration: 0.02 }, 0.98);

    // [Perfect Stacking Sync] 모든 섹션이 성공적으로 조율된 후 좌표계를 1회 정밀 측정합니다.
    requestAnimationFrame(() => {
      ScrollTrigger.refresh();
    });

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
      return <React.Fragment key={index}>{renderBrandText(part)}</React.Fragment>;
    });
  };

  return (
    <section
      ref={containerRef}
      id="about-meaning"
      className="relative w-full bg-[#f7f1e9] z-20 overflow-hidden"
      style={{ height: `${scrollMultiplier * 100}vh` }}
    >
      {/* 100vh 풀스크린 뷰포트 영역 (pin 대상) */}
      <div className="w-full h-screen flex flex-col items-center justify-center relative">
        
        {/* 거대 배경 타이틀 (선명한 검은색에서 시작) */}
        <span 
          ref={titleRef}
          className={`absolute font-dm font-black uppercase text-[#0d1a1f] select-none text-center leading-none z-0 ${ABOUT_STAGE_STYLES.meaning.bgTitle.size} ${ABOUT_STAGE_STYLES.meaning.bgTitle.top} ${ABOUT_STAGE_STYLES.meaning.bgTitle.tracking}`}
        >
          {ABOUT_MEANING_DATA.bgTitle}
        </span>

        {/* 전면 본문 콘텐츠 레이어 */}
        <div 
          className={`relative z-10 container mx-auto px-6 text-center text-[#0d1a1f] ${ABOUT_STAGE_STYLES.meaning.content.maxWidth} ${ABOUT_STAGE_STYLES.meaning.content.yOffset}`}
        >
          {/* 메타 라벨 (상시 고정 및 정밀 세로 정렬선 확보) */}
          <div ref={labelRef} className={`relative mx-auto flex flex-col text-left mb-6 tablet:mb-8 ${ABOUT_STAGE_STYLES.meaning.content.maxWidth} ${ABOUT_STAGE_STYLES.meaning.content.labelPaddingLeft}`}>
            <span className="text-xs tablet:text-sm font-semibold tracking-[0.2em] uppercase text-cyan-600">
              02 / REC+ANGLE
            </span>
          </div>

          {/* absolute 겹침을 위한 고정 높이 래퍼 컨테이너 (정중앙 밸런스 래퍼) */}
          <div className="relative w-full h-[320px] sm:h-[240px] tablet:h-[260px] flex justify-center">
            {/* Phase 1 Box */}
            <div 
              ref={phase1Ref}
              className={`absolute top-0 left-1/2 -translate-x-1/2 flex flex-col text-left ${ABOUT_STAGE_STYLES.meaning.content.maxWidth} ${ABOUT_STAGE_STYLES.meaning.content.paddingLeft} ${ABOUT_STAGE_STYLES.meaning.content.gap}`}
            >
              {ABOUT_MEANING_DATA.phase1.map((p, idx) => (
                <p 
                   key={idx} 
                   className={`font-suit font-light whitespace-pre-line text-[#0d1a1f]/90 ${ABOUT_STAGE_STYLES.meaning.content.fontSize} ${ABOUT_STAGE_STYLES.meaning.content.leading}`}
                >
                  {renderParagraph(p)}
                </p>
              ))}
            </div>

            {/* Phase 2 Box */}
            <div 
              ref={phase2Ref}
              className={`absolute top-0 left-1/2 -translate-x-1/2 flex flex-col text-left ${ABOUT_STAGE_STYLES.meaning.content.maxWidth} ${ABOUT_STAGE_STYLES.meaning.content.paddingLeft} ${ABOUT_STAGE_STYLES.meaning.content.gap}`}
            >
              {ABOUT_MEANING_DATA.phase2.map((p, idx) => (
                <p 
                   key={idx} 
                   className={`font-suit font-light whitespace-pre-line text-[#0d1a1f]/90 ${ABOUT_STAGE_STYLES.meaning.content.fontSize} ${ABOUT_STAGE_STYLES.meaning.content.leading}`}
                >
                  {renderParagraph(p)}
                </p>
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
