/**
 * [Data] Offerings 페이지 콘텐츠
 * docs/content/pages/3.Offerings.md 내용을 바탕으로 구성한 정형 데이터
 */

export interface OfferingKeyword {
  num: string;
  word: string;
  desc: string;
}

export interface OfferingCategory {
  title: string;
  description: string;
}

export interface OfferingData {
  hero: {
    keywords: OfferingKeyword[];
  };
  intro: {
    mainCopy: string;
    description: string;
    subDescription: string;
  };
  whatWeDo: {
    mainCopy: string;
    highlightCopy: string;
    description: string;
    studioDesc: string;
    labDesc: string;
  };
  studio: {
    id: string;
    title: string;
    subTitle: string;
    description: string;
    detailDescription: string;
    works: string[];
    link: string;
  };
  lab: {
    id: string;
    title: string;
    subTitle: string;
    description: string;
    detailDescription: string;
    link: string;
  };
  closing: {
    mainCopy: string;
    description: string;
  };
}

export const OFFERINGS_DATA: OfferingData = {
  hero: {
    keywords: [
      { num: '01', word: '담다', desc: '철학/분위기' },
      { num: '02', word: '닮다', desc: '구조감각' },
      { num: '03', word: 'ON', desc: '작동시키다' }
    ]
  },
  intro: {
    mainCopy: '브랜드를 설계하고,\n작동하게 만들고, 실험합니다.',
    description:
      '네모:ON은 브랜드를 하나의 결과물로 끝내지 않습니다.\n철학을 정리하고, 시각을 만들고, 디지털 구조로 연결하며,\n필요하다면 직접 실험하고 확장합니다.',
    subDescription:
      '네모:ON의 작업은 두 개의 축으로 나뉩니다.\n고객의 브랜드를 실제 비즈니스 구조로 구현하는 Studio,\n우리 스스로 브랜드가 되어 가능성을 실험하는 Lab.\n\n두 축의 역할은 다르지만, 움직이는 방식은 같습니다.'
  },
  whatWeDo: {
    mainCopy: '브랜드가 가진 고유한 결을 읽고, 명확한 언어로 설계합니다.\n그 본질을 디지털 경험으로 구현합니다.',
    highlightCopy: '담고, 닮고, 작동하다.',
    description:
      '즉, 브랜드의 철학과 분위기를 구조 안에 담아내고,\n차가운 디지털 코드가 그 감각을 닮아가도록 만듭니다.\n전하고 싶은 가치와 철학이 온라인 안에서 흐르고 연결되어 스스로 작동하도록 합니다.',
    studioDesc: 'Studio는 선명한 언어와 디지털 구조로 당신의 브랜드를 켭니다.',
    labDesc: 'Lab.은 새로운 도구와 실험으로 네모:ON의 가능성을 증명합니다.'
  },
  studio: {
    id: 'studio',
    title: '네모:ON Studio',
    subTitle: '브랜드를 보이게 하고, 이해되게 만드는 공간입니다.',
    description:
      '네모:ON Studio는 클라이언트의 브랜드 철학을 언어와 시각으로 정리하고, 웹사이트, 앱, 자동화 구조까지 연결하는 고객 의뢰형 브랜딩 스튜디오입니다.',
    detailDescription:
      '단순한 디자인이 아니라, 브랜드의 핵심 철학에서 시작해 실제 사용되는 디지털 구조까지 설계합니다.',
    works: ['브랜드 철학 설계', '디자인시스템 구축 & 로고', '웹사이트 구축', '자동화 마케팅 퍼널'],
    link: '/offerings/studio'
  },
  lab: {
    id: 'lab',
    title: '네모:ON Lab.',
    subTitle: '브랜드를 작동하게 만드는 실험실입니다.',
    description:
      '네모:ON Lab.은 외부 의뢰 없이 자체적으로 기획하고 만들고 실행하는 실험 기반 레이블입니다.',
    detailDescription:
      '우리는 브랜드를 설계하는 데서 끝나지 않고, 스스로 그 브랜드가 되어 도구와 서비스, 인터페이스와 콘텐츠를 통해 그 가능성이 현실에서 어떻게 움직일 수 있는지 실험합니다.',
    link: '/offerings/lab'
  },
  closing: {
    mainCopy: '보여지는 브랜드만으로는 충분하지 않습니다.\n작동하는 브랜드가 되어야 합니다.',
    description:
      '네모:ON은 Studio에서 브랜드를 구현하고,\nLab.에서 그 가능성을 계속 확장하고 실험합니다.'
  }
};
