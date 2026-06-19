'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay, EffectCoverflow } from 'swiper/modules';
import { FOR_WHO_LIST, ForWhoItem } from '@/data/home/forwho';
import { cn } from '@/lib/utils';
import { useDevice } from '@/context';
import ForWhoScrollHint from './ForWhoScrollHint';

// Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/effect-coverflow';

/**
 * [V11.80] ForWhoCarousel
 */
export interface ForWhoCarouselHandle {
  resetCards: () => void;
}

const ForWhoCarousel = React.forwardRef<ForWhoCarouselHandle, {}>((_, ref) => {
  const { isMobile, interactionMode, isMobileView, isTabletPortrait } = useDevice();
  const [expandedId, setExpandedId] = useState<number | null>(null);
  
  // 외부에서 상태를 리셋할 수 있도록 메서드 노출
  React.useImperativeHandle(ref, () => ({
    resetCards: () => {
      setExpandedId(null);
    }
  }));

  // [Experimental] 마그네틱 커서 상태
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current || interactionMode === 'touch') return;
    const rect = containerRef.current.getBoundingClientRect();
    setCursorPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // [V50] 수동 무한 루프 구현을 위한 데이터 확장 (앞뒤로 하나씩 추가)
  const swiperRef = useRef<any>(null);
  const isTouch = interactionMode === 'touch';
  const showArrow = true; // [V65] 터치 환경에서도 화살표 노출 (스타일로 분기)

  // 터치 모드: 카드별 텍스트 위치 (피사체 반대편)
  const TOUCH_POSITIONS = [
    'top-left',     // id:1 - 피사체 오른쪽(67%) → 텍스트 좌상단
    'top-right',    // id:2 - 피사체 왼쪽(41%)  → 텍스트 우상단
    'bottom-center',// id:3 - 피사체 하단(70%)  → 텍스트 하단 중앙
    'bottom-left',  // id:4 - 피사체 중앙        → 텍스트 좌하단
    'top-left',     // id:5 - 피사체 왼쪽        → 텍스트 좌상단
  ] as const;

  return (
    <div 
      ref={containerRef}
      className={cn(
        "relative w-full h-full flex pt-28 pb-10",
        // PC: 왼쪽 타이틀 공간 확보를 위한 스플릿 구도
        "flex-col tablet:flex-row items-center justify-center tablet:justify-end"
      )}
      onMouseMove={handleMouseMove}
    >
      {/* 1. 하이엔드 마그네틱 커서 (PC Only) */}
      {!isTouch && !isMobileView && isHovering && (
        <div 
          className="pointer-events-none absolute z-50 mix-blend-difference hidden tablet:flex items-center justify-center w-24 h-24 rounded-full border border-white/30 bg-white/10 backdrop-blur-sm transition-transform duration-200 ease-out"
          style={{ 
            left: cursorPos.x, 
            top: cursorPos.y, 
            transform: 'translate(-50%, -50%) scale(1)' 
          }}
        >
          <span className="text-white text-[10px] font-suit font-bold tracking-[0.2em] uppercase">
            {expandedId ? 'Close' : 'Click'}
          </span>
        </div>
      )}

      {/* 2. 커스텀 내비게이션 화살표 (PC/Touch 분기 레이아웃) */}
      {showArrow && (
        <div id="forwho-arrows" className="opacity-0 pointer-events-none transition-none">
          <div 
            className={cn(
              "absolute z-50 cursor-pointer p-6 group swiper-button-prev-custom transition-all duration-500",
              // 수직 위치: 터치는 카드 중심부(하단 기준), PC는 중앙
              isTouch ? "top-auto bottom-[40vh]" : "top-1/2 -translate-y-1/2",
              // 수평 위치: 3단계 분기
              isMobile ? "left-1" : isTabletPortrait ? "left-[6%]" : "left-[35%]"
            )}
            onClick={(e) => {
              e.stopPropagation();
              swiperRef.current?.slidePrev();
            }}
          >
            <div className={cn(
              "transition-all duration-300 drop-shadow-md",
              isTouch ? "text-white/70" : "text-white/60 group-hover:text-white group-hover:-translate-x-1"
            )}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </div>
          </div>
          <div 
            className={cn(
              "absolute z-50 cursor-pointer p-6 group swiper-button-next-custom transition-all duration-500",
              // 수직 위치: 터치는 카드 중심부(하단 기준), PC는 중앙
              isTouch ? "top-auto bottom-[40vh]" : "top-1/2 -translate-y-1/2",
              // 수평 위치: 3단계 분기
              isMobile ? "right-1" : isTabletPortrait ? "right-[6%]" : "right-[5%]"
            )}
            onClick={(e) => {
              e.stopPropagation();
              swiperRef.current?.slideNext();
            }}
          >
            <div className={cn(
              "transition-all duration-300 drop-shadow-md",
              isTouch ? "text-white/70" : "text-white/60 group-hover:text-white group-hover:translate-x-1"
            )}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </div>
          </div>
        </div>
      )}

      {/* 3. 캐러셀 영역 (PC: 우측 70% 차지) */}
      <div className={cn(
        "w-full tablet:w-[70%] h-full flex transition-all duration-500",
        (isMobile || isTabletPortrait) ? "items-end pb-20" : "items-center"
      )}>
        <Swiper
          onSwiper={(swiper) => { swiperRef.current = swiper; }}
          modules={[Navigation, Autoplay, EffectCoverflow]}
          loop={true} 
          className="forwho-swiper w-full"
          spaceBetween={isMobileView || isTabletPortrait ? 16 : 0}
          slidesPerView={1.0} // PC에서도 이제 한 장씩만
          centeredSlides={true}
          grabCursor={true}
          watchSlidesProgress={true}
          navigation={false}
          onSlideChange={(swiper) => {
            setExpandedId(null);
            if (typeof window !== 'undefined') {
              (window as any).__forWhoCurrentIndex = swiper.realIndex;
            }
          }}
        >
          {FOR_WHO_LIST.map((item, index) => {
            const touchPos = TOUCH_POSITIONS[index];
            const isBottom = touchPos.startsWith('bottom');
            const isRight = touchPos.endsWith('right');
            const isCenterAlign = touchPos.endsWith('center');
            return (
            <SwiperSlide key={`${item.id}-${index}`} className="pb-12">
              <div
                onClick={isTouch ? undefined : () => toggleExpand(item.id)}
                onMouseEnter={isTouch ? undefined : () => setIsHovering(true)}
                onMouseLeave={isTouch ? undefined : () => setIsHovering(false)}
                className={cn(
                  "group relative overflow-hidden bg-[#1a1a1a] transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] mx-auto",
                  isTouch ? "" : "cursor-pointer",
                  "h-[48vh] mobile:h-[48vh] tablet-p:h-[54vh] tablet:h-[60vh]",
                  isMobile ? "w-[86%]" : isTabletPortrait ? "w-[85%]" : "tablet:w-[85%]",
                  !isTouch && (expandedId === item.id ? "scale-[1.01]" : "scale-100")
                )}
              >
                {/* 카드 이미지 레이어 */}
                <div className="absolute inset-0 w-full h-full overflow-hidden">
                  <Image
                    id={item.id === 1 ? "nemo-target-forwho-0" : undefined}
                    src={item.image.src}
                    alt={item.image.alt}
                    fill
                    sizes="(max-width: 768px) 90vw, (max-width: 1200px) 70vw, 65vw"
                    className={cn(
                      "object-cover transition-all duration-1000 ease-out",
                      isTouch
                        ? "scale-100 blur-0 opacity-80"
                        : (expandedId === item.id ? "scale-110 blur-xl opacity-40" : "scale-100 blur-0 opacity-80 group-hover:scale-105")
                    )}
                    style={{
                      objectPosition: (isMobile && item.id === 1)
                        ? '60% center'
                        : item.image.objectPosition
                    }}
                  />
                </div>

                {/* Touch: 위치별 항상 노출 컨텐츠 */}
                {isTouch && (
                  <>
                    <div
                      className="absolute inset-0 z-10 pointer-events-none"
                      style={{
                        background: isBottom
                          ? 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, transparent 65%)'
                          : 'linear-gradient(to bottom, rgba(0,0,0,0.88) 0%, transparent 65%)',
                      }}
                    />
                    <div
                      className={cn(
                        "absolute z-20 p-5",
                        isBottom ? "bottom-0" : "top-0",
                        isCenterAlign
                          ? "left-1/2 -translate-x-1/2 text-center w-[85%]"
                          : isRight ? "right-0 text-right" : "left-0 text-left"
                      )}
                    >
                      <p className="text-white/50 text-[9px] tracking-[.25em] uppercase font-bold mb-1.5">{item.flow}</p>
                      <h5 className="text-white text-lg font-suit font-bold leading-tight mb-2">{item.target}</h5>
                      <p className="text-white/80 text-[11px] font-suit leading-relaxed break-keep mb-2">{item.description}</p>
                      <div className={cn("w-7 h-[0.5px] bg-white/30 mb-2", isRight && "ml-auto", isCenterAlign && "mx-auto")} />
                      <p className="text-white/70 text-[9px] tracking-wider mb-1">네모:ON의 역할</p>
                      <p className="text-white/95 font-suit font-medium text-[11px]">{item.philosophy}</p>
                    </div>
                  </>
                )}

                {/* Non-touch: 기존 toggle 방식 */}
                {!isTouch && (
                  <>
                    <div className={cn(
                      "absolute top-10 left-10 z-10 transition-all duration-500",
                      expandedId === item.id ? "opacity-0 -translate-y-4" : "opacity-100 translate-y-0"
                    )}>
                      <p className="text-white/50 text-[10px] tablet-p:text-[11px] tablet:text-xs font-suit mb-2 tracking-[0.2em] uppercase font-bold">{item.flow}</p>
                      <h4 className="text-white text-2xl tablet-p:text-3xl tablet:text-4xl font-suit font-bold tracking-tight leading-tight">
                        {item.target}
                      </h4>
                    </div>

                    <div className={cn(
                      "absolute inset-0 z-20 flex flex-col items-center justify-center p-8 text-center transition-all duration-700",
                      "bg-black/20 backdrop-blur-[2px]",
                      expandedId === item.id ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12 pointer-events-none"
                    )}>
                      <div className="max-w-[80%] space-y-6">
                        <div className="space-y-1">
                          <p className="text-white/60 text-[10px] tracking-[.3em] uppercase">{item.flow}</p>
                          <h5 className="text-white text-2xl tablet-p:text-[1.75rem] tablet:text-3xl font-suit font-bold">{item.target}</h5>
                        </div>
                        <p className="text-white/90 text-sm tablet-p:text-[0.9375rem] tablet:text-base font-suit leading-relaxed break-keep">
                          {item.description}
                        </p>
                        <div className="w-12 h-[0.5px] bg-white/30 mx-auto" />
                        <div className="space-y-2">
                          <p className="text-[10px] text-white/40 tracking-wider">네모:ON의 역할</p>
                          <p className="text-white font-suit font-medium text-lg tablet-p:text-[1.125rem] tablet:text-xl">
                            {item.philosophy}
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </SwiperSlide>
            );
          })}
        </Swiper>
      </div>

      {/* 가로 스크롤 힌트 UI (Step 4 신규) */}
      <ForWhoScrollHint visible={expandedId === null} />

      <style jsx global>{`
        .forwho-swiper .swiper-slide {
          backface-visibility: visible !important;
          -webkit-backface-visibility: visible !important;
          transform-style: preserve-3d !important;
          visibility: visible !important;
        }

        .forwho-swiper .swiper-button-next,
        .forwho-swiper .swiper-button-prev {
          color: #18181b; /* zinc-900 계열의 어두운 색상 */
          opacity: 0.4;
          transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
          width: 40px;
          height: 40px;
        }

        .forwho-swiper .swiper-button-prev {
          left: 10%;
        }

        .forwho-swiper .swiper-button-next {
          right: 10%;
        }

        .forwho-swiper .swiper-button-next:after,
        .forwho-swiper .swiper-button-prev:after {
          font-size: 18px; /* 크기 축소 */
          font-weight: 900;
        }

        .forwho-swiper .swiper-button-next:hover,
        .forwho-swiper .swiper-button-prev:hover {
          opacity: 0.9;
          transform: scale(1.15);
          color: #000;
        }
      `}</style>
    </div>
  );
});

export default ForWhoCarousel;

