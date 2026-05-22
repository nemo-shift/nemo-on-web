'use client';

import React, { useState } from 'react';
import DiagnosisIntro from './DiagnosisIntro';
import DiagnosisWizard from './DiagnosisWizard';
import DiagnosisResult from './DiagnosisResult';

export type DiagnosisStep = 'INTRO' | 'WIZARD' | 'RESULT';

export default function DiagnosisContainer() {
  const [step, setStep] = useState<DiagnosisStep>('INTRO');
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});

  const handleStart = () => {
    setAnswers({});
    setStep('WIZARD');
  };

  const handleComplete = (finalAnswers: Record<string, string | string[]>) => {
    setAnswers(finalAnswers);
    setStep('RESULT');
  };

  const handleRestart = () => {
    setAnswers({});
    setStep('INTRO');
  };

  return (
    <div className={`w-full min-h-[50vh] flex flex-col items-center transition-all duration-500 ease-in-out ${
      (step === 'WIZARD' || step === 'RESULT')
        ? 'justify-start pt-2 -mt-10 sm:justify-center sm:py-6 sm:mt-0' 
        : 'justify-center py-6'
    }`}>
      <div className="w-full max-w-2xl transition-opacity duration-500 ease-in-out">
        {step === 'INTRO' && (
          <DiagnosisIntro onStart={handleStart} />
        )}
        {step === 'WIZARD' && (
          <DiagnosisWizard onComplete={handleComplete} onCancel={handleRestart} />
        )}
        {step === 'RESULT' && (
          <DiagnosisResult answers={answers} onRestart={handleRestart} />
        )}
      </div>
    </div>
  );
}
