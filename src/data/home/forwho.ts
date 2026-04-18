export interface ForWhoItem {
  id: number;
  target: string;        // 타겟명 (예비창업가)
  flow: string;          // 전환 (아이디어 → 브랜드)
  description: string;   // 설명
  philosophy: string;    // 관계 철학
  image: {
    src: string;         // 이미지 경로
    alt: string;
    objectPosition: string; // 인물 위치 기준 (예: 'left top')
  };
}

export const FOR_WHO_TOP_SENTENCE = '새로운 가능성을 가장 선명한 브랜드로 일구는 당신에게';

export const FOR_WHO_LIST: ForWhoItem[] = [
  {
    id: 1,
    target: '예비창업가',
    flow: '아이디어 → 브랜드',
    description: '아이디어는 있지만, 어떻게 해야할지 막막한 분',
    philosophy: '첫 브랜딩 경험을 함께 만들어가는 멘토',
    image: {
      src: '/images/home/forwho/target1.png',
      alt: '예비창업가 이미지',
      objectPosition: 'left top',
    },
  },
  {
    id: 2,
    target: '성장모색 대표님',
    flow: '오프라인 → 온라인',
    description: '기존 브랜드를 디지털 환경에 맞게 전환하고 싶은 대표님',
    philosophy: '기존 가치를 디지털에서 재발견하는 파트너',
    image: {
      src: '/images/home/forwho/target2.jpg',
      alt: '성장모색 대표님 이미지',
      objectPosition: 'left bottom',
    },
  },
  {
    id: 3,
    target: '확장을 준비하는 대표님',
    flow: '브랜드 → 시스템',
    description: '리뉴얼과 자동화로, 더 잘 작동하는 브랜드를 만들고 싶은 대표님',
    philosophy: '브랜드를 확장 가능한 구조로 설계하는 파트너',
    image: {
      src: '/images/home/forwho/target3.jpg',
      alt: '확장을 준비하는 대표님 이미지',
      objectPosition: 'right bottom',
    },
  },
  {
    id: 4,
    target: '개인브랜드 & 전문가',
    flow: '전문성 → 브랜드',
    description: '자신만의 철학과 전문성을 온라인에서 차별화된 존재감으로 만들고 싶은 대표님',
    philosophy: '개인의 철학과 전문성을 세상에 알리는 조력자',
    image: {
      src: '/images/home/forwho/target4.jpg',
      alt: '개인브랜드 전문가 이미지',
      objectPosition: 'center',
    },
  },
  {
    id: 5,
    target: '스타트업',
    flow: 'MVP → 브랜드',
    description: '투자자와 고객 모두에게 설명과 확장이 가능한 브랜드 구조가 필요한 팀',
    philosophy: '빠르게 검증하고 단단하게 쌓아가는 빌더',
    image: {
      src: '/images/home/forwho/target5.jpg',
      alt: '스타트업 이미지',
      objectPosition: 'left center',
    },
  },
];
