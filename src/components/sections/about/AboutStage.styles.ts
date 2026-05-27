/**
 * About 페이지 통합 반응형 스타일링 가이드 토큰 (Model A - 뷰포트 유동형 튜닝)
 * 
 * [설명]
 * - 오직 시각적인 크기, 패딩, 여백, 정밀 배치 클래스만 기재합니다.
 * - 모바일(default), 태블릿세로(tablet-p:), 데스크톱(tablet:)의 화면 밸런스를 
 *   여기서 한눈에 보면서 직관적으로 미세 조정할 수 있습니다.
 * - 절대적인 ml- 마진 대신, left-1/2 -translate-x-1/2 중앙 정렬 하에서 pl- 패딩 및 max-w를 조합하여
 *   좁은 화면에서도 화면 밖으로 탈출하거나 치우치지 않는 반응형 밸런스를 구현합니다.
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
      // 🆕 뷰포트 너비(vw)에 철저하게 맞춘 유동적 max-w 선언
      maxWidth: "w-[90vw] tablet-p:w-[70vw] tablet:w-[50vw] max-w-[90vw] tablet-p:max-w-[580px] tablet:max-w-[700px]",
      gap: "gap-5 tablet-p:gap-7 tablet:gap-8",
      yOffset: "translate-y-[5vh] tablet-p:translate-y-[2vh] tablet:translate-y-0",
      // 🆕 오직 모바일 환경(default pl- 값)에서만 본문 콘텐츠의 정렬선을 더 우측으로 이동합니다.
      // pl-8 -> pl-12
      paddingLeft: "pl-12 tablet-p:pl-44 tablet:pl-32",
      labelPaddingLeft: "pl-4 tablet-p:pl-32 tablet:pl-24"
    }
  },
  meaning: {
    bgTitle: {
      size: "text-[36px] tablet-p:text-[64px] tablet:text-[110px] desktop-wide:text-[130px]",
      top: "top-[22%] tablet-p:top-[26%] tablet:top-[28%]",
      tracking: "tracking-[0.1em] tablet-p:tracking-[0.15em] tablet:tracking-[0.2em]"
    },
    content: {
      fontSize: "text-[15px] tablet-p:text-[18px] tablet:text-[20px]",
      leading: "leading-[1.7] tablet-p:leading-[1.8] tablet:leading-[1.9]",
      maxWidth: "w-[90vw] tablet-p:w-[70vw] tablet:w-[50vw] max-w-[90vw] tablet-p:max-w-[580px] tablet:max-w-[700px]",
      gap: "gap-5 tablet-p:gap-7 tablet:gap-8",
      yOffset: "translate-y-[5vh] tablet-p:translate-y-[2vh] tablet:translate-y-0",
      paddingLeft: "pl-12 tablet-p:pl-44 tablet:pl-32",
      labelPaddingLeft: "pl-4 tablet-p:pl-32 tablet:pl-24"
    }
  },
  promise: {
    bgTitle: {
      size: "text-[42px] tablet-p:text-[76px] tablet:text-[130px] desktop-wide:text-[150px]",
      top: "top-[24%] tablet-p:top-[28%] tablet:top-[30%]",
      tracking: "tracking-[0.1em] tablet-p:tracking-[0.15em] tablet:tracking-[0.2em]"
    },
    content: {
      fontSize: "text-[15px] tablet-p:text-[18px] tablet:text-[20px]",
      leading: "leading-[1.7] tablet-p:leading-[1.8] tablet:leading-[1.9]",
      maxWidth: "w-[90vw] tablet-p:w-[70vw] tablet:w-[50vw] max-w-[90vw] tablet-p:max-w-[580px] tablet:max-w-[700px]",
      gap: "gap-5 tablet-p:gap-7 tablet:gap-8",
      yOffset: "translate-y-[5vh] tablet-p:translate-y-[2vh] tablet:translate-y-0",
      paddingLeft: "pl-12 tablet-p:pl-44 tablet:pl-32",
      labelPaddingLeft: "pl-4 tablet-p:pl-32 tablet:pl-24"
    }
  }
};
