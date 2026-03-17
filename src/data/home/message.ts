export interface MessageGroup {
  id: number;
  sentences: string[];
}

export const MESSAGE_GROUPS: MessageGroup[] = [
  {
    id: 1,
    sentences: [
      '브랜딩부터 웹까지, 하나의 기준으로 설명 가능하게.',
      '설명이 가능해지면 연결됩니다.',
    ],
  },
  {
    id: 2,
    sentences: [
      '단지 있어야 하니까 만드는 브랜드엔 관심이 없습니다.',
      '단순히 예쁜 웹사이트를 만들지 않습니다.',
    ],
  },
  {
    id: 3,
    sentences: [
      '당신의 언어를 고객의 언어로.',
      '당신의 가치를 고객 선택 이유로.',
      '당신의 감각을 고객이 이해하는 구조로.',
      '',
      '설명이 가능해지면 연결됩니다.',
    ],
  },
];
