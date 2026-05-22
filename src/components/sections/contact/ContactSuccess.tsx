'use client';

import React from 'react';
import Link from 'next/link';

interface ContactSuccessProps {
  onReset: () => void;
}

export default function ContactSuccess({ onReset }: ContactSuccessProps) {
  return (
    <div className="w-full max-w-2xl mx-auto py-16 px-4 text-left flex flex-col justify-between min-h-[400px]">
      <div className="animate-fade-in">
        {/* 미니멀 체크 아이콘 또는 표식 */}
        <div className="w-8 h-[1px] bg-brand mb-8" />
        
        <h2 className="text-3xl sm:text-4xl font-extrabold text-text-dark tracking-tight leading-snug mb-6">
          문의가 전달되었습니다.
        </h2>
        
        <p className="text-base text-text-dark/60 leading-relaxed font-light tracking-wide max-w-lg mb-12">
          남겨주신 소중한 내용을 신속하게 확인한 후, <br />
          입력해 주신 연락처로 조속히 답변드리겠습니다.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-6 border-t border-text-dark/10 pt-8">
        <Link
          href="/"
          className="text-xs font-bold text-text-dark/80 hover:text-brand tracking-widest uppercase transition-colors py-2 cursor-pointer"
        >
          ← GO TO MAIN
        </Link>
        <button
          onClick={onReset}
          className="text-xs font-bold text-brand hover:text-text-dark tracking-widest uppercase transition-colors py-2 cursor-pointer sm:ml-auto"
        >
          NEW INQUIRY (새 문의하기) →
        </button>
      </div>
    </div>
  );
}
