'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay, EffectCoverflow } from 'swiper/modules';
import { FOR_WHO_LIST, ForWhoItem } from '@/data/home/forwho';
import { cn } from '@/lib/utils';
import { useDevice } from '@/context';

// Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/effect-coverflow';

/**
 * [V11.80] ForWhoCarousel
 * 기술 스택: Swiper.js + GSAP 연동 준비
 * 핵심 기능: 기기별 Peeking/Full 레이아웃, 클릭 시 이미지 블러 및 정보 리빌
 */
export default function ForWhoCarousel() {
  const { isMobile, interactionMode, isMobileView, isTabletPortrait } = useDevice();
  const [expandedId, setExpandedId] = useState<number | null>(null);
  
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

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full flex items-center justify-center py-10"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* 1. 하이엔드 마그네틱 커서 (PC Only / Experimental) */}
      {!isMobileView && interactionMode === 'mouse' && isHovering && (
        <div 
          className="pointer-events-none absolute z-50 mix-blend-difference hidden tablet:flex items-center justify-center w-24 h-24 rounded-full border border-white/30 bg-white/10 backdrop-blur-sm transition-transform duration-200 ease-out"
          style={{ 
            left: cursorPos.x, 
            top: cursorPos.y, 
            transform: 'translate(-50%, -50%) scale(1)' 
          }}
        >
          <span className="text-white text-[10px] font-suit font-bold tracking-[0.2em] uppercase">
            {expandedId ? 'Close' : 'View'}
          </span>
        </div>
      )}

      <Swiper
        modules={[Navigation, Autoplay, EffectCoverflow]}
        spaceBetween={isMobileView ? 20 : 40}
        slidesPerView={isMobileView ? 1.1 : (isTabletPortrait ? 1.5 : 2.2)}
        centeredSlides={true}
        grabCursor={true}
        navigation={!isMobileView && interactionMode === 'mouse'}
        className="forwho-swiper w-full !px-[5%]"
        onSlideChange={() => setExpandedId(null)}
      >
        {FOR_WHO_LIST.map((item) => (
          <SwiperSlide key={item.id} className="pb-12">
            <div 
              onClick={() => toggleExpand(item.id)}
              className={cn(
                "group relative overflow-hidden bg-[#1a1a1a] transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] cursor-pointer shadow-2xl",
                "h-[50vh] tablet:h-[60vh] tablet-p:h-[55vh]",
                expandedId === item.id ? "scale-[1.02]" : "hover:scale-[0.98]"
              )}
            >
              {/* 카드 이미지 레이어 */}
              <div className="absolute inset-0 w-full h-full overflow-hidden">
                <Image
                  src={item.image.src}
                  alt={item.image.alt}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className={cn(
                    "object-cover transition-all duration-1000 ease-out",
                    expandedId === item.id ? "scale-110 blur-xl opacity-40" : "scale-100 blur-0 opacity-80 group-hover:scale-105"
                  )}
                  style={{ objectPosition: item.image.objectPosition }}
                />
                {/* 시네마틱 오버레이 */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
              </div>

              {/* 기본 노출 정보 (Target Name) */}
              <div className={cn(
                "absolute bottom-8 left-8 right-8 z-10 transition-all duration-500",
                expandedId === item.id ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
              )}>
                <p className="text-white/50 text-xs font-suit mb-2 tracking-widest uppercase">{item.flow}</p>
                <h4 className="text-white text-3xl tablet:text-4xl font-suit font-bold tracking-tight">
                  {item.target}
                </h4>
              </div>

              {/* [V11.85 Expansion] 상세 정보 레이어 (Click/Expand) */}
              <div className={cn(
                "absolute inset-0 z-20 flex flex-col items-center justify-center p-8 text-center transition-all duration-700",
                "bg-black/20 backdrop-blur-[2px]", // 글래스모피즘 베이스
                expandedId === item.id ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12 pointer-events-none"
              )}>
                <div className="max-w-[80%] space-y-6">
                  {/* 타겟 & 흐름 재강조 */}
                  <div className="space-y-1">
                    <p className="text-white/60 text-[10px] tracking-[.3em] uppercase">{item.flow}</p>
                    <h5 className="text-white text-2xl tablet:text-3xl font-suit font-bold">{item.target}</h5>
                  </div>

                  {/* 설명 */}
                  <p className="text-white/90 text-sm tablet:text-base font-suit leading-relaxed break-keep">
                    {item.description}
                  </p>

                  {/* 0.5px 초미세 구분선 */}
                  <div className="w-12 h-[0.5px] bg-white/30 mx-auto" />

                  {/* 네모:ON의 역할/철학 */}
                  <div className="space-y-2">
                    <p className="text-[10px] text-white/40 tracking-wider">네모:ON의 역할</p>
                    <p className="text-white font-suit font-medium text-lg tablet:text-xl">
                      {item.philosophy}
                    </p>
                  </div>
                </div>

                {/* 닫기 힌트 (모바일 전용) */}
                {isMobileView && (
                  <button className="absolute bottom-6 text-white/40 text-[10px] font-mono tracking-widest uppercase">
                    Tap to close
                  </button>
                )}
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* 가로 스크롤 힌트 UI */}
      <div className={cn(
        "absolute bottom-4 left-1/2 -translate-x-1/2 z-30 transition-opacity duration-500",
        expandedId ? "opacity-0" : "opacity-100"
      )}>
        <div className="flex flex-col items-center gap-2">
           <div className="w-10 h-[1px] bg-white/20 relative overflow-hidden">
              <div className="absolute inset-0 bg-white/60 animate-scroll-hint-horizontal" />
           </div>
           <span className="text-[9px] text-white/30 font-suit uppercase tracking-[0.4em]">Swipe</span>
        </div>
      </div>

      <style jsx global>{`
        .forwho-swiper .swiper-button-next,
        .forwho-swiper .swiper-button-prev {
          color: white;
          opacity: 0.3;
          transition: opacity 0.3s;
        }
        .forwho-swiper .swiper-button-next:hover,
        .forwho-swiper .swiper-button-prev:hover {
          opacity: 1;
        }
        @keyframes scroll-hint-horizontal {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(0); }
          100% { transform: translateX(100%); }
        }
        .animate-scroll-hint-horizontal {
          animation: scroll-hint-horizontal 2s infinite cubic-bezier(0.65, 0, 0.35, 1);
        }
      `}</style>
    </div>
  );
}
