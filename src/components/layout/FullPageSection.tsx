'use client';

import React from 'react';
import { cn } from '@/lib';

type FullPageSectionProps = {
  children: React.ReactNode;
  widthType?: 'vw' | 'percent'; // width 타입 [Optional, 기본값: 'vw']
  className?: string;          // 추가 클래스 [Optional]
  id?: string;                 // 섹션 id [Optional]
};

/**
 * FullPageSection 컴포넌트
 *
 * 100vh 전체화면 섹션 래퍼 컴포넌트.
 * FreeHorizontalScrollSection 내부에서 각 패널로 사용.
 *
 * @param {React.ReactNode} children - 섹션 내부 콘텐츠 [Required]
 * @param {'vw' | 'percent'} widthType - width 기준 [Optional, 기본값: 'vw']
 * @param {string} className - 추가 Tailwind 클래스 [Optional]
 * @param {string} id - 섹션 id [Optional]
 */
const FullPageSection = React.forwardRef<HTMLDivElement, FullPageSectionProps>(
  ({ children, widthType = 'vw', className, id }, ref) => {
    const widthClass = widthType === 'vw' ? 'w-screen' : 'w-full';

    return (
      <div
        ref={ref}
        id={id}
        style={{ height: '100dvh' }}
        className={cn(
          widthClass,
          'full-page-section',
          'flex flex-col',
          'justify-center',
          'items-center',
          'relative',
          'flex-shrink-0',
          className
        )}
      >
        {children}
      </div>
    );
  }
);

FullPageSection.displayName = 'FullPageSection';

export default FullPageSection;
