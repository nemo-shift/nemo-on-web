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
    { id: 'on', text: 'ON', sub: '브랜드를 켜다, 네모:ON' }
  ]
};

// 2. 섹션 1: Who We Are (Philosophy)
export const ABOUT_PHILOSOPHY_DATA = {
  bgTitle: 'Who We Are',
  paragraphs: [
    "감성과 구조의 균형 위에서\n브랜드를\n선명하게,\n이해되게,\n작동하게.",
    "감성만 있는 브랜드는 예쁘지만 신뢰가 쌓이지 않습니다.\n구조만 있는 브랜드는 작동하지만 마음에 오래 남지 않습니다.",
    "브랜드의 철학이 언어로 정리되지 않으면\n메시지는 흐려지고,\n시각은 흔들리고,\n고객은 기억하지 못합니다.",
    "브랜드가 스스로를 설명할 수 있을 때\n더 오래 이해되고 연결된다고 믿습니다.",
    "네모:ON은 의미를 켜서, 구조가 작동하게 만드는 브랜드입니다."
  ]
};

// 3. 섹션 2: The Architecture of Name (Meaning)
export const ABOUT_MEANING_DATA = {
  bgTitle: 'The Architecture of Name',
  paragraphs: [
    "**네모:ON**은 사각형을 뜻하는 **Rectangle**에서 시작된 이름입니다.",
    "사각형은 가장 단순하면서도 명확하고 안정적인 형태입니다.\n무언가를 담고, 정리하고, 구조화하는 기본 프레임이기도 합니다.\n네모:ON 역시 이런 구조 위에서 시작되어야 한다고 생각했습니다.",
    "Rectangle은 **Rec + Angle**로 다시 읽힙니다.",
    "**Rec**: 기록\n**Angle**: 관점\n**+**: 연결과 확장",
    "대상의 본질을 기록하고,\n고유한 관점으로 해석하여,\n명확한 브랜드 구조로 확장합니다.",
    "ON, 스위치를 켭니다.\n현실에서 작동하는 브랜드, 네모:ON 입니다."
  ]
};

// 4. 섹션 3: What We Turn ON (Promise)
export const ABOUT_PROMISE_DATA = {
  bgTitle: 'What We Turn ON',
  paragraphs: [
    "네모:ON이 만드는 변화는 거창하지 않습니다.\n하지만 분명합니다.",
    "흐릿함은 선명함으로,\n감각은 설명 가능함으로,\n아이디어는 작동하는 구조로,\n“해볼까”라는 망설임은 실행의 상태로 바뀝니다.",
    "보여지는 브랜드만으로는 충분하지 않습니다.\n작동하는 브랜드가 되어야 합니다.",
    "의미를 부여하면 의미가 됩니다.\n의미를 켜서, 구조가 작동하도록.\n네모:ON입니다."
  ]
};
