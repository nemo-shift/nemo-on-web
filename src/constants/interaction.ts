/**
 * [Config] 네모:ON 전역 인터랙션 마스터 설정 (v3.0)
 * 
 * 모든 인터랙션은 '상대적 레이블'과 '가중치'를 기반으로 작동한다.
 * 수치를 직접 수정하기보다, 가중치(WEIGHT)를 통해 감도를 조율한다.
 */

// ─────────────────────────────────────────────
// 1. Z-index 레이어 계층 (Global 스택 준수)
// ─────────────────────────────────────────────
// ─────────────────────────────────────────────
// 1. Z-index 레이어 계층 (V4.0 Integrity Standard)
// ─────────────────────────────────────────────
export const INTERACTION_Z_INDEX = {
  JOURNEY_LOGO: 10001, // 브랜드 정체성 (항상 최상위)
  CONTENT_LAYER: 20,   // 섹션 콘텐츠 (상자보다 위에 위치하여 가독성 확보)
  SHARED_NEMO: 11,     // 배경 위, 콘텐츠 아래
  SCROLL_HINT: 1000, 
  BACKGROUND: 0,
};

// ─────────────────────────────────────────────
// 2. 브랜드 컬러 팔레트
// ─────────────────────────────────────────────
export const COLORS = {
  BRAND: '#0891b2',
  ACCENT: '#E8734A',
  BG_DARK: '#0a0a0a',
  BG_SECTION_DARK: '#0D1A1F',
  BG_CREAM: '#faf7f2',
  BG_CREAM_ALT: '#f7f1e9',
  TEXT_LIGHT: '#f0ebe3',
  TEXT_DARK: '#0d1a1f',
};

// ─────────────────────────────────────────────
// 3. 인터랙션 시퀀스 레이블 (Logical Stages)
// ─────────────────────────────────────────────
export const STAGES = {
  HERO: 'hero',
  START_TO_PAIN: 'start_to_pain',
  TO_PAIN: 'to_pain',
  PAIN_CONTENT: 'pain_content',
  PAIN_SHIFT: 'pain_shift',
  RESONANCE: 'resonance',
  TO_MESSAGE: 'to_msg',
  MSG_CONTENT: 'msg_content',
  TO_FORWHO: 'to_fw',
  FW_CONTENT: 'fw_content',
  TO_STORY: 'to_story',
  STORY_CONTENT: 'story_content',
  TO_CTA: 'to_cta',
  CTA_CONTENT: 'cta_content',
} as const;

// ─────────────────────────────────────────────
// 4. 감도 및 가중치 설정 (V4.0 Tuning)
// ─────────────────────────────────────────────
export const TIMING_CFG = {
  // 전이 과정의 시각적 호흡 (낮을수록 급격함)
  TRANSITION_WEIGHT: 0.4, 
  
  // 섹션별 정지(Stillness) 가중치 - 스크롤 호흡 결정
  SECTION_WEIGHT: {
    HERO_STILL: 2.0,      // 초기 진입 시 로고 위용 감상 구간
    PAIN_STILL: 6.0,      // 5개 포인트 순차 노출 (길게)
    RESONANCE_STILL: 2.0, // 공명 문장 집중
    MESSAGE_STILL: 4.0,   // 핵심 카운트 관통
    FOR_WHO_STILL: 4.0,   // 타겟 리스트
    STORY_STILL: 3.0,     // 브랜드 스토리
    CTA_STILL: 2.0,       // CTA 진입 전 호흡
  },

  SCRUB: 1.0, 
  EASE_TRANS: 'power2.inOut',
  EASE_STILL: 'none',
};

// ─────────────────────────────────────────────
// 5. 시각 수치 (Visual Units)
// ─────────────────────────────────────────────
export const LOGO_SIZE = {
  BIG_SCALE: 5,
  BIG_SCALE_MOBILE: 2.8,
  HEADER_SCALE: 1,
};

export const NEMO_SIZE = {
  INITIAL_W: 56,
  INITIAL_H: 56,
  INITIAL_BORDER_RADIUS: 6,
  
  // 페인 섹션 테두리 박스
  BORDER_BOX_W: '18vw',
  BORDER_BOX_H: '48vh',
  
  // 메시지 세로 틸 박스
  TEAL_BOX_W: '16vw',
  TEAL_BOX_H: '62vh',
  
  // 포후 가로 이미지 프레임
  IMAGE_W: '72vw',
  IMAGE_H: '52vh',
};
