import React, { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { COLORS } from '@/constants/colors';
import { cn } from '@/lib/utils';
import { gsap } from 'gsap';
import { DIAGNOSIS_SECTION_CONTENT } from '@/data/home/diagnosis';

export const CTASection = () => {
  // [V12] 터미널 상태 관리
  const [status, setStatus] = useState<'idle' | 'loading' | 'error' | 'complete'>('idle');
  const [activeLogs, setActiveLogs] = useState<string[]>([]);
  const router = useRouter();

  // [Step 9-3] 최종 리다이렉트 실행 함수
  const performRedirect = useCallback(() => {
    setStatus('complete');
    // 스크롤 잠금 해제 후 이동
    document.body.style.overflow = 'auto';
    router.push('/diagnosis');
  }, [router]);

  // [Step 9-2] 로그 시퀀스 처리 함수
  const startLogSequence = useCallback((type: 'yes' | 'no') => {
    const logs = DIAGNOSIS_SECTION_CONTENT.options[type].logs;
    let currentIdx = 0;

    const addNextLog = () => {
      // [Step 9-3] 모든 로그 출력 후 최종 안내 문구 및 리다이렉트 실행
      if (currentIdx >= logs.length) {
        const systemMsg = type === 'yes' 
          ? '> [SYSTEM] 브랜드 진단 페이지로 자동 이동합니다...'
          : '> [FORCE] 진단 페이지로 강제 이동합니다...';
        
        setActiveLogs(prev => [...prev, systemMsg]);
        
        // 1.5초 대기 후 실제 이동 (여운을 주기 위해)
        setTimeout(performRedirect, 1500);
        return;
      }

      const fullText = logs[currentIdx];
      
      if (fullText.includes('███')) {
        const targetPercent = type === 'yes' ? 100 : 40;
        let currentPercent = 0;
        setActiveLogs(prev => [...prev, '> ']);

        const progressInterval = setInterval(() => {
          currentPercent += 2;
          if (currentPercent > targetPercent) {
            clearInterval(progressInterval);
            currentIdx++;
            setTimeout(addNextLog, 400);
            return;
          }

          const blockCount = Math.floor((currentPercent / 100) * 16);
          const blocks = '█'.repeat(blockCount);
          const spaces = ' '.repeat(16 - blockCount);
          const barText = `> ${blocks}${spaces} ${currentPercent}%`;

          setActiveLogs(prev => {
            const newLogs = [...prev];
            newLogs[newLogs.length - 1] = barText;
            return newLogs;
          });
        }, 30);
      } else if (fullText.includes('ERROR')) {
        // [Step 9-3.Special] 에러 발생 시 깜빡임 연출
        setActiveLogs(prev => [...prev, fullText]);
        
        setTimeout(() => {
          const errorLine = document.querySelector('#cta-terminal-logs p:last-of-type');
          if (errorLine) {
            gsap.to(errorLine, {
              opacity: 0,
              repeat: 5,
              yoyo: true,
              duration: 0.1,
              onComplete: () => {
                gsap.set(errorLine, { opacity: 1 });
                currentIdx++;
                setTimeout(addNextLog, 800); // 에러 강조 후 약간 더 길게 대기
              }
            });
          }
        }, 50);
      } else {
        setActiveLogs(prev => [...prev, fullText]);
        currentIdx++;
        setTimeout(addNextLog, 600);
      }
    };

    addNextLog();
  }, [performRedirect]);

  // [Step 9-1] 버튼 클릭 핸들러
  const handleAction = useCallback((type: 'yes' | 'no') => {
    if (status !== 'idle') return;

    const tl = gsap.timeline();
    // 1. 초기 메시지 영역(#cta-terminal-idle)과 버튼 영역(#cta-buttons)만 페이드아웃
    tl.to(['#cta-buttons', '#cta-terminal-idle'], {
      opacity: 0,
      y: -20,
      duration: 0.4,
      ease: 'power2.inOut',
      onComplete: () => {
        // 2. 상태 전환
        setStatus(type === 'yes' ? 'loading' : 'error');
      }
    });
  }, [status]);

  // [Step 9-1.Fix] 상태 변경 후 엘리먼트가 렌더링되면 애니메이션 시작
  useEffect(() => {
    if (status !== 'idle' && status !== 'complete') {
      const type = status === 'loading' ? 'yes' : 'no';
      
      // [Step 9-3] 스크롤 잠금 활성화
      document.body.style.overflow = 'hidden';

      const timeout = setTimeout(() => {
        gsap.to('#cta-terminal-logs', {
          opacity: 1,
          duration: 0.3,
          onComplete: () => startLogSequence(type)
        });
      }, 50);

      return () => {
        clearTimeout(timeout);
        // 컴포넌트 언마운트 시(이동 시) 스크롤 잠금 확실히 해제
        document.body.style.overflow = 'auto';
      };
    }
  }, [status, startLogSequence]);

  return (
    <section 
      id="section-cta"
      className="relative w-full h-[100vh] flex flex-col items-center justify-center overflow-hidden bg-[#0D1A1F]"
    >

      {/* 섹션 안내 가이드 : 섹션 별 구분 원할때 주석 해제 */}
      {/*<div className="absolute top-0 left-0 w-full border-t border-red-500/50 z-[100] pointer-events-none">
        <span className="absolute top-2 left-4 text-[10px] uppercase font-mono text-red-500/50">Start: CTA Section</span>
      </div>*/}

      <div 
        id="cta-content"
        className="container mx-auto px-6 tablet-p:px-8 tablet:px-10 desktop-wide:px-12 desktop-cap:px-16 flex flex-col items-center relative"
      >
        {/* [V12] 3단계 반응형 뼈대 (상태에 따른 UI 전환) */}
        <div className={cn(
          "mx-auto w-full",
          "max-w-[90vw]",
          "tablet-p:max-w-[80vw]",
          "tablet:max-w-[700px]",
          "min-h-[160px] tablet-p:min-h-[200px] tablet:min-h-[240px]"
        )}>
          {status === 'idle' ? (
            <div id="cta-terminal-idle" className="flex flex-col items-start space-y-4 tablet-p:space-y-6">
              {[1, 2, 3].map((num) => (
                <div key={num} className="flex items-start justify-start min-h-[1.5em] w-full">
                  <p 
                    id={`cta-msg-${num}`} 
                    className={cn(
                      "font-mono font-medium leading-relaxed text-left whitespace-pre-wrap",
                      "text-base",
                      "tablet-p:text-xl",
                      "tablet:text-2xl",
                      "text-[#00FF41]"
                    )}
                  />
                  {num === 3 && (
                    <span id="cta-terminal-cursor" className="text-[#00FF41] animate-terminal-cursor font-mono ml-2 text-xl tablet-p:text-2xl tablet:text-3xl" style={{ display: 'none' }}>|</span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div id="cta-terminal-logs" className="flex flex-col items-start space-y-2 opacity-0">
              {activeLogs.map((log, i) => (
                <p key={i} className={cn(
                  "font-mono text-left whitespace-pre-wrap",
                  "text-sm tablet-p:text-base tablet:text-lg",
                  log.includes('ERROR') ? 'text-red-500' : 'text-[#00FF41]'
                )}>
                  {log}
                </p>
              ))}
              <span className="inline-block text-[#00FF41] animate-terminal-cursor font-mono">|</span>
            </div>
          )}
        </div>

        {/* YES/NO 버튼 영역 (반응형 뼈대) */}
        <div 
          id="cta-buttons" 
          className={cn(
            "mt-12 tablet-p:mt-16 flex items-center justify-center opacity-0 translate-y-8",
            "space-x-6",
            "tablet-p:space-x-10",
            "tablet:space-x-16"
          )}
        >
          <button 
            onClick={() => handleAction('yes')}
            className="group relative px-8 tablet-p:px-10 py-3 border border-[#00FF41]/40 hover:border-[#00FF41] transition-all duration-300"
          >
            <span className="relative z-10 font-mono text-[#00FF41] text-lg tablet-p:text-xl tracking-widest">YES</span>
            <div className="absolute inset-0 bg-[#00FF41]/0 group-hover:bg-[#00FF41]/10 transition-all duration-300" />
          </button>
          <button 
            onClick={() => handleAction('no')}
            className="group relative px-8 tablet-p:px-10 py-3 border border-white/20 hover:border-white/40 transition-all duration-300 opacity-50 hover:opacity-100"
          >
            <span className="relative z-10 font-mono text-white text-lg tablet-p:text-xl tracking-widest">NO</span>
          </button>
        </div>
      </div>
    </section>
  );
};
