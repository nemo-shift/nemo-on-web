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

        {/* 진단 다시하기 — Core Directions 직후 배치 */}
        <div className="mt-4">
          <button
            onClick={onRestart}
            className="text-[10px] font-bold text-text-dark/30 hover:text-text-dark tracking-widest transition-all uppercase underline underline-offset-4 cursor-pointer"
          >
            진단 다시하기
          </button>
        </div>
      </div>

      {/* 액션 컨트롤러 영역 */}
      <div className="flex flex-col gap-8 w-full mt-4">

        {/* CTA 카피 블록 */}
        <div className="flex flex-col gap-1 text-center">
          <p className="text-sm tablet-p:text-base font-light text-text-dark/70 leading-relaxed">
            지금 결과는 첫 번째 신호입니다.
          </p>
          <p className="text-sm tablet-p:text-base font-light text-text-dark/70 leading-relaxed">
            BASIC 진단에서 더 깊이 들어가, 지금 브랜드가 어디서 막혀 있는지 확인하세요.
          </p>
          <p className="text-[11px] text-text-dark/35 leading-relaxed mt-1">
            (BASIC 진단코드는 무료웨비나 참여 시 제공됩니다.)
          </p>
        </div>

        {/* 1. 듀얼 버튼: BASIC + 웨비나 */}
        <div className="flex flex-col tablet-p:flex-row gap-3 w-full">
          <Link
            href="https://define.nemoon.co/basic"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex-1 py-4 bg-text-dark text-white text-center transition-colors duration-300 hover:bg-[#1a3a4a] flex flex-col items-center justify-center gap-1.5 cursor-pointer active:scale-[0.99]"
          >
            <span className="text-[11px] font-medium text-white/50 group-hover:text-white/70 transition-colors">
              DE:FINE에서
            </span>
            <span className="text-xs font-bold tracking-widest uppercase">
              BASIC 진단 이어가기 →
            </span>
          </Link>
          <a
            href="https://define.nemoon.co/webinar"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex-1 py-4 border border-text-dark text-text-dark text-center transition-colors duration-300 hover:bg-brand hover:text-white hover:border-brand flex flex-col items-center justify-center gap-1.5 cursor-pointer active:scale-[0.99]"
          >
            <span className="text-[11px] font-medium text-text-dark/40 group-hover:text-white/70 transition-colors">
              진단코드가 필요하다면
            </span>
            <span className="text-xs font-bold tracking-widest uppercase">
              무료웨비나 알아보기 →
            </span>
          </a>
        </div>

        {/* 3. 1:1 상담 */}
        <div className="w-full border border-text-dark/10 p-6 flex flex-col tablet-p:flex-row tablet-p:items-center tablet-p:justify-between gap-4 transition-colors hover:bg-black/[0.01]">
          <div>
            <h4 className="text-sm font-bold text-text-dark tracking-tight">
              1:1 맞춤 브랜딩 솔루션이 필요하신가요?
            </h4>
            <p className="text-xs text-text-dark/50 mt-1 max-w-sm">
              진단 데이터를 바탕으로 실질적인 컨설팅 방안을 도출해 드립니다.
            </p>
          </div>
          <Link
            href="/contact"
            className="text-xs font-bold text-text-dark tracking-widest uppercase underline underline-offset-4 hover:text-brand transition-colors shrink-0 cursor-pointer"
          >
            상담 신청하기 →
          </Link>
        </div>

      </div>
    </div>
  );
}
