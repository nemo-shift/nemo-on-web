'use client';

import React from 'react';
import { cn } from '@/lib';
import type { ButtonProps } from '@/types';

/**
 * Button 컴포넌트
 *
 * @param {string} label - 버튼 텍스트 [Required]
 * @param {function} onClick - 클릭 핸들러 [Optional]
 * @param {boolean} isActive - 활성화 여부 [Optional, 기본값: true]
 * @param {string} className - 추가 클래스 [Optional]
 *
 * Example usage:
 * <Button label="확인" onClick={handleClick} />
 */
export default function Button({
  label,
  onClick,
  isActive = true,
  className,
}: ButtonProps): React.ReactElement {
  const handleClick = () => {
    onClick?.();
  };

  return (
    <button
      onClick={handleClick}
      disabled={!isActive}
      type="button"
      className={cn(
        'px-4 py-2 rounded-md bg-brand-primary text-white transition-colors',
        !isActive && 'opacity-50 cursor-not-allowed',
        isActive && 'hover:bg-brand-primary/90',
        className
      )}
    >
      {label}
    </button>
  );
}
