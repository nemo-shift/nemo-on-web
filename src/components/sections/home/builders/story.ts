import { gsap } from 'gsap';
import { GlobalBuilderOptions } from '../types';

/**
 * [V12.Story] 브랜드 스토리 4단계 시퀀스 빌더
 * 1. 단색(틸) -> 2. 2분할(화이트/틸) -> 3. 역분할(틸/화이트) -> 4. 단색
 */
export const buildStoryTimeline = (
  tl: gsap.core.Timeline,
  L: Record<string, number>,
  options: GlobalBuilderOptions
) => {
  const { STAGES, TIMING_CFG } = options.registry.constants;
  const w = TIMING_CFG.SECTION_WEIGHT.STORY_STILL;
  const start = L[STAGES.TO_STORY];
  const step = w / 4;
  const { isMobileView } = options;

  // 공통 애니메이션 옵션
  const fadeOut = { opacity: 0, y: -20, duration: step * 0.4, ease: 'power2.in' };
  const fadeIn = { opacity: 1, y: 0, duration: step * 0.6, ease: 'power2.out' };

  // ─────────────────────────────────────────────
  // Phase 1: 단색 (Teal) + 중앙 텍스트
  // ─────────────────────────────────────────────
  tl.to('#story-paragraph-1', fadeIn, start + 0.2);

  // ─────────────────────────────────────────────
  // Phase 2: 2분할 (PC: 좌-화이트/우-틸, Mobile: 상-화이트/하-틸)
  // ─────────────────────────────────────────────
  const p2Start = start + step;
  
  // 텍스트 1 퇴장
  tl.to('#story-paragraph-1', fadeOut, p2Start);

  // 배경 분할 진입
  if (isMobileView) {
    tl.fromTo('#story-bg-white', 
      { opacity: 1, yPercent: -100, xPercent: 0 }, 
      { yPercent: -50, duration: step * 0.6, ease: 'power3.inOut' }, 
      p2Start
    );
    // 텍스트 2 등장 (하단 틸 영역 위)
    tl.fromTo('#story-paragraph-2', 
      { opacity: 0, y: '33vh' }, 
      { opacity: 1, y: '25vh', duration: step * 0.6, ease: 'power2.out' }, 
      p2Start + step * 0.2
    );
  } else {
    tl.fromTo('#story-bg-white', 
      { opacity: 1, xPercent: -100, yPercent: 0 }, 
      { xPercent: -50, duration: step * 0.6, ease: 'power3.inOut' }, 
      p2Start
    );
    // 텍스트 2 등장 (우측 틸 영역 위)
    tl.fromTo('#story-paragraph-2', 
      { opacity: 0, x: '33vw', y: 0 }, 
      { opacity: 1, x: '25vw', y: 0, duration: step * 0.6, ease: 'power2.out' }, 
      p2Start + step * 0.2
    );
  }

  // ─────────────────────────────────────────────
  // Phase 3: 역분할 (PC: 좌-틸/우-화이트, Mobile: 상-틸/하-화이트)
  // ─────────────────────────────────────────────
  const p3Start = start + step * 2;

  // 텍스트 2 퇴장
  tl.to('#story-paragraph-2', fadeOut, p3Start);

  // 배경 분할 교차
  if (isMobileView) {
    tl.to('#story-bg-white', { yPercent: 50, duration: step * 0.8, ease: 'power3.inOut' }, p3Start);
    // 텍스트 3 등장 (상단 틸 영역 위)
    tl.fromTo('#story-paragraph-3', 
      { opacity: 0, y: '-17vh' }, 
      { opacity: 1, y: '-25vh', duration: step * 0.6, ease: 'power2.out' }, 
      p3Start + step * 0.2
    );
  } else {
    tl.to('#story-bg-white', { xPercent: 50, duration: step * 0.8, ease: 'power3.inOut' }, p3Start);
    // 텍스트 3 등장 (좌측 틸 영역 위)
    tl.fromTo('#story-paragraph-3', 
      { opacity: 0, x: '-33vw', y: 0 }, 
      { opacity: 1, x: '-25vw', y: 0, duration: step * 0.6, ease: 'power2.out' }, 
      p3Start + step * 0.2
    );
  }

  // ─────────────────────────────────────────────
  // Phase 4: 단색 복귀 (Teal로 우선 통일) + 중앙 텍스트
  // ─────────────────────────────────────────────
  const p4Start = start + step * 3;

  // 텍스트 3 퇴장
  tl.to('#story-paragraph-3', fadeOut, p4Start);

  // 배경 다시 틸로 팽창 (화이트 패널 퇴장)
  tl.to('#story-bg-white', { opacity: 0, duration: step * 0.6, ease: 'power2.inOut' }, p4Start);

  // 텍스트 4 등장 (중앙) - 초기에는 흰색 유지
  tl.set('#story-text-4', { color: '#FFFFFF' }, p4Start);
  tl.to('#story-paragraph-4', fadeIn, p4Start + step * 0.2);

  // [V11.4] 4단계 마무리: 다크 모드 전환 및 터미널 커서 등장 연출
  // 삭제 연출 구간(STORY_ERASE) 시작 직전에 배경을 블랙으로 반전시키고 커서를 켭니다.
  tl.to('#story-bg-white', {
    backgroundColor: '#0D1A1F', // 다크 배경색
    opacity: 1,
    xPercent: 0, // [V11.4] 이전 단계의 분할(Split) 상태 초기화 (전체 화면 덮기)
    yPercent: 0, // 모바일 대응 초기화
    width: '100%',
    height: '100%',
    duration: 0.1, // '탁' 하고 바뀌는 스냅 느낌
    ease: 'none',
    onStart: () => {
      gsap.set('#story-cursor-4', { display: 'inline-block' });
    },
    onReverseComplete: () => {
      gsap.set('#story-cursor-4', { display: 'none' });
    }
  }, L[STAGES.STORY_ERASE] - 0.2);
};
