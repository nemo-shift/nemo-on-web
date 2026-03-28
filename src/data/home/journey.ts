import { STAGES, COLORS } from '@/constants/interaction';

/**
 * [V4.4] 여정 통합 마스터 데이터 인터페이스
 * 모든 섹션의 시각적 상태(배경, 로고, 네모 상자)를 한 곳에서 정의합니다.
 */
export interface StageState {
  // 1. 환경 (배경색, 헤더색)
  env: {
    bg: string;
    fg: string;
  };
  // 2. 로고 가시성 및 상태
  logo: {
    nemoKr: boolean;
    shapes: boolean;
    status: boolean;
    rectangle: boolean;
    morph: 'T' | '+'; // T-Morphing 상태
    logoMode: 'hero' | 'nemo-only' | 'rectangle' | 'plus' | 'nemo-on'; // [v4.6] 서사 중심 식별자
    scale?: number;   
  };
  // 3. 네모 상자 상태 (SharedNemo)
  nemo: {
    width: string | number;
    height: string | number;
    borderRadius: number;
    backgroundColor: string;
    border: string;
    opacity: number;
    left: string;
    top: string;
  };
  // 4. ON 상태용 오버라이드 (히어로 섹션 전용)
  on?: Partial<Omit<StageState, 'on' | 'mobile'>>;
  // 5. 모바일/태블릿 전용 오버라이드
  mobile?: {
    env?: Partial<StageState['env']>;
    logo?: Partial<StageState['logo']>;
    nemo?: Partial<StageState['nemo']>;
  };
  tablet?: {
    env?: Partial<StageState['env']>;
    logo?: Partial<StageState['logo']>;
    nemo?: Partial<StageState['nemo']>;
  };
}

