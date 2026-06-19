'use client';

import React from 'react';
import { DIAGNOSIS_RESULTS, DiagnosisResultType } from '@/data/diagnosis-page';
import Link from 'next/link';

interface DiagnosisResultProps {
  answers: Record<string, string | string[]>;
  onRestart: () => void;
}

export default function DiagnosisResult({ answers, onRestart }: DiagnosisResultProps) {
  const q4Answer = (answers['Q4'] as string) || '';

  let resultKey: 'newborn' | 'growing' | 'mature' = 'newborn';
  if (
    q4Answer.includes('기본적인 아이덴티티') || 
    q4Answer.includes('개선 필요')
  ) {
    resultKey = 'growing';
  } else if (q4Answer.includes('차별화 필요')) {
    resultKey = 'mature';
  } else {
    resultKey = 'newborn';
  }

  const resultData: DiagnosisResultType = DIAGNOSIS_RESULTS[resultKey];

  return (
    <div className="w-full max-w-2xl mx-auto py-12 px-4 flex flex-col gap-12 animate-fade-in text-left">
      
      {/* 분석 결과 메인 타이포 */}
      <div>
        <div className="font-mono text-[10px] tracking-[0.25em] text-text-dark/40 uppercase mb-3">
          Diagnosis Index Result
        </div>
        
        <h2 className="text-4xl sm:text-6xl font-black text-text-dark tracking-tighter uppercase leading-none">
          {resultData.title}
        </h2>
        
        <p className="text-base sm:text-lg text-text-dark/60 font-light mt-4 max-w-md">
          {resultData.description}
        </p>
      </div>

      {/* 가로 실선 분할 개선 방향 */}
      <div>
        <h3 className="font-mono text-[10px] tracking-[0.25em] text-text-dark/40 uppercase border-b border-text-dark/10 pb-3 mb-4">
          Core Directions
        </h3>
        
        <div className="flex flex-col">
          {resultData.directions.map((direction, idx) => (
            <div 
              key={idx}
              className="py-4 border-b border-text-dark/10 flex items-start gap-4"
            >
              <span className="font-mono text-xs text-brand font-bold shrink-0 mt-0.5">
                (0{idx + 1})
              </span>
              <span className="text-base text-text-dark/85 font-medium tracking-tight">
                {direction}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 액션 컨트롤러 영역 */}
      <div className="flex flex-col gap-8 w-full mt-4">
        
        {/* 1. 메인 버튼: 결과 스캔 (블랙 플랫 & 스퀘어 버튼) */}
        <Link
          href="https://define-zeta.vercel.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-4.5 bg-text-dark text-white font-bold text-center text-xs tracking-widest uppercase transition-colors duration-300 hover:bg-brand flex items-center justify-center gap-2 cursor-pointer rounded-none active:scale-[0.99]"
        >
          <span>결과 스캔 — BASIC으로 이어서 보기 →</span>
        </Link>

        {/* 2. 제안 B: 1:1 상담 신청 미니 독립 배너 (라인 & 하이퍼링크 스타일) */}
        <div className="w-full border border-text-dark/10 p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 transition-colors hover:bg-black/[0.01]">
          <div>
            <h4 className="text-sm font-bold text-text-dark tracking-tight">
              1:1 맞춤 브랜딩 솔루션이 필요하신가요?
            </h4>
            <p className="text-xs text-text-dark/50 mt-1 max-w-sm">
              네모ON 전문가팀이 진단 데이터를 바탕으로 실질적인 컨설팅 방안을 도출해 드립니다.
            </p>
          </div>
          <Link
            href="/contact"
            className="text-xs font-bold text-text-dark tracking-widest uppercase underline underline-offset-4 hover:text-brand transition-colors shrink-0 cursor-pointer"
          >
            상담 신청하기 →
          </Link>
        </div>

        {/* 3. 다시 진단하기 */}
        <div className="text-center mt-2">
          <button
            onClick={onRestart}
            className="text-[10px] font-bold text-text-dark/30 hover:text-text-dark tracking-widest transition-all uppercase underline underline-offset-4 cursor-pointer"
          >
            Restart Diagnosis
          </button>
        </div>
      </div>
    </div>
  );
}
