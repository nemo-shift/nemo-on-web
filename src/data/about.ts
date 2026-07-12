/**
 * 네모:ON About 페이지 전용 데이터 명세서
 * @see docs/strategy/about-spec.md
 */

// 1. 히어로 섹션 데이터
export const ABOUT_HERO_DATA = {
  title: 'About',
  keywords: [
    { id: 'record', text: '기록', sub: 'Record' },
    { id: 'angle', text: '관점', sub: 'Angle' },
    { id: 'plus', text: '+', sub: '연결/확장' },
    { id: 'on', text: 'ON', sub: '브랜드를 켜다, nemo:on' }
  ]
};

// 2. 섹션 1: WHY WE EXIST (Philosophy)
export const ABOUT_PHILOSOPHY_DATA = {
  bgTitle: 'WHY WE EXIST',
  phase1: [
    "감성 없는 구조는 시들고,\n구조 없는 감성은 흩어집니다.",
    "감성과 구조의 균형 위에서\n브랜드를\n**선명하게,**\n**이해되게,**\n**작동하게.**"
  ],
  phase2: [
    "감성만 있는 브랜드는 예쁘지만 신뢰가 쌓이지 않습니다.\n구조만 있는 브랜드는 작동하지만 마음에 오래 남지 않습니다.",
    "브랜드의 철학이 언어로 정리되지 않으면\n메시지는 흐려지고,\n시각은 흔들리고,\n고객은 기억하지 못합니다.",
    "브랜드가 스스로를 설명할 수 있을 때\n더 오래 이해되고 연결된다고 믿습니다.",
    "nemo:on 은 의미를 켜서, 구조가 작동하게 만드는 브랜드입니다."
  ]
};

// 3. 섹션 2: The Architecture of Name (Meaning)
export const ABOUT_MEANING_DATA = {
  phase1: [
    "nemo:on 은 사각형을 뜻하는 Rectangle에서 시작된 이름입니다.",
    "사각형은 가장 단순하면서도 명확하고 안정적인 형태입니다.\n무언가를 담고, 정리하고, 구조화하는 기본 프레임이기도 합니다.\nnemo:on 역시 이런 구조 위에서 시작되어야 한다고 생각했습니다."
  ],
  phase2Intro: "Rectangle은 Rec + Angle로 다시 읽힙니다.",
  phase2Triad: [
    { label: 'Rec', desc: '기록' },
    { label: 'Angle', desc: '관점' },
    { label: '+', desc: '연결과 확장' },
  ],
  phase2Outro: [
    "대상의 본질을 기록하고,\n고유한 관점으로 해석하여,\n명확한 브랜드 구조로 확장합니다.",
    "ON, 스위치를 켭니다.\n현실에서 작동하는 브랜드, nemo:on 입니다."
  ],
};

// 4. 섹션 2.5: Founder's Note (Philosophy와 Meaning 사이 자유 스크롤)
export const ABOUT_FOUNDERS_NOTE_DATA = {
  label: '02 / FOUNDER\'S NOTE',
  lines: [
    '좋은 점은 장점이고,\n포기할 수 없는 점은 매력입니다.',
    '장점은 합리적인 선택을 돕지만,\n결국 계속 머물게 하는 것은\n다시 마음을 흔들어 흔적을 남기는 단 하나의 매력입니다.',
    '결정을 만드는 것도 앎의 깊이가 아니라\n믿음의 온도라고 생각합니다.',
    '설명 가능한 구조를 만드는 이유는,\n설명되지 않는 그 매력이\n제대로 일하게 하기 위해서입니다.',
  ],
  signatureEmphasis: '의미를 구조화하는 사람이고 싶습니다.',
  signature: '— 안단테',
};

// 5. 섹션 3.5: Principles (Meaning과 Promise 사이 자유 스크롤)
export const ABOUT_PRINCIPLES_DATA = {
  label: '04 / WHAT WE DON\'T DO',
  items: [
    '고객 안에 없는 불안을 만들어내지 않습니다.',
    '확인되지 않은 손실과 과장된 공포로 결정을 몰아가지 않습니다.',
    '설명하기 어려운 기능과 장식을 쌓지 않습니다.',
    '고객의 결을 지우고 유행의 공식을 강요하지 않습니다.',
    '고객이 스스로 판단하지 못하게 만들지 않습니다.',
  ],
};

// 6. 섹션 4: What We Turn ON (Promise)
export const ABOUT_PROMISE_DATA = {
  phase1: [
    "nemo:on 이 만드는 변화는 거창하지 않습니다.\n하지만 분명합니다.",
    '흐릿함은 **선명함**으로,\n감각은 **설명 가능함**으로,\n아이디어는 **작동하는 구조**로,\n\u201c해볼까\u201d라는 망설임은 실행의 상태로 바뀝니다.'
  ],
  phase2: [
    "보여지는 브랜드만으로는 충분하지 않습니다.\n작동하는 브랜드가 되어야 합니다.",
    "의미를 부여하면 의미가 됩니다.\n__**의미를 켜서, 구조가 작동하도록.**__\nnemo:on 입니다."
  ]
};
