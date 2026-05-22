'use client';

import React from 'react';

interface DiagnosisIntroProps {
  onStart: () => void;
}

export default function DiagnosisIntro({ onStart }: DiagnosisIntroProps) {
  return (
    <div className="w-full max-w-2xl mx-auto py-16 px-4 text-left flex flex-col justify-center min-h-[400px]">
      {/* 정밀 공학 느낌의 모노톤 일련식 라벨 */}
      <div className="font-mono text-[10px] tracking-[0.25em] text-text-dark/30 uppercase mb-8">
        Diagnosis Index 00
      </div>

      <h2 className="text-3xl sm:text-5xl font-black text-text-dark tracking-tight leading-[1.15] mb-6">
        당신의 브랜드는 지금<br />
        <span className="text-brand">설명 가능한가요?</span>
      </h2>
      
      <p className="text-base sm:text-lg text-text-dark/60 leading-relaxed font-light mb-12 max-w-lg">
        브랜드를 켜기 전, 간단한 진단으로 현재 브랜드 상태를 확인해보세요.
      </p>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
        <button
          onClick={onStart}
          className="px-8 py-3.5 border border-text-dark text-text-dark font-semibold text-sm tracking-widest uppercase transition-all duration-300 hover:bg-text-dark hover:text-white cursor-pointer rounded-none active:scale-[0.98]"
        >
          진단 시작하기 →
        </button>
        <span className="font-mono text-[10px] tracking-widest text-text-dark/40 uppercase">
          Required Time: 1:30
        </span>
      </div>
    </div>
  );
}
