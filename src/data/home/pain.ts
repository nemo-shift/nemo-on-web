export interface PainPoint {
  id: number;
  text: string;
  keywords: string[];
}

export const PAIN_POINTS: PainPoint[] = [
  {
    id: 1,
    text: '지금 돈 쓰는 게 맞나, 괜히 날릴까 불안해요',
    keywords: ['불안', '돈낭비', '망설임'],
  },
  {
    id: 2,
    text: '처음부터 제대로 하고 싶은데, 뭘 어떻게 시작해야 할지 막막해요',
    keywords: ['막막', '막연함', '방향상실'],
  },
  {
    id: 3,
    text: '일단 홈페이지만 있으면 매출이 생기겠죠?',
    keywords: ['착각', '기대', '허탈'],
  },
  {
    id: 4,
    text: '가격은 올리고 싶은데, 그만한 이유를 설명하기 어려워요',
    keywords: ['설명불가', '설득안됨', '답답함'],
  },
  {
    id: 5,
    text: '조금만 더 알아보자 하다가, 시간만 계속 지나가요',
    keywords: ['미룸', '무기력', '제자리'],
  },
];

export const RESONANCE_MESSAGE = {
  bridge: ['나는,', '당신은,', '우리는 지금 설명 가능한가요?'],
  // PC 전용 (긴 마퀴)
  marquee: {
    line1: '의미를 부여하면 의미가 되고, 의미가 있으면 선명해집니다.',
    line2: '선명해지면 설명이 가능해지고, 설명이 가능해지면 연결됩니다.'
  },
  // 터치 전용 (4단계 원-스크롤 원-센텐스 내러티브)
  slides: [
    { text: '의미를 부여하면 의미가 되고,' },
    { text: '의미가 있으면 선명해집니다.' },
    { text: '선명해지면 설명이 가능해지고,' },
    { text: '설명이 가능해지면 연결됩니다.' }
  ]
};

export const RESONANCE_SENTENCES = RESONANCE_MESSAGE.bridge;

export const CORE_MESSAGE_SENTENCES = [
  '의미를 부여하면 의미가 됩니다.',
  '의미가 있으면 선명해집니다.',
  '선명해지면 설명이 가능해지고,\n설명이 가능해지면 연결됩니다.',
];
