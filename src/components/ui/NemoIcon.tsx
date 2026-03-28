import React from 'react';
import { cn } from '@/lib';

interface NemoIconProps {
  /** 전체 아이콘 뭉지의 추가 클래스 */
  className?: string;
  /** 기호의 기본 색상 (기본값: 브랜드 틸) */
  color?: string;
  /** 삼각형 개별 색상 (지정 시 color보다 우선) */
  triangleColor?: string;
  /** 동그라미 개별 색상 (지정 시 color보다 우선) */
  circleColor?: string;
  /** 도형들 사이의 간격 (Tailwind gap 클래스, 기본값: gap-0.5) */
  gapClassName?: string;
  /** 삼각형의 너비/높이 조절 (기본값은 홈 로고 기준) */
  triangleClassName?: string;
  /** 삼각형 개별 스타일 */
  triangleStyle?: React.CSSProperties;
  /** 동그라미의 크기 조절 (기본값은 홈 로고 기준) */
  circleClassName?: string;
  /** 동그라미 개별 스타일 */
  circleStyle?: React.CSSProperties;
  /** 인라인 스타일 (상세 위치 조절용) */
  style?: React.CSSProperties;
}

/**
 * NemoIcon 컴포넌트 [Step 1-1]
 * - 네모:ON의 시그니처인 삼각형(▲)과 동그라미(○)를 표준화한 컴포넌트
 */
const NemoIcon = React.forwardRef<HTMLSpanElement, NemoIconProps>(({
  className,
  color = '#0891b2',
  triangleColor,
  circleColor,
  gapClassName = 'gap-[0.1em]',
  triangleClassName = 'border-l-[0.35em] border-r-[0.35em] border-b-[0.55em]',
  triangleStyle,
  circleClassName = 'w-[0.55em] h-[0.55em] border-[0.12em]',
  circleStyle,
  style,
}, ref) => {
  return (
    <span 
      ref={ref}
      className={cn('inline-flex flex-col items-center justify-center', gapClassName, className)}
      style={style}
    >
      {/* 1. 삼각형 (채워짐) */}
      <div 
        className={cn('w-0 h-0 border-l-transparent border-r-transparent', triangleClassName)} 
        style={{ borderBottomColor: triangleColor || color, ...triangleStyle }}
      />
      {/* 2. 동그라미 (테두리) */}
      <div 
        className={cn('rounded-full', circleClassName)} 
        style={{ borderColor: circleColor || color, ...circleStyle }}
      />
    </span>
  );
});

NemoIcon.displayName = 'NemoIcon';

export default NemoIcon;
