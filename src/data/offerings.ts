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

export interface ProcessStep {
  no: string;
  name: string;
  purpose: string;
  output: string;
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
    works: string[];
  };
  lab: {
    id: string;
    title: string;
    subTitle: string;
    description: string;
    detailDescription: string;
    experiments: string[];
  };
  process: {
    empathyList: string[];
    transition: string;
    steps: ProcessStep[];
    closing: string;
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
      'nemo:on 은 브랜드를 하나의 결과물로 끝내지 않습니다.\n철학을 정리하고, 시각을 만들고, 디지털 구조로 연결하며,\n필요하다면 직접 실험하고 확장합니다.',
    subDescription:
      'nemo:on 의 작업은 두 개의 축으로 나뉩니다.\n고객의 브랜드를 실제 비즈니스 구조로 구현하는 Studio,\n우리 스스로 브랜드가 되어 가능성을 실험하는 Lab.\n\n두 축의 역할은 다르지만, 움직이는 방식은 같습니다.'
  },
  whatWeDo: {
    mainCopy: '브랜드가 가진 고유한 결을 읽고, 명확한 언어로 설계합니다.\n그 본질을 디지털 경험으로 구현합니다.',
    highlightCopy: '담고, 닮고, 작동하다.',
    description:
      '즉, 브랜드의 철학과 분위기를 구조 안에 담아내고,\n차가운 디지털 코드가 그 감각을 닮아가도록 만듭니다.\n전하고 싶은 가치와 철학이 온라인 안에서 흐르고 연결되어 스스로 작동하도록 합니다.',
    studioDesc: 'Studio는 선명한 언어와 디지털 구조로 당신의 브랜드를 켭니다.',
    labDesc: 'Lab.은 새로운 도구와 실험으로 nemo:on 의 가능성을 증명합니다.'
  },
  studio: {
    id: 'studio',
    title: 'nemo:on Studio',
    subTitle: '브랜드를 보이게 하고, 이해되게 만드는 공간입니다.',
    description:
      'nemo:on Studio는 클라이언트의 브랜드 철학을 언어와 시각으로 정리하고, 웹사이트, 앱, 자동화 구조까지 연결하는 고객 의뢰형 브랜딩 스튜디오입니다.',
    works: [
      '브랜드 기준 확립',
      '로고',
      '브랜드스토리 설계',
      '사업 맞춤 반응형 웹 구축',
      '자동화 마케팅 퍼널',
      '문의 운영 구조',
      'SEO 및 배포 세팅',
      'AI 검색 최적화 (AEO·GEO)',
    ],
  },
  lab: {
    id: 'lab',
    title: 'nemo:on Lab.',
    subTitle: '브랜드를 작동하게 만드는 실험실입니다.',
    description:
      'nemo:on Lab.은 외부 의뢰 없이 자체적으로 기획하고 만들고 실행하는 실험 기반 레이블입니다.',
    detailDescription:
      '우리는 설계에서 끝나지 않고, 스스로 그 브랜드가 되어 가능성을 실험합니다.',
    experiments: [
      '이 웹사이트 자체',
      '브랜드 진단 도구',
      'AI 활용 워크플로우',
      '자동화 콘텐츠 시스템',
    ],
  },
  process: {
    empathyList: [
      '로고가 필요해요.',
      '홈페이지를 만들고 싶어요.',
      '브랜드가 약해 보여요.',
      '콘텐츠를 해도 우리다운 느낌이 없어요.',
      '온라인에서 제대로 보이고 싶어요.',
    ],
    transition:
      '로고, 홈페이지, 콘텐츠, 디자인 —\n따로 보이지만 사실 하나의 흐름 안에 있습니다.\n그 흐름을 다음 여덟 단계로 설계합니다.',
    steps: [
      { no: '00', name: '온보딩', purpose: '목표·역할·일정 합의', output: '프로젝트 브리프' },
      { no: '01', name: '발견', purpose: '대표·사업·고객·시장 이해', output: '발견 노트' },
      { no: '02', name: '기준 설계', purpose: '철학·포지셔닝·약속·우선순위 정리', output: 'Brand Core' },
      { no: '03', name: '언어 설계', purpose: '핵심 문장·스토리·카피 방향', output: 'Message System' },
      { no: '04', name: '시각 설계', purpose: '로고·컬러·타입·디자인 원칙', output: 'Visual System' },
      { no: '05', name: '웹 설계', purpose: '정보 구조·섹션·전환 흐름·기능', output: 'Web Blueprint' },
      { no: '06', name: '구현', purpose: '디자인·개발·테스트', output: 'Launch-ready Website' },
      { no: '07', name: '전환', purpose: '운영 기준 전달', output: 'Brand Operation Guide' },
    ],
    closing:
      '사업의 기준을 설계하는 데서 시작해 웹으로 구현되기까지 — 결과물이 아니라, 새로운 선택 앞에서도 스스로 판단할 수 있는 사업을 얻는 과정입니다.',
  },
  closing: {
    mainCopy: '보여지는 브랜드만으로는 충분하지 않습니다.\n작동하는 브랜드가 되어야 합니다.',
    description:
      'nemo:on 은 Studio에서 브랜드를 구현하고,\nLab.에서 그 가능성을 계속 확장하고 실험합니다.'
  }
};
