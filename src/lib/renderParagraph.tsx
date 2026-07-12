import React from 'react';
import { renderBrandText } from './renderBrandText';

/**
 * About 페이지 공용 단락 렌더러
 *
 * 지원 마크업:
 *  - **text** → 틸색 강조 (font-normal, cyan-600)
 *  - __text__ → 밑줄 애니메이션 슬롯 (.promise-underline-bar)
 *  - __**text**__ → 볼드 + 밑줄
 *  - nemo:on → renderBrandText 자동 치환
 */
export function renderParagraph(text: string): React.ReactNode {
  const parts = text.split(/(\*\*.*?\*\*|__.*?__)/g);

  return parts.map((part, index) => {
    // **bold accent**
    if (part.startsWith('**') && part.endsWith('**')) {
      const cleanText = part.slice(2, -2);
      return (
        <strong key={index} className="font-normal text-cyan-600 text-[18px] tablet:text-[22px]">
          {cleanText}
        </strong>
      );
    }

    // __underline__ (내부 **bold** 지원)
    if (part.startsWith('__') && part.endsWith('__')) {
      let cleanText = part.slice(2, -2);
      const isBold = cleanText.startsWith('**') && cleanText.endsWith('**');
      if (isBold) cleanText = cleanText.slice(2, -2);
      return (
        <span key={index} className={`promise-underline relative inline ${isBold ? 'font-bold' : ''}`}>
          {renderBrandText(cleanText)}
          <span className="absolute left-0 bottom-0 h-[2px] bg-cyan-600 w-0 promise-underline-bar" />
        </span>
      );
    }

    return <React.Fragment key={index}>{renderBrandText(part)}</React.Fragment>;
  });
}
