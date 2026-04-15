/**
 * [Data] 브랜드 스토리 섹션 콘텐츠
 * docs/content/1.Home.md 내용을 데이터화
 */

export interface StoryParagraph {
  id: number;
  content: string;
}

export const BRAND_STORY_CONTENT: StoryParagraph[] = [
  {
    id: 1,
    content: '저는 늘 경계에 있었습니다.\n\n호주 Macquarie 대학에서 IT를 공부했습니다.\n한국인도 호주인도 아닌 경계에서 \n제 정체성을 계속 설명해야 했습니다.\n\n그래서 압니다. \n설명되지 않으면 연결되지 않는다는 것을.'
  },
  {
    id: 2,
    content: 'IT, 방송, 요리, 목수, PM, 디자인 등\n서로 다른 일을 오래 건너오며\n하나를 배웠습니다.\n사람이 이해하고 선택하는 방식은 닮아 있다는 것을.\n\n그리고 이 모든 경험이\n당신의 사업을 이해하는 힘이 되었다는 것을 이제 압니다.\n\n그래서 당신의 언어와 고객의 언어 사이, \n그 경계에서 브랜드를 번역합니다.'
  },
  {
    id: 3,
    content: '감성 위에 구조를 더하고, \n구조 안에 감성을 불어넣는 일.\n\n보이지 않는 분위기를 언어로 정리하고,\n흐릿한 가치를 작동하는 구조로 바꾸는 일.\n\n당신의 고유함을 기록하고\n고객과 연결하는 이야기로 만드는 일.'
  },
  {
    id: 4,
    content: '불안을 끄고, 기준을 켭니다.\n\n이제 브랜드를 켤 차례입니다.'
  }
];
