'use client';

import React, { useState } from 'react';
import { DIAGNOSIS_QUESTIONS, DiagnosisQuestion } from '@/data/diagnosis-page';

interface DiagnosisWizardProps {
  onComplete: (answers: Record<string, string | string[]>) => void;
  onCancel: () => void;
}

export default function DiagnosisWizard({ onComplete, onCancel }: DiagnosisWizardProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [showLimitWarning, setShowLimitWarning] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const currentQuestion: DiagnosisQuestion = DIAGNOSIS_QUESTIONS[currentIdx];
  const isLastQuestion = currentIdx === DIAGNOSIS_QUESTIONS.length - 1;

  // 1단계(Q1~Q3) / 2단계(Q4~Q7)
  const currentStepLabel = currentIdx < 3 ? '01 / Current Status' : '02 / core Challenge';

  const changeQuestion = (nextIdx: number) => {
    setIsTransitioning(true);
    setShowLimitWarning(false);
    setTimeout(() => {
      setCurrentIdx(nextIdx);
      setIsTransitioning(false);
    }, 200);
  };

  // 단일 선택 응답 처리 (자동 이동 제거)
  const handleSingleSelect = (option: string) => {
    setAnswers({
      ...answers,
      [currentQuestion.id]: option
    });
  };

  const handleMultipleSelect = (option: string) => {
    const currentSelections = (answers[currentQuestion.id] as string[]) || [];
    const maxSelect = currentQuestion.maxSelect || 3;

    let updatedSelections: string[];

    if (currentSelections.includes(option)) {
      updatedSelections = currentSelections.filter((item) => item !== option);
      setShowLimitWarning(false);
    } else {
      if (currentSelections.length >= maxSelect) {
        setShowLimitWarning(true);
        return;
      }
      updatedSelections = [...currentSelections, option];
      setShowLimitWarning(false);
    }

    setAnswers({
      ...answers,
      [currentQuestion.id]: updatedSelections
    });
  };

  // [다음/제출] 버튼 클릭 처리
  const handleNext = () => {
    const hasAnswer = currentQuestion.type === 'multiple'
      ? ((answers[currentQuestion.id] as string[]) || []).length > 0
      : !!answers[currentQuestion.id];

    if (!hasAnswer) {
      alert('최소 1개 이상의 옵션을 선택해 주세요.');
      return;
    }

    if (isLastQuestion) {
      onComplete(answers);
    } else {
      changeQuestion(currentIdx + 1);
    }
  };

  const handleBack = () => {
    if (currentIdx > 0) {
      changeQuestion(currentIdx - 1);
    } else {
      onCancel();
    }
  };

  const progressPercent = Math.round(((currentIdx + 1) / DIAGNOSIS_QUESTIONS.length) * 100);

  return (
    <div className="w-full max-w-2xl mx-auto pt-2 pb-12 sm:pt-12 px-4 flex flex-col min-h-[580px] justify-between">
      
      <div>
        {/* 최상단 1px 초미세 선형 프로그레스 바 */}
        <div className="w-full h-[1px] bg-text-dark/10 overflow-hidden mb-10">
          <div 
            className="h-full bg-text-dark transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>

        {/* 메타 인덱스 */}
        <div className="flex justify-between items-center font-mono text-[10px] tracking-[0.25em] text-text-dark/40 uppercase mb-4">
          <span>{currentStepLabel}</span>
          <span>{currentIdx + 1} of {DIAGNOSIS_QUESTIONS.length}</span>
        </div>

        {/* 질문 렌더링 영역 */}
        <div className={`transition-opacity duration-200 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-text-dark tracking-tight leading-snug mb-8">
            {currentQuestion.question}
          </h3>

          {/* 다중선택 서브 가이드 */}
          {currentQuestion.type === 'multiple' && (
            <div className="text-[11px] font-mono tracking-wider text-text-dark/40 mb-6 flex flex-wrap items-center gap-2">
              <span>* MULTIPLE CHOICE (MAX {currentQuestion.maxSelect})</span>
              {showLimitWarning && (
                <span className="text-accent font-bold animate-pulse">
                  / 최대 {currentQuestion.maxSelect}개만 선택 가능합니다.
                </span>
              )}
            </div>
          )}

          {/* 가로 실선 분할형 보기 리스트 */}
          <div className="border-t border-text-dark/10">
            {currentQuestion.options.map((option) => {
              const isSelected = currentQuestion.type === 'multiple'
                ? ((answers[currentQuestion.id] as string[]) || []).includes(option)
                : answers[currentQuestion.id] === option;

              return (
                <button
                  key={option}
                  onClick={() => {
                    if (currentQuestion.type === 'multiple') {
                      handleMultipleSelect(option);
                    } else {
                      handleSingleSelect(option);
                    }
                  }}
                  className={`w-full text-left py-4.5 border-b border-text-dark/10 transition-all duration-300 flex items-center justify-between group cursor-pointer ${
                    isSelected ? 'translate-x-2' : 'hover:translate-x-2'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* 선택 인디케이터 (미니멀 도트) */}
                    <span 
                      className={`w-1.5 h-1.5 rounded-full bg-brand transition-all duration-300 shrink-0 ${
                        isSelected ? 'scale-100 opacity-100' : 'scale-0 opacity-0 group-hover:scale-50 group-hover:opacity-50'
                      }`}
                    />
                    <span className={`text-base tracking-tight transition-colors duration-300 ${
                      isSelected 
                        ? 'text-brand font-bold' 
                        : 'text-text-dark/60 group-hover:text-text-dark'
                    }`}>
                      {option}
                    </span>
                  </div>

                  {/* 세련된 화살표 표식 */}
                  {currentQuestion.type === 'single' && (
                    <span className={`text-xs font-mono tracking-widest transition-opacity duration-300 ${
                      isSelected ? 'text-brand opacity-100' : 'opacity-0 group-hover:opacity-100 text-text-dark/40'
                    }`}>
                      SELECT →
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 하단 네비게이션 컨트롤 */}
      <div className="mt-12 pt-6 border-t border-text-dark/10 flex justify-between items-center">
        <button
          onClick={handleBack}
          className="text-xs font-bold text-text-dark/40 hover:text-text-dark tracking-widest uppercase transition-colors py-2 cursor-pointer"
        >
          ← PREVIOUS
        </button>

        {/* 항상 버튼 노출, 답변이 선택되었을 때만 활성화 (단일/다중 공통) */}
        <button
          onClick={handleNext}
          disabled={
            currentQuestion.type === 'multiple'
              ? ((answers[currentQuestion.id] as string[]) || []).length === 0
              : !answers[currentQuestion.id]
          }
          className="px-6 py-2.5 bg-text-dark text-white font-semibold text-xs tracking-widest uppercase transition-all duration-300 hover:bg-brand disabled:opacity-25 disabled:pointer-events-none cursor-pointer"
        >
          {isLastQuestion ? 'SUBMIT 결과 보기 →' : 'NEXT →'}
        </button>
      </div>
    </div>
  );
}
