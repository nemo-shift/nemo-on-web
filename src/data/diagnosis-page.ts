/**
 * [Data] 브랜드 진단 페이지 콘텐츠 (Diagnosis Page)
 * docs/content/pages/4.Brand Diagnosis.md 내용을 완전 데이터화
 */

export interface DiagnosisQuestion {
  id: string; // Q1, Q2 등
  question: string;
  type: 'single' | 'multiple';
  options: string[];
  maxSelect?: number; // 다중 선택 시 제한 개수
}

export interface DiagnosisResultType {
  title: string;
  description: string;
  directions: string[];
}

// 7개 질문 정의
export const DIAGNOSIS_QUESTIONS: DiagnosisQuestion[] = [
  {
    id: 'Q1',
    question: '어떤 분야의 비즈니스인가요?',
    type: 'single',
    options: [
      '테크/IT',
      '헬스케어',
      '교육',
      '리테일/이커머스',
      '음식/F&B',
      '패션/뷰티',
      '부동산',
      '금융',
      '기타'
    ]
  },
  {
    id: 'Q2',
    question: '당신의 브랜드는 어떤 느낌으로 기억되길 바라나요?',
    type: 'multiple',
    maxSelect: 3,
    options: [
      '신뢰할 수 있는',
      '혁신적인',
      '친근한',
      '전문적인',
      '럭셔리한',
      '심플한',
      '역동적인',
      '안정적인'
    ]
  },
  {
    id: 'Q3',
    question: '당신의 브랜드와 가장 잘 어울리는 색상 계열은 무엇인가요?',
    type: 'single',
    options: [
      '블루 계열 (신뢰, 안정)',
      '그린 계열 (자연, 성장)',
      '레드 계열 (열정, 에너지)',
      '오렌지 계열 (활동, 따뜻함)',
      '퍼플 계열 (프리미엄, 창의)',
      '블랙/그레이 계열 (모던, 심플)',
      '기타/잘 모르겠음'
    ]
  },
  {
    id: 'Q4',
    question: '지금 당신의 브랜드는 어느 단계에 있나요?',
    type: 'single', // 이 선택지에 따라 결과 유형 결정
    options: [
      '브랜드가 전혀 없음',
      '로고만 있음',
      '기본적인 아이덴티티 있음',
      '어느 정도 완성되었지만 개선 필요',
      '완성도 높지만 차별화 필요'
    ]
  },
  {
    id: 'Q5',
    question: '가장 큰 고민은 무엇인가요?',
    type: 'multiple',
    maxSelect: 3,
    options: [
      '브랜드 정체성이 불분명함',
      '경쟁사와 차별화 어려움',
      '타겟 고객에게 어필하지 못함',
      '일관성 있는 브랜드 경험 부족',
      '온라인에서의 브랜드 인지도 부족',
      '브랜딩 예산 대비 효과 미흡'
    ]
  },
  {
    id: 'Q6',
    question: '지금 고객들은 당신의 브랜드를 어떻게 받아들이고 있나요?',
    type: 'single',
    options: [
      '아직 시작 전이에요',
      '브랜드를 잘 기억하지 못함',
      '비슷한 경쟁사와 헷갈려함',
      '서비스는 좋다고 하지만 브랜드 임팩트 부족',
      '일부는 좋아하지만 일관성이 없음',
      '대체로 긍정적이지만 더 강한 인상 필요'
    ]
  },
  {
    id: 'Q7',
    question: '이 문제를 해결하는 데 쓸 수 있는 여유는 어느 정도인가요?',
    type: 'single',
    options: [
      '당장 시작할 준비가 되어있다',
      '3개월 안에 움직일 수 있다',
      '방향만 잡히면 바로 실행 가능하다',
      '아직 탐색 중이다',
      '솔직히 지쳐있다. 그래도 뭔가 바꾸고 싶다'
    ]
  }
];

// Q4 선택값에 따라 매핑할 결과 데이터
export const DIAGNOSIS_RESULTS: Record<'newborn' | 'growing' | 'mature', DiagnosisResultType> = {
  newborn: {
    title: '신생 브랜드형',
    description: '기본기부터 차근차근 쌓아올려야 하는 단계입니다.',
    directions: [
      '브랜드 아이덴티티 구축이 최우선',
      '명확한 타겟 고객 정의 필요',
      '핵심 메시지 개발 집중',
      '일관성 있는 비주얼 시스템 구축'
    ]
  },
  growing: {
    title: '성장 브랜드형',
    description: '기본은 갖췄지만 차별화와 강화가 필요한 단계입니다.',
    directions: [
      '브랜드 포지셔닝 명확화',
      '경쟁사 대비 차별화 전략',
      '브랜드 경험 일관성 강화',
      '디지털 브랜딩 확장'
    ]
  },
  mature: {
    title: '완성 브랜드형',
    description: '기본기는 탄탄하지만 혁신과 진화가 필요한 단계입니다.',
    directions: [
      '브랜드 리뉴얼 또는 리포지셔닝',
      '새로운 시장/고객층 공략',
      '브랜드 확장 전략',
      'AI 활용 브랜딩 자동화'
    ]
  }
};
