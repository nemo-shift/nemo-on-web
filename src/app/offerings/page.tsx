import React from 'react';

/**
 * /offerings 페이지
 * 서비스 허브 (What we do)
 */
export default function OfferingsPage() {
  return (
    <main className="min-h-screen pt-24 px-6 md:px-12 bg-surface-cream text-text-dark">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-bold mb-8">Offerings</h1>
        <p className="text-xl md:text-2xl leading-relaxed opacity-80">
          불안을 끄고, 기준을 켭니다. <br />
          네모:ON이 제공하는 브랜드 작동 시스템입니다.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-16">
          <div className="p-8 border border-black/10 rounded-2xl hover:bg-black/5 transition-colors">
            <h2 className="text-2xl font-bold mb-4">Studio</h2>
            <p className="opacity-60 mb-6">브랜딩 + 웹개발</p>
            <a href="/offerings/studio" className="text-brand font-medium">더 알아보기 →</a>
          </div>
          <div className="p-8 border border-black/10 rounded-2xl hover:bg-black/5 transition-colors">
            <h2 className="text-2xl font-bold mb-4">Lab.</h2>
            <p className="opacity-60 mb-6">자체 실험 레이블</p>
            <a href="/offerings/lab" className="text-brand font-medium">더 알아보기 →</a>
          </div>
        </div>

        <div className="mt-20 py-10 border-t border-black/10">
          <p className="text-sm uppercase tracking-widest opacity-40">Coming Soon</p>
        </div>
      </div>
    </main>
  );
}
