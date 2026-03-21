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
    scale?: number;   // 히어로 등에서의 특수 스케일 (없으면 기본 HEADER_SCALE)
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
  // 5. 모바일 전용 오버라이드 (필요한 경우에만 정의)
  mobile?: Partial<Omit<StageState, 'mobile'>>;
}

export const JOURNEY_MASTER_CONFIG: Record<string, StageState> = {
  // [1] 히어로 섹션 (초기 상태)
  [STAGES.HERO]: {
    env: { bg: COLORS.BG.DARK_HERO, fg: COLORS.TEXT.LIGHT },
    on: {
      env: { bg: COLORS.BG.CREAM, fg: COLORS.TEXT.DARK },
    },
    logo: { nemoKr: true, shapes: true, status: true, rectangle: false, morph: 'T' },
    nemo: { width: 56, height: 56, borderRadius: 6, backgroundColor: 'transparent', border: 'none', opacity: 0, left: '50%', top: '50%' },
    mobile: {
      // 배경색은 isOn 상태에 의존하므로 여기서는 생략하여 유연성 확보
    }
  },

  // [2] 페인 진입 (배경 확장 시점) - 내려오는 느낌을 위해 Top을 60%로 상향
  [STAGES.START_TO_PAIN]: {
    env: { bg: COLORS.BG.DARK_SECTION, fg: COLORS.TEXT.LIGHT },
    logo: { nemoKr: true, shapes: false, status: false, rectangle: false, morph: 'T' },
    nemo: { width: '100vw', height: '100vh', borderRadius: 0, backgroundColor: COLORS.BG.DARK_SECTION, border: '0px solid transparent', opacity: 1, left: '50%', top: '60%' }
  },

  // [3] 페인 안착 (테두리 박스 수축 완료)
  [STAGES.TO_PAIN]: {
    env: { bg: COLORS.BG.DARK_SECTION, fg: COLORS.TEXT.LIGHT },
    logo: { nemoKr: true, shapes: false, status: false, rectangle: false, morph: 'T' },
    nemo: { width: '18vw', height: '48vh', borderRadius: 12, backgroundColor: 'transparent', border: `1.5px solid ${COLORS.TEXT.LIGHT}`, opacity: 1, left: '75%', top: '50%' },
    mobile: {
      nemo: { width: '70vw', height: '35vh', borderRadius: 12, backgroundColor: 'transparent', border: `1.5px solid ${COLORS.TEXT.LIGHT}`, opacity: 1, left: '50%', top: '50%' }
    }
  },

  // [4] 공명 지점 (중앙 채워진 박스 + RECTANGLE 등장)
  [STAGES.RESONANCE]: {
    env: { bg: COLORS.BG.DARK_SECTION, fg: COLORS.TEXT.LIGHT },
    logo: { nemoKr: false, shapes: false, status: false, rectangle: true, morph: 'T' },
    nemo: { width: '18vw', height: '48vh', borderRadius: 12, backgroundColor: COLORS.TEXT.LIGHT, border: 'none', opacity: 1, left: '50%', top: '50%' },
    mobile: {
      nemo: { width: '70vw', height: '35vh', borderRadius: 12, backgroundColor: COLORS.TEXT.LIGHT, border: 'none', opacity: 1, left: '50%', top: '50%' }
    }
  },

  // [5] 메시지 섹션 (크림 배경 + T->+ 모핑 완료 + 틸 세로 박스)
  [STAGES.TO_MESSAGE]: {
    env: { bg: COLORS.BG.CREAM, fg: COLORS.TEXT.DARK },
    logo: { nemoKr: false, shapes: false, status: false, rectangle: true, morph: '+' },
    nemo: { width: '16vw', height: '62vh', borderRadius: 12, backgroundColor: COLORS.BRAND, border: 'none', opacity: 1, left: '50%', top: '50%' },
    mobile: {
      nemo: { width: '55vw', height: '45vh', borderRadius: 12, backgroundColor: COLORS.BRAND, border: 'none', opacity: 1, left: '50%', top: '50%' }
    }
  },

  // [6] 포후 섹션 (가로 이미지 프레임 + 로고 복구)
  [STAGES.TO_FORWHO]: {
    env: { bg: COLORS.BG.CREAM, fg: COLORS.TEXT.DARK },
    logo: { nemoKr: true, shapes: true, status: true, rectangle: false, morph: 'T' },
    nemo: { width: '72vw', height: '52vh', borderRadius: 18, backgroundColor: COLORS.TEXT.LIGHT, border: 'none', opacity: 1, left: '50%', top: '50%' },
    mobile: {
      nemo: { width: '85vw', height: '30vh', borderRadius: 18, backgroundColor: COLORS.TEXT.LIGHT, border: 'none', opacity: 1, left: '50%', top: '50%' }
    }
  },

  // [7] 브랜드 스토리 (동일 유지)
  [STAGES.TO_STORY]: {
    env: { bg: COLORS.BG.CREAM, fg: COLORS.TEXT.DARK },
    logo: { nemoKr: true, shapes: true, status: true, rectangle: false, morph: 'T' },
    nemo: { width: '72vw', height: '52vh', borderRadius: 18, backgroundColor: COLORS.TEXT.LIGHT, border: 'none', opacity: 1, left: '50%', top: '50%' }
  },

  // [8] CTA (다크 전환)
  [STAGES.TO_CTA]: {
    env: { bg: COLORS.BG.DARK_SECTION, fg: COLORS.TEXT.LIGHT },
    logo: { nemoKr: true, shapes: true, status: true, rectangle: false, morph: 'T' },
    nemo: { width: '100vw', height: '100vh', borderRadius: 0, backgroundColor: COLORS.BG.DARK_SECTION, border: 'none', opacity: 0, left: '50%', top: '50%' }
  }
};
