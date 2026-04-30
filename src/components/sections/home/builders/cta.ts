import { gsap } from 'gsap';
import { GlobalBuilderOptions } from '../types';

/**
 * [V12.CTA] CTA 섹션 터미널 부팅 시나리오 빌더
 */
export const buildCTATimeline = (
  tl: gsap.core.Timeline,
  L: Record<string, number>,
  options: GlobalBuilderOptions
) => {
  const { STAGES } = options.registry.constants;
  const start = L[STAGES.TO_CTA]; // 기차가 CTA에 안착한 시점

  const messages = [
    '> 브랜드 켜는 중...',
    '> 당신의 고유함을 데이터로 변환합니다.',
    '> 브랜드 진단을 시작하시겠습니까?'
  ];

  // [V12] 가중치 7.0에 최적화된 리듬 설계 (Dead Zone 제거)
  const typingSpeed = 0.06; // 글자당 속도 (가중치 축소에 맞춰 조정)

  // 메시지별 프록시 상태 관리
  const state = { line1: 0, line2: 0, line3: 0 };

  // 1. 첫 번째 줄 타이핑
  tl.to(state, {
    line1: messages[0].length,
    duration: 1.0, // 고정 구간 할당
    ease: 'none',
    onUpdate: () => {
      const sliced = messages[0].substring(0, Math.floor(state.line1));
      gsap.set('#cta-msg-1', { textContent: sliced });
    }
  }, start + 0.5);

  // 2. 두 번째 줄 타이핑
  tl.to(state, {
    line2: messages[1].length,
    duration: 1.5, // 문장이 기므로 더 많은 구간 할당
    ease: 'none',
    onUpdate: () => {
      const sliced = messages[1].substring(0, Math.floor(state.line2));
      gsap.set('#cta-msg-2', { textContent: sliced });
    }
  }, "> +0.5");

  // 3. 세 번째 줄 타이핑 + 커서 활성화
  tl.to(state, {
    line3: messages[2].length,
    duration: 1.2,
    ease: 'none',
    onStart: () => {
      gsap.set('#cta-terminal-cursor', { display: 'inline-block' });
    },
    onUpdate: () => {
      const sliced = messages[2].substring(0, Math.floor(state.line3));
      gsap.set('#cta-msg-3', { textContent: sliced });
    }
  }, "> +0.5");

  // 4. 버튼 등장 (이 시점이 거의 스크롤의 끝)
  tl.to('#cta-buttons', {
    opacity: 1,
    y: 0,
    duration: 0.8,
    ease: 'power2.out'
  }, "> +0.5");

  // [V11.4] 터미널 그린 옵션 대응 (전체 텍스트 색상 전환)
  // 이 로직은 scroll.ts의 ENABLE_TERMINAL_GREEN 설정에 따라 트리거될 예정입니다.
};
