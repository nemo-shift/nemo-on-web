'use client';

import React, { useState, useRef, useCallback } from 'react';
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

  // 최초 마운트(진입) 시 스크롤이 상단으로 튀어 올라가는 현상을 차단하기 위한 플래그
  const isMounted = React.useRef(false);
  const nextBtnRef = useRef<HTMLButtonElement>(null);

  // 모바일에서 선택 완료 시 Next 버튼으로 자동 스크롤
  const scrollToNext = useCallback(() => {
    if (typeof window === 'undefined' || window.innerWidth >= 744) return;
    setTimeout(() => {
      nextBtnRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  }, []);

  // 질문 번호(currentIdx)가 변경될 때마다 화면 스크롤을 즉시 최상단으로 초기화 (질문 전환 전용)
  React.useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);
    }
  }, [currentIdx]);

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

  // 단일 선택 응답 처리
  const handleSingleSelect = (option: string) => {
    setAnswers({
      ...answers,
      [currentQuestion.id]: option
    });
    scrollToNext();
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

    // 최대 선택 수 도달 시 Next 버튼으로 스크롤
    if (updatedSelections.length >= maxSelect) {
      scrollToNext();
    }
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
                  className={`w-full text-left border-b border-text-dark/10 transition-all duration-300 flex items-center justify-between group cursor-pointer ${
                    currentIdx === 0 ? 'py-3 tablet-p:py-4.5' : 'py-4.5'
                  } ${isSelected ? 'translate-x-2' : 'hover:translate-x-2'}`}
                >
                  <div className="flex items-center gap-3">
                    {/* 선택 인디케이터: 단일=도트, 다중=체크박스 */}
                    {currentQuestion.type === 'multiple' ? (
                      <span className={`w-4 h-4 rounded-[3px] border-[1.5px] shrink-0 flex items-center justify-center transition-all duration-300 ${
                        isSelected
                          ? 'bg-brand border-brand'
                          : 'border-text-dark/20 group-hover:border-text-dark/40'
                      }`}>
                        <span className={`text-[10px] font-bold text-white transition-all duration-200 ${
                          isSelected ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
                        }`}>✓</span>
                      </span>
                    ) : (
                      <span
                        className={`w-1.5 h-1.5 rounded-full bg-brand transition-all duration-300 shrink-0 ${
                          isSelected ? 'scale-100 opacity-100' : 'scale-0 opacity-0 group-hover:scale-50 group-hover:opacity-50'
                        }`}
                      />
                    )}
                    <span className={`text-base tracking-tight transition-colors duration-300 ${
                      isSelected
                        ? 'text-brand font-bold'
                        : 'text-text-dark/60 group-hover:text-text-dark'
                    }`}>
                      {option}
                    </span>
                  </div>

                  {/* 단일 선택: 체크 표식 */}
                  {currentQuestion.type === 'single' && (
                    <span className={`text-sm font-bold transition-all duration-300 ${
                      isSelected ? 'text-brand opacity-100 scale-100' : 'opacity-0 scale-75'
                    }`}>
                      ✓
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
          ref={nextBtnRef}
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
