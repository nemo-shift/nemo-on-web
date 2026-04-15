/**
 * [Data] 히어로 섹션 콘텐츠
 * docs/content/1.Home.md 내용을 데이터화
 */

export const HERO_CONTENT = {
  off: {
    slogan: {
      static: '흐릿한',
      rotating: ['아이디어를', '생각을', '확신을', '방향을'],
      suffix: '작동하는 브랜드로'
    },
    phrase: '브랜드를 켜다'
  },
  on: {
    slogan: '불안을 끄고, 기준을 켭니다',
    phraseLines: [
      { text: '감성 위에 구조를 더해', connect: 'circle' },
      { text: '당신의', connect: null },
      { text: '결', connect: 'square' },
      { text: '로', connect: null },
      { text: '브랜드를 켭니다', connect: null }
    ]
  }
};
