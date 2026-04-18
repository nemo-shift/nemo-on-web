'use client';

import React, { useRef, useImperativeHandle, forwardRef } from 'react';
import { NEMO_SIZE } from '@/constants/interaction';

/**
 * SharedNemoHandle: GlobalInteractionStage에서 Ref로 직접 제어할 핸들
 */
export interface SharedNemoHandle {
  /** 루트 오브젝트 엘리먼트 */
  nemoEl: HTMLDivElement | null;
  /** 버스 이미지 컨테이너 (이미지 마스크 단계에서 페이드인) */
  imageEl: HTMLDivElement | null;
  /** [Pain 전용] 상단 순서 텍스트 (하나. 둘. ...) */
  stepEl: HTMLDivElement | null;
  /** [Pain 전용] 가로 구분선 */
  lineEl: HTMLDivElement | null;
  /** 내부 텍스트 콘텐츠용 엘리먼트 (페인포인트, 공명 문장용) */
  contentEl: HTMLDivElement | null;
}

interface SharedNemoProps {
  progress?: number;
}

/**
 * [Visual] 네모 5구간 모핑 렌더링 컴포넌트
 */
const SharedNemo = forwardRef<SharedNemoHandle, SharedNemoProps>(
  function SharedNemo(_props, ref) {
    const nemoRef = useRef<HTMLDivElement>(null);
    const imageRef = useRef<HTMLDivElement>(null);
    const stepRef = useRef<HTMLDivElement>(null);
    const lineRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    useImperativeHandle(ref, () => ({
      get nemoEl() { return nemoRef.current; },
      get imageEl() { return imageRef.current; },
      get stepEl() { return stepRef.current; },
      get lineEl() { return lineRef.current; },
      get contentEl() { return contentRef.current; }
    }));

    return (
      <div
        ref={nemoRef}
        className="shared-nemo-object pointer-events-none fixed"
        style={{
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          width: `${NEMO_SIZE.INITIAL_W}px`,
          height: `${NEMO_SIZE.INITIAL_H}px`,
          borderRadius: `${NEMO_SIZE.INITIAL_BORDER_RADIUS}px`,
          backgroundColor: 'transparent',
          border: 'none',
          willChange: 'transform, width, height, background-color, border-radius, opacity',
          // [v26.47] 구분선이 박스 밖으로 나가야 하므로 overflow 제거
          overflow: 'visible', 
          opacity: 0,
          zIndex: 20, // 상수(Z_SHARED_NEMO)와 동기화
        }}
      >
        {/* 레이어 1: 이미지 콘텐츠 (구간 7) - 이미지만 클리핑 */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', borderRadius: 'inherit' }}>
          <div
            ref={imageRef}
            className="nemo-image-content absolute inset-0 w-full h-full opacity-0"
            style={{
              backgroundImage: 'url(\'/images/home/forwho/bus-journey.jpg\')',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              zIndex: 1,
              willChange: 'opacity',
            }}
            aria-hidden="true"
          />
        </div>

        {/* [Pain 전용] 레이어 2: 구분선 기반 분할 레이아웃 컨테이너 */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center" style={{ zIndex: 2 }}>
          {/* 상단: Step (하나. 둘. ...) */}
          <div 
            ref={stepRef} 
            className="opacity-0 font-suit font-bold tracking-[0.2em] mb-4 text-[#f0ebe3]/80"
            style={{ fontSize: '0.8rem', willChange: 'opacity, transform' }}
          >
            STEP 01
          </div>

          {/* 중앙: Divider Line (박스 오른쪽으로 돌출) */}
          <div 
            ref={lineRef}
            className="absolute left-0 w-[150%] h-[1px] bg-[#f0ebe3]/30 scale-x-0 origin-left"
            style={{ 
              top: '40%', // 대략적인 위-아래 분할 지점
              willChange: 'transform' 
            }}
          />

          {/* 하단: Content (Pain Points) */}
          <div 
            ref={contentRef}
            className="opacity-0 font-suit font-medium text-[#f0ebe3] mt-8"
            style={{ 
              fontSize: '1.05rem',
              lineHeight: '1.6',
              wordBreak: 'keep-all',
              willChange: 'opacity, transform' 
            }}
          >
            {/* 텍스트는 GlobalInteractionStage에서 직접 주입 */}
          </div>
        </div>
      </div>
    );
  },
);

export default SharedNemo;
