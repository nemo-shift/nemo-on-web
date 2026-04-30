import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { cn } from '@/lib/utils';
import { INTERACTION_Z_INDEX } from '@/constants/interaction';
import { MESSAGE_CONTENT, MESSAGE_COLORS } from '@/data/home/message';

export interface MessageSectionHandle {
  getStandardGroups: () => (HTMLDivElement | null)[];
  getInvertedGroups: () => (HTMLDivElement | null)[];
}

/**
 * [V11.61 Refactor] 메세지 그룹 내의 텍스트 라인 렌더링 헬퍼 (중복 제거)
 */
const MessageGroupLines = ({ group, charClassName }: { group: typeof MESSAGE_CONTENT[0]; charClassName: string }) => (
  <>
    {group.lines.map((line, lIdx) => (
      line.text === '' ? <div key={lIdx} className="h-4 tablet:h-8" /> : (
        <p 
          key={lIdx}
          aria-label={line.text}
          className={cn(
            'message-line mb-2 tablet-p:mb-4 font-bold flex flex-wrap justify-center',
            'text-xl tablet-p:text-[28px] tablet:text-3xl desktop-wide:text-4xl'
          )}
        >
          {line.text.split('').map((char, cIdx) => (
            <span 
              key={cIdx} 
              className={cn('message-char inline-block', charClassName)}
              style={{ whiteSpace: 'pre' }}
            >
              {char === ' ' ? '\u00A0' : char}
            </span>
          ))}
        </p>
      )
    ))}
  </>
);

/**
 * [V11.60 Evolution] 메세지 섹션 (공간 반전 & 시간 리빌 하이브리드)
 * 클립패스 고정 정렬을 위해 Static Container + Moving Content 구조 적용
 */
export const MessageSection = forwardRef<MessageSectionHandle>((_, ref) => {
  const containerRef = useRef<HTMLElement>(null);
  const standardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const invertedRefs = useRef<(HTMLDivElement | null)[]>([]);

  useImperativeHandle(ref, () => ({
    getStandardGroups: () => standardRefs.current,
    getInvertedGroups: () => invertedRefs.current
  }));

  return (
    <section 
      ref={containerRef} 
      id="section-message" 
      className="relative w-full h-[800vh]"
      style={{ backgroundColor: 'transparent' }}
    >

      {/* 섹션 안내 가이드 : 섹션 별 구분 원할때 주석 해제 */}
      {/*<div className="absolute top-0 left-0 w-full border-t border-red-500/50 z-[100] pointer-events-none">
        <span className="absolute top-2 left-4 text-[10px] uppercase font-mono text-red-500/50">Start: Message Section</span>
      </div>*/}
      
      <div 
        className="sticky top-0 left-0 w-full h-screen flex items-center justify-center overflow-hidden"
        style={{ zIndex: INTERACTION_Z_INDEX.Z_CONTENT }}
      >
        {MESSAGE_CONTENT.map((group, idx) => (
          <div 
            key={group.id}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            {/* 1. 배경용 레이어 (Standard) */}
            <div className="message-layer-standard absolute inset-0 flex items-center justify-center text-center select-none">
              <div 
                ref={el => { standardRefs.current[idx] = el; }}
                className="relative translate-y-[120vh]"
                style={{ color: MESSAGE_COLORS.BEFORE.STANDARD }}
              >
                <MessageGroupLines group={group} charClassName="standard-char" />
              </div>
            </div>

            {/* 2. 네모 영역용 레이어 (Inverted / Clip-path) */}
            <div 
              className="message-layer-inverted absolute inset-0 flex items-center justify-center text-center select-none" 
              style={{ 
                /* [V11.58 Evolution] Edge 기반 정밀 클립패스 고정 공식 */
                clipPath: 'inset(var(--nemo-t) var(--nemo-r) var(--nemo-b) var(--nemo-l))'
              }}
            >
              <div 
                ref={el => { invertedRefs.current[idx] = el; }}
                className="relative translate-y-[120vh]"
                style={{ color: MESSAGE_COLORS.BEFORE.INVERTED }}
              >
                <MessageGroupLines group={group} charClassName="inverted-char" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
});

MessageSection.displayName = 'MessageSection';
