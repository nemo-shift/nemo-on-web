'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { DEBUG_CONFIG } from '@/constants/debug';
import { useHeroContext } from '@/context';
import { debugLog } from './debug-utils';
import { InteractionRegistry } from './types';

/**
 * // [완성후-삭제] : 프로젝트 최종 완성 시점에만 삭제 (디버그 점프 엔진)
 * 
 * 특정 섹션의 인터랙션을 즉시 확인하기 위한 '순간 이동' 컴포넌트입니다.
 * 인터랙션 엔진의 '무결성'을 위해 GlobalInteractionStage 본체에서 분리하여 독자적으로 작동합니다.
 */
interface InteractionDebuggerProps {
  masterTl: gsap.core.Timeline | null;
  registry: InteractionRegistry;
}

const InteractionDebugger = ({ masterTl, registry }: InteractionDebuggerProps) => {
  const { STAGES } = registry.constants;
  const { isTimelineReady } = useHeroContext();
  const hasJumped = useRef(false);

  useEffect(() => {
    // 1. 디버그 모드가 아니거나, 이미 점프를 수행했거나, 타임라인이 준비되지 않았으면 조기 종료
    if (!DEBUG_CONFIG.USE_DEBUG || hasJumped.current || !isTimelineReady || !masterTl) return;

    const targetStage = DEBUG_CONFIG.START_STAGE;
    if (!targetStage) return;

    // 2. 점프할 위치(라벨 또는 스테이지 키값) 탐색
    let label = targetStage;
    
    // 단순 키워드(예: 'pain') 입력 시 실제 STAGES 라벨로 매핑 보정
    if (targetStage === 'pain') label = STAGES.TO_PAIN;
    if (targetStage === 'msg' || targetStage === 'message') label = STAGES.TO_MESSAGE;
    if (targetStage === 'fw' || targetStage === 'forwho') label = STAGES.TO_FORWHO;

    // 3. 타임라인 내 해당 라벨이 존재하는지 검증
    const labels = masterTl.labels;
    if (!(label in labels)) {
      debugLog(`지정한 라벨 '${label}'을 타임라인에서 찾을 수 없습니다.`);
      return;
    }

    // 4. 즉시 이동(Immediate Jump) 수행
    // [V11.20] 사용자 요청에 따라 '즉시 이동' 방식으로 고정
    debugLog(`시스템 신호 수신: '${label}' 섹션으로 즉시 점프를 시작합니다.`);

    // 4-1. 타임라인 진행도 강제 설정
    const labelTime = labels[label];
    masterTl.pause().seek(label); // 타임라인 보정

    // 4-2. 실제 스크롤 위치 계산 및 강제 이동
    const st = masterTl.scrollTrigger;
    if (st) {
      // 라벨 시간에 비례하는 픽셀 위치 계산
      const totalDuration = masterTl.totalDuration();
      const progress = labelTime / totalDuration;
      const scrollPos = st.start + (st.end - st.start) * progress;

      // [DEPLOY-DELETE] 시스템 신뢰도를 위해 즉시 이동 (Smooth Scroll 무시)
      window.scrollTo({ top: scrollPos, behavior: 'instant' as any });
      
      // Lenis 등 외부 스크롤 라이브러리 대응 (존재 시 즉시 이동)
      if ((window as any).lenis) {
        (window as any).lenis.scrollTo(scrollPos, { immediate: true });
      }

      // 4-3. ScrollTrigger 및 상태 강제 갱신 (잔상 제거)
      ScrollTrigger.refresh();
      hasJumped.current = true;
      debugLog(`점프 완료: 현재 라벨 '${label}' (진행도: ${(progress * 100).toFixed(1)}%)`);
    }

  }, [isTimelineReady, masterTl]);

  return null; // 본 컴포넌트는 오직 로직(Side-effect)만 수행하며 렌더링되지 않습니다.
};

export default InteractionDebugger;