export const JOURNEY_MASTER_CONFIG: Record<string, StageState> = {
  // [1] 히어로 섹션 (네모:OFF/ON 스크램블)
  [STAGES.HERO]: {
    env: { bg: COLORS.BG.DARK_HERO, fg: COLORS.TEXT.LIGHT },
    on: { env: { bg: COLORS.BG.CREAM, fg: COLORS.TEXT.DARK } },
    logo: { nemoKr: true, shapes: true, status: true, rectangle: false, morph: 'T', logoMode: 'hero' },
    nemo: { width: 56, height: 56, borderRadius: 6, backgroundColor: 'transparent', border: 'none', opacity: 0, left: '50%', top: '50%' },
    mobile: {}
  },

  // [1.5] 페인 진입 (배경 확장 시점)
  [STAGES.START_TO_PAIN]: {
    env: { bg: COLORS.BG.DARK_SECTION, fg: COLORS.TEXT.LIGHT },
    logo: { nemoKr: true, shapes: false, status: false, rectangle: false, morph: 'T', logoMode: 'nemo-only' },
    nemo: { width: '100vw', height: '100vh', borderRadius: 0, backgroundColor: COLORS.BG.DARK_SECTION, border: '0px solid transparent', opacity: 1, left: '50%', top: '60%' }
  },

  // [2] 페인 진입/섹션 (안착된 '네모' 한글 텍스트)
  [STAGES.TO_PAIN]: {
    env: { bg: COLORS.BG.DARK_SECTION, fg: COLORS.TEXT.LIGHT },
    logo: { nemoKr: true, shapes: false, status: false, rectangle: false, morph: 'T', logoMode: 'nemo-only' },
    nemo: { width: '18vw', height: '48vh', borderRadius: 12, backgroundColor: 'transparent', border: `1.5px solid ${COLORS.TEXT.LIGHT}`, opacity: 1, left: '25%', top: '50%' },
    tablet: { nemo: { width: '30vw', height: '40vh', left: '35%' } },
    mobile: { nemo: { width: '70vw', height: '35vh', borderRadius: 12, backgroundColor: 'transparent', border: `1.5px solid ${COLORS.TEXT.LIGHT}`, opacity: 1, left: '45%', top: '50%' } }
  },

  // [2.5] 공명 지점 (중앙 채워진 박스)
  [STAGES.RESONANCE]: {
    env: { bg: COLORS.BG.DARK_SECTION, fg: COLORS.TEXT.LIGHT },
    logo: { nemoKr: true, shapes: false, status: false, rectangle: false, morph: 'T', logoMode: 'nemo-only' }, // 페인 상태 유지
    nemo: { width: '18vw', height: '48vh', borderRadius: 12, backgroundColor: COLORS.TEXT.LIGHT, border: 'none', opacity: 1, left: '50%', top: '50%' },
    mobile: { nemo: { width: '70vw', height: '35vh', borderRadius: 12, backgroundColor: COLORS.TEXT.LIGHT, border: 'none', opacity: 1, left: '50%', top: '50%' } }
  },

  // [3] 페인 → 메시지 (네모 → RECTANGLE 모핑 트리거 구간)
  [STAGES.PAIN_TO_MSG]: {
    env: { bg: COLORS.BG.DARK_SECTION, fg: COLORS.TEXT.LIGHT },
    logo: { nemoKr: false, shapes: false, status: false, rectangle: true, morph: 'T', logoMode: 'rectangle' }, // 전이 중에도 rectangle 상태 유지 권익
    nemo: { width: '18vw', height: '48vh', borderRadius: 12, backgroundColor: COLORS.TEXT.LIGHT, border: 'none', opacity: 1, left: '50%', top: '50%' }
  },

  // [4] 메시지 섹션 (RECTANGLE 완성 상태)
  [STAGES.TO_MESSAGE]: {
    env: { bg: COLORS.BG.CREAM, fg: COLORS.TEXT.DARK },
    logo: { nemoKr: false, shapes: false, status: false, rectangle: true, morph: 'T', logoMode: 'rectangle' },
    nemo: { width: '16vw', height: '62vh', borderRadius: 12, backgroundColor: COLORS.BRAND, border: 'none', opacity: 1, left: '50%', top: '50%' }
  },

  // [5] 메시지 → 포후 (T → + 모핑 트리거 구간)
  [STAGES.MSG_TO_FW]: {
    env: { bg: COLORS.BG.CREAM, fg: COLORS.TEXT.DARK },
    logo: { nemoKr: false, shapes: false, status: false, rectangle: true, morph: '+', logoMode: 'plus' },
    nemo: { width: '30vw', height: '55vh', borderRadius: 15, backgroundColor: COLORS.BRAND, border: 'none', opacity: 0.5, left: '50%', top: '50%' }
  },

  // [6] 포후 섹션 (REC+ANGLE 완성 상태)
  [STAGES.TO_FORWHO]: {
    env: { bg: COLORS.BG.CREAM, fg: COLORS.TEXT.DARK },
    logo: { nemoKr: false, shapes: false, status: false, rectangle: true, morph: '+', logoMode: 'plus' },
    nemo: { width: '72vw', height: '52vh', borderRadius: 18, backgroundColor: COLORS.TEXT.LIGHT, border: 'none', opacity: 1, left: '50%', top: '50%' }
  },

  // [7] 포후 → 브랜드스토리 (REC+ANGLE → 네모:ON 복귀 트리거)
  [STAGES.FW_TO_STORY]: {
    env: { bg: COLORS.BG.CREAM, fg: COLORS.TEXT.DARK },
    logo: { nemoKr: true, shapes: true, status: true, rectangle: false, morph: 'T', logoMode: 'nemo-on' },
    nemo: { width: '85vw', height: '60vh', borderRadius: 20, backgroundColor: COLORS.TEXT.LIGHT, border: 'none', opacity: 0.5, left: '50%', top: '50%' }
  },

  // [8] 브랜드 스토리 (네모:ON 최종 안착 상태)
  [STAGES.TO_STORY]: {
    env: { bg: COLORS.BG.CREAM, fg: COLORS.TEXT.DARK },
    logo: { nemoKr: true, shapes: true, status: true, rectangle: false, morph: 'T', logoMode: 'nemo-on' },
    nemo: { width: '72vw', height: '52vh', borderRadius: 18, backgroundColor: COLORS.TEXT.LIGHT, border: 'none', opacity: 1, left: '50%', top: '50%' }
  },

  // [9] CTA (다크 전환)
  [STAGES.TO_CTA]: {
    env: { bg: COLORS.BG.DARK_SECTION, fg: COLORS.TEXT.LIGHT },
    logo: { nemoKr: true, shapes: true, status: true, rectangle: false, morph: 'T', logoMode: 'nemo-on' },
    nemo: { width: '100vw', height: '100vh', borderRadius: 0, backgroundColor: COLORS.BG.DARK_SECTION, border: 'none', opacity: 0, left: '50%', top: '50%' }
  }
};
