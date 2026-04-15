import { COLORS } from '@/constants/interaction';

export interface MessageLine {
  text: string;
  isHighlight?: boolean;
}

export interface MessageGroup {
  id: number;
  lines: MessageLine[];
}

/**
 * [V11.57 Data] 메세지 섹션 콘텐츠 정의
 * docs/content/pages/1.Home.md 원고 내용을 정밀하게 반영함.
 */
export const MESSAGE_CONTENT: MessageGroup[] = [
  {
    id: 1,
    lines: [
      { text: '브랜딩부터 웹까지,' },
      { text: '하나의 기준으로 설명 가능하게.' },
      { text: '설명이 가능해지면 연결됩니다.', isHighlight: true }
    ]
  },
  {
    id: 2,
    lines: [
      { text: '관심이 없습니다.' },
      { text: '단지 있어야 하니까 만드는 브랜드엔' },
      { text: '만들지 않습니다.' },
      { text: '단순히 좋아보이고 예쁜 웹사이트는' }
    ]
  },
  {
    id: 3,
    lines: [
      { text: '당신의 언어를 고객의 언어로.' },
      { text: '당신의 가치를 고객 선택 이유로.' },
      { text: '당신의 감각을 고객이 이해하는 구조로.' },
      { text: '' }, // 원고상의 줄바꿈 반영
      { text: '설명이 가능해지면 연결됩니다.', isHighlight: true }
    ]
  }
];

export const MESSAGE_COLORS = {
  // Reveal 전 (흐릿)
  BEFORE: {
    STANDARD: '#C4BDB4',
    INVERTED: '#99bee9ff'
  },
  // Reveal 후 (선명)
  AFTER: {
    STANDARD: '#0D1A1F',
    INVERTED: '#0a1685ff'
  }
};
