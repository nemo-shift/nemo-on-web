import { create } from 'zustand';

// 8단계 진행 상태 타입 정의
export type LogoJourneyStage = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

interface LogoJourneyState {
  // 현재 몇 번째 Stage인지 (1~8)
  stage: LogoJourneyStage;
  
  // Track 1 (텍스트 로고) 관련 상태
  // 헤더에 안착되었는지 여부 (Stage 3부터 true)
  isTextLogoDocked: boolean;
  
  // Track 2 (도형 모핑) 관련 상태
  // 배경 도형(결)이 확장되었는지 여부
  isBackgroundExpanded: boolean;
  // 새로운 테두리 네모가 나타났는지 여부
  isBorderSquareActive: boolean;

  // 전역 스크롤 진행률 (0~1, 부드러운 애니메이션 보간용)
  scrollProgress: number;

  // Actions
  setStage: (stage: LogoJourneyStage) => void;
  setScrollProgress: (progress: number) => void;
  // 특정 스크롤/섹션 트리거에 의해 편리하게 상태를 업데이트할 수 있는 헬퍼
  advanceTo: (stage: LogoJourneyStage) => void;
  resetJourney: () => void;
}

/**
 * 전역 Logo Journey 상태 관리 훅
 * Header, Hero, SharedNemo, 기타 섹션 컴포넌트 간의 
 * 8단계 시나리오 상태를 동기화합니다.
 */
export const useLogoJourney = create<LogoJourneyState>((set, get) => ({
  stage: 1, // 초기 단계
  scrollProgress: 0,
  isTextLogoDocked: false,
  isBackgroundExpanded: false,
  isBorderSquareActive: false,

  setStage: (stage) => set({ stage }),
  setScrollProgress: (scrollProgress) => set({ scrollProgress }),

  advanceTo: (stage) => {
    switch (stage) {
      case 1:
        // Hero OFF
        set({
          stage: 1,
          isTextLogoDocked: false,
          isBackgroundExpanded: false,
          isBorderSquareActive: false,
        });
        break;
      case 2:
        // Hero ON
        set({
          stage: 2,
          isTextLogoDocked: false,
          isBackgroundExpanded: false,
          isBorderSquareActive: false, // 여전히 히어로 중앙
        });
        break;
      case 3:
        // Hero -> Pain (전환 시작)
        set({
          stage: 3,
          isTextLogoDocked: true, // 텍스트 로고 헤더로 이동 안착
          isBackgroundExpanded: true, // 배경 도형 확장
          isBorderSquareActive: true, // 테두리 도형 등장
        });
        break;
      case 4:
        // Pain 안착 (테두리가 세로로 길어짐)
        set({
          stage: 4,
          isTextLogoDocked: true,
          isBackgroundExpanded: true,
          isBorderSquareActive: true,
        });
        break;
      case 5:
      case 6:
      case 7:
      case 8:
        // 이후 로직도 순차적으로 플래그 세팅 (임시 동일화)
        set({
           stage,
           isTextLogoDocked: true,
           isBackgroundExpanded: true,
           isBorderSquareActive: true,
        });
        break;
    }
  },

  resetJourney: () => set({
    stage: 1,
    isTextLogoDocked: false,
    isBackgroundExpanded: false,
    isBorderSquareActive: false,
  })
}));
