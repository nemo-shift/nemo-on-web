/**
 * About 페이지 통합 반응형 스타일링 가이드 토큰 (Model A)
 * 
 * [설명]
 * - 오직 시각적인 크기, 패딩, 여백, 정밀 배치 클래스만 기재합니다.
 * - 모바일(default), 태블릿세로(tablet-p:), 데스크톱(tablet:)의 화면 밸런스를 
 *   여기서 한눈에 보면서 직관적으로 미세 조정할 수 있습니다.
 */

export const ABOUT_STAGE_STYLES = {
  philosophy: {
    // 거대 배경 타이틀 (Who We Are)
    bgTitle: {
      size: "text-[42px] tablet-p:text-[76px] tablet:text-[130px] desktop-wide:text-[150px]",
      top: "top-[24%] tablet-p:top-[28%] tablet:top-[30%]",
      tracking: "tracking-[0.1em] tablet-p:tracking-[0.15em] tablet:tracking-[0.2em]"
    },
    // 전면 본문 콘텐츠 블록
    content: {
      fontSize: "text-[15px] tablet-p:text-[18px] tablet:text-[20px]",
      leading: "leading-[1.7] tablet-p:leading-[1.8] tablet:leading-[1.9]",
      maxWidth: "max-w-[85vw] tablet-p:max-w-[600px] tablet:max-w-[800px]",
      gap: "gap-5 tablet-p:gap-7 tablet:gap-8",
      yOffset: "translate-y-[5vh] tablet-p:translate-y-[2vh] tablet:translate-y-0"
    }
  },
  meaning: {
    // (향후 고도화 시 연동할 Meaning 섹션 레이아웃 예비용 자리)
    bgTitle: {
      size: "text-[36px] tablet-p:text-[64px] tablet:text-[110px] desktop-wide:text-[130px]",
      top: "top-[22%] tablet-p:top-[26%] tablet:top-[28%]",
      tracking: "tracking-[0.1em] tablet-p:tracking-[0.15em] tablet:tracking-[0.2em]"
    },
    content: {
      fontSize: "text-[15px] tablet-p:text-[18px] tablet:text-[20px]",
      leading: "leading-[1.7] tablet-p:leading-[1.8] tablet:leading-[1.9]",
      maxWidth: "max-w-[85vw] tablet-p:max-w-[600px] tablet:max-w-[800px]",
      gap: "gap-5 tablet-p:gap-7 tablet:gap-8",
      yOffset: "translate-y-[5vh] tablet-p:translate-y-[2vh] tablet:translate-y-0"
    }
  },
  promise: {
    // (향후 고도화 시 연동할 Promise 섹션 레이아웃 예비용 자리)
    bgTitle: {
      size: "text-[42px] tablet-p:text-[76px] tablet:text-[130px] desktop-wide:text-[150px]",
      top: "top-[24%] tablet-p:top-[28%] tablet:top-[30%]",
      tracking: "tracking-[0.1em] tablet-p:tracking-[0.15em] tablet:tracking-[0.2em]"
    },
    content: {
      fontSize: "text-[15px] tablet-p:text-[18px] tablet:text-[20px]",
      leading: "leading-[1.7] tablet-p:leading-[1.8] tablet:leading-[1.9]",
      maxWidth: "max-w-[85vw] tablet-p:max-w-[600px] tablet:max-w-[800px]",
      gap: "gap-5 tablet-p:gap-7 tablet:gap-8",
      yOffset: "translate-y-[5vh] tablet-p:translate-y-[2vh] tablet:translate-y-0"
    }
  }
};
