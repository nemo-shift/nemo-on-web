import React from 'react';

/**
 * /diagnosis 페이지
 * 브랜드 진단
 */
export default function DiagnosisPage() {
  return (
    <main className="min-h-screen pt-24 px-6 md:px-12 bg-surface-cream text-text-dark">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-bold mb-8">Brand Diagnosis</h1>
        <p className="text-xl md:text-2xl leading-relaxed opacity-80">
          브랜드를 켜기 전, 현재의 상태를 진단합니다.
        </p>
        <div className="mt-20 py-10 border-t border-black/10">
          <p className="text-sm uppercase tracking-widest opacity-40">Coming Soon</p>
        </div>
      </div>
    </main>
  );
}
