import React from 'react';

/**
 * /about 페이지
 * 네모:ON + 단테 + 브랜드 철학
 */
export default function AboutPage() {
  return (
    <main className="min-h-screen pt-24 px-6 md:px-12 bg-surface-cream text-text-dark">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-bold mb-8">About 네모:ON</h1>
        <p className="text-xl md:text-2xl leading-relaxed opacity-80">
          불안을 끄고, 기준을 켭니다. <br />
          네모:ON은 의미를 켜서, 구조가 작동하게 만드는 브랜드입니다.
        </p>
        <div className="mt-20 py-10 border-t border-black/10">
          <p className="text-sm uppercase tracking-widest opacity-40">Coming Soon</p>
        </div>
      </div>
    </main>
  );
}
