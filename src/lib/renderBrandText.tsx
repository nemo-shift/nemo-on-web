import React from 'react';

/**
 * 텍스트 문자열에서 `nemo:on`을 감지하여
 * `nemo`와 `on`은 1.2em으로 키우고 콜론(`:`)은 기본 크기 유지.
 * whitespace-pre-line 환경에서 \n도 정상 동작.
 */
export function renderBrandText(text: string, scale = 1.3): React.ReactNode {
  const parts = text.split('nemo:on');
  if (parts.length === 1) return text;

  return (
    <>
      {parts.map((part, i) => (
        <React.Fragment key={i}>
          {part}
          {i < parts.length - 1 && (
            <>
              <span style={{ fontSize: `${scale}em`, lineHeight: 1, letterSpacing: '-0.04em' }}>nemo</span>
              {':'}
              <span style={{ fontSize: `${scale}em`, lineHeight: 1, letterSpacing: '-0.04em' }}>on</span>
            </>
          )}
        </React.Fragment>
      ))}
    </>
  );
}
