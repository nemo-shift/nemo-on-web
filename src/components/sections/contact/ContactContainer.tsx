'use client';

import React, { useState } from 'react';
import ContactForm from './ContactForm';
import ContactSuccess from './ContactSuccess';

export type ContactStep = 'FORM' | 'SUCCESS';

export default function ContactContainer() {
  const [step, setStep] = useState<ContactStep>('FORM');
  const [formData, setFormData] = useState<any>(null);

  const handleSubmitSuccess = (data: any) => {
    setFormData(data);
    setStep('SUCCESS');
    // 최상단으로 스크롤 이동하여 성공 문구가 잘 보이도록 처리
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReset = () => {
    setFormData(null);
    setStep('FORM');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="w-full flex flex-col lg:flex-row gap-12 lg:gap-16 items-start justify-between min-h-[70vh]">
      
      {/* 좌측: 빅 카피 영역 (Sticky) */}
      <div className="w-full lg:w-2/5 lg:sticky lg:top-32 text-left space-y-4">
        <div className="w-12 h-[2px] bg-brand mb-6" />
        <h1 className="text-4xl sm:text-5xl font-extrabold text-text-dark tracking-tight leading-tight">
          궁금하거나 <br />
          의뢰하실 사항이 있다면 <br />
          문의해주세요.
        </h1>
        <p className="text-sm sm:text-base font-light text-text-dark/50 leading-relaxed max-w-sm">
          당신의 브랜드가 가진 고유의 결을 듣고 <br className="hidden sm:inline" />
          가장 필요한 솔루션을 제안해 드립니다.
        </p>
      </div>

      {/* 우측: 폼 / 성공 화면 영역 (Scrollable) */}
      <div className="w-full lg:w-3/5 border-t lg:border-t-0 lg:border-l border-text-dark/10 lg:pl-12 pt-8 lg:pt-0 transition-all duration-500">
        <div className="w-full transition-opacity duration-300">
          {step === 'FORM' && (
            <ContactForm onSubmitSuccess={handleSubmitSuccess} />
          )}
          {step === 'SUCCESS' && (
            <ContactSuccess onReset={handleReset} />
          )}
        </div>
      </div>
      
    </div>
  );
}
