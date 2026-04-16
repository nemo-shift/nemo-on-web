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
// 1. Z-index 레이어 계층 (V17 Standard Tiering)
// ─────────────────────────────────────────────
export const INTERACTION_Z_INDEX = {
  // [계층 6] 마우스 커서 (Celestial Layer - Body Portal)
  Z_CURSOR_POINT: 99999,
  Z_CURSOR_RING: 99998,

  // [계층 5] 시스템 및 메뉴 (System Layer)
  Z_SYSTEM_WIPE: 1100,
  Z_MENU_TRIGGER: 1050, 
  Z_MENU_DRAWER: 1000, 

  // [계층 4] 브랜드 무대 (Brand Stage)
  Z_JOURNEY_LOGO: 850, // Body Portal
  Z_HEADER: 800,

  // [계층 3] 가이드 및 UI (Guide Layer)
  Z_UI_GUIDE: 500, // BottomBar, Scroll Hint 등

  // [계층 2] 콘텐츠 및 인터랙션 (Content Layer)
  Z_CONTENT: 100,      // 메인 섹션 덮개
  Z_STAGE_WRAPPER: 50,  // GlobalInteractionStage 부모 (네모가 본문 뒤, 배경 위에 위치)
  Z_SHARED_NEMO: 1,    // Stage 내부 상대 서열
  Z_KEYWORDS: 0,       // Stage 내부 상대 서열
  Z_FOOTER_UNDER: 10,  // Reveal Footer (Underneath content)

  // [계층 1] 배경 (Base Layer)
  Z_BASE_BG: 0,
  Z_BEHIND_BG: -1,
} as const;

// ─────────────────────────────────────────────
// 1.5. 물리 인터랙션 수칙 (V16 Layout Specs)
// ─────────────────────────────────────────────
export const LAYOUT_SPEC = {
  LOGO: {
    EJECT_Y: 150,         // 상승 퇴장 거리
    MORPH_BLUR: 15,       // 모핑 블러 px
    MORPH_SCALE: 1.15,     // 모핑 팽창률
    RECT_LETTER_GAP: 1.2, // RECT 등장 시 자간
  }
} as const;


// ─────────────────────────────────────────────
// 2. 브랜드 컬러 팔레트 (V4.3 Integrity: colors.ts와 동기화)
// ─────────────────────────────────────────────
import { COLORS } from './colors';
export { COLORS };

// ─────────────────────────────────────────────
// 3. 인터랙션 시퀀스 레이블 (Logical Stages)
// ─────────────────────────────────────────────
export const STAGES = {
  HERO: 'hero',
  HERO_STILL_START: 'hero_still_start',
  HERO_STILL_LOGO_EJECT: 'hero_still_logo_eject',
  HERO_STILL_CONTENT_RISE: 'hero_still_content_rise',
  HERO_STILL_NEMO_REVEAL: 'hero_still_nemo_reveal',
  HERO_STILL_END: 'hero_still_end',
  START_TO_PAIN: 'start_to_pain',
  TO_PAIN: 'to_pain',
  PAIN_CONTENT: 'pain_content',
  PAIN_SHIFT: 'pain_shift',
  RESONANCE: 'resonance',
  PAIN_TO_MSG: 'pain_to_msg',
  TO_MESSAGE: 'to_msg',
  MSG_CONTENT: 'msg_content',
  MSG_TO_FW: 'msg_to_fw',
  TO_FORWHO: 'to_fw',
  FW_CONTENT: 'fw_content',
  FW_TO_STORY: 'fw_to_story',
  TO_STORY: 'to_story',
  STORY_CONTENT: 'story_content',
  TO_CTA: 'to_cta',
  CTA_CONTENT: 'cta_content',
  TO_FOOTER: 'to_footer',
} as const;

// ─────────────────────────────────────────────
// 3.5. [V4.5] 헤더 위치 및 인터랙션 수치
// ─────────────────────────────────────────────
export const HEADER_POS = {
  PC:  { x: 3.333, y: 2 }, // vw (상단 아이콘 라인 2.5vw와의 시각적 균형을 위해 2vw로 상향)
  TABLET: { x: 4.8, y: 3.5 },   // vw (at 1000px -> x:48, y:48)
  MOBILE: { x: 24, y: 15 },     // px (Fixed)
};

export const EASE = {
  TRANSITION: 'power3.inOut',
  FADE: 'power2.in',
  SETTLE: 'power2.inOut',
  BOUNCE: 'back.out(1.2)',
};

// 섹션 스크롤 높이 (buildSectionScrollTimeline 전용)
export const SECTION_SCROLL_HEIGHT = {
  HERO:    100,   // vh (물리적 높이와 동기화하여 가이드라인 정밀도 확보)
  PAIN:    1000,
  MESSAGE: 800,
  FORWHO:  1000,
  STORY:   100,
  CTA:     100,
  FOOTER:  75,     // 뷰포트의 75% (3/4) 노출
};

// ─────────────────────────────────────────────
// 4. 감도 및 가중치 설정 (V4.1 Tuning - Logic Refined)
// ─────────────────────────────────────────────
export const TIMING_CFG = {
  // 전이 과정의 시각적 호흡 (낮을수록 급격함)
  TRANSITION_WEIGHT: 0.4, 
  
  // 전이 완료 비율 (90% 지점에서 선제적 완결)
  TRANSITION_FINISH_RATIO: 0.9, 
  
  // 섹션별 정지(Stillness) 가중치 - 스크롤 호흡 결정
  SECTION_WEIGHT: {
    HERO_STILL: 2.0,      // 초기 진입 시 로고 위용 감상 구간
    PAIN_STILL: 6.0,      // 5개 포인트 순차 노출 (길게)
    RESONANCE_STILL: 24.0, // 공명 마퀴 시퀀스
    RESONANCE_STILL_TOUCH: 2.0, // 터치 기기 전용 (호흡 단축)
    MESSAGE_STILL: 12.0,   
    MESSAGE_STILL_PC: 30.0, // 고사양 PC에서의 감상 호흡 상향
    FOR_WHO_STILL: 4.0,   
    STORY_STILL: 3.0,     
    CTA_STILL: 2.0,       
  },

  // 구간별 전환 간극(Gaps) - 정교한 리듬 설계
  GAPS: {
    RESONANCE_MORPH: { PC: 1.5, TOUCH: 0.4 }, // 공명 지평선 생성 호흡
    RESONANCE_TRANS: { PC: 1.5, TOUCH: 0.8 }, // 전이 브릿지 호흡
  },

  SCRUB: 1.0, 
  EASE_TRANS: 'power2.inOut',
  EASE_STILL: 'none',

  // [V5.3] 스크롤 감도: 가중치 1당 실제 스크롤 픽셀 수
  SCROLL_SENSITIVITY: 1000, 
};


// ─────────────────────────────────────────────
// 5. 시각 수치 (Visual Units)
// ─────────────────────────────────────────────
export const LOGO_SIZE = {
  // [v26.98 UI Detail] 고해상도 소스 기반 스케일 다운 설계
  // 히어로 중앙이 원본(1.0)으로 보여야 가장 선명함
  BIG_SCALE: 1.0,           
  BIG_SCALE_MOBILE: 1.0,    
  HEADER_SCALE: 0.3,        // PC (150px -> 30px)
  HEADER_SCALE_TABLET: 0.4,
  HEADER_SCALE_MOBILE: 0.5, // Mobile (approx 70px -> 24px)
};

export const NEMO_SIZE = {
  INITIAL_W: 56,
  INITIAL_H: 56,
  INITIAL_BORDER_RADIUS: 6,
  
  // 페인 섹션 테두리 박스 (레거시 호환용 - 기본값)
  BORDER_BOX_W: '18vw',
  BORDER_BOX_H: '48vh',
  
  // 메시지 세로 틸 박스
  TEAL_BOX_W: '16vw',
  TEAL_BOX_H: '62vh',
  
  // 포후 가로 이미지 프레임
  IMAGE_W: '72vw',
  IMAGE_H: '52vh',
};

// [V11.45] 페인 섹션 기기별 최적 레이아웃 매트릭스 (w, h, left, top)
// 70vw 모바일 기준점 반영 및 기기별 유동적 비례 확립
export const NEMO_RESPONSIVE_LAYOUT = {
  // 0. 히어로 초기 상태 (Hero Mode Baseline)
  HERO: {
    PC:       { w: 56, h: 56, left: '50%', top: '50%' },
    TABLET_P: { w: 48, h: 48, left: '50%', top: '50%' },
    MOBILE:   { w: 42, h: 42, left: '50%', top: '50%' }
  },

  // 1. 페인 진입 (Transition from Hero)
  START_TO_PAIN: {
    PC:       { w: '100vw', h: '100vh', left: '50%', top: '60%' },
    TABLET_P: { w: '100vw', h: '100vh', left: '50%', top: '60%' },
    MOBILE:   { w: '100vw', h: '100vh', left: '50%', top: '60%' }
  },

  // 2. 페인 포인트 루프 (Left-aligned)
  PAIN_POINTS: {
    PC:       { w: '18vw', h: '48vh', left: '25%', top: '50%' },
    TABLET_P: { w: '50vw', h: '35vh', left: '45%', top: '50%' },
    MOBILE:   { w: '60vw', h: '35vh', left: '40%', top: '50%' }
  },

  // 3. 브릿지 메시지 (Center-aligned, Compressed)
  BRIDGE: {
    PC:       { w: '20vw', h: '20vh', left: '50%', top: '50%' },
    TABLET_P: { w: '60vw', h: '30vh', left: '50%', top: '50%' },
    MOBILE:   { w: '80vw', h: '20vh', left: '50%', top: '50%' }
  },

  // 4. 메인 공명 문장 (Horizon Line / Marquee Stage)
  RESONANCE: {
    PC:       { w: '100vw', h: '2px', left: '50%', top: '50%' },
    TABLET_P: { w: '100vw', h: '2px', left: '50%', top: '50%' },
    MOBILE:   { w: '100vw', h: '2px', left: '50%', top: '50%' }
  },

  // 5. 메시지 섹션 (Vertical Teal Box)
  MESSAGE: {
    PC:       { w: '6vw', h: '30vh', left: '50%', top: '60%' },
    TABLET_P: { w: '14vw', h: '28vh', left: '50%', top: '62%' },
    MOBILE:   { w: '18vw', h: '28vh', left: '50%', top: '62%' }
  },

  // 6. 포후 섹션 (Wide Image Frame)
  FORWHO: {
    PC:       { w: '72vw', h: '52vh', left: '50%', top: '50%' },
    TABLET_P: { w: '88vw', h: '45vh', left: '50%', top: '50%' },
    MOBILE:   { w: '92vw', h: '40vh', left: '50%', top: '50%' }
  },

  // 7. 브랜드 스토리 (Stable Nemo:ON State)
  STORY: {
    PC:       { w: '72vw', h: '52vh', left: '50%', top: '50%' },
    TABLET_P: { w: '88vw', h: '45vh', left: '50%', top: '50%' },
    MOBILE:   { w: '92vw', h: '40vh', left: '50%', top: '50%' }
  },

  // 8. CTA (Final Transition)
  CTA: {
    PC:       { w: '100vw', h: '100vh', left: '50%', top: '50%' },
    TABLET_P: { w: '100vw', h: '100vh', left: '50%', top: '50%' },
    MOBILE:   { w: '100vw', h: '100vh', left: '50%', top: '50%' }
  }
};

// ─────────────────────────────────────────────
// 6. 사이드메뉴 너비 (Responsive Widths)
// ─────────────────────────────────────────────
export const MENU_WIDTH = {
  MOBILE: '100vw',
  TABLET_PORTRAIT: '75vw',   // [v14.4] 태블릿 세로: 3/4 덮기
  TABLET_LANDSCAPE: '55vw',  // [v14.4] 태블릿 가로 / 일반 PC
  PC: '35vw',               // [v14.4] 와이드 PC
};

// ─────────────────────────────────────────────
// 7. 감정 키워드 시뮬레이션 설정 (V16.38)
// ─────────────────────────────────────────────
export const KEYWORD_CFG = {
  // 생성 영역 (x축 비율)
  SPAWN_AREA: {
    PC: { START: 0.35, END: 0.85 },    // 35% ~ 85%
    MOBILE: { START: 0.1, END: 0.9 },   // 10% ~ 90% (태블릿 공용)
  },
  
  // 기기별 디자인 스펙
  DESIGN: {
    PC:      { bh: 52, fontSize: 24, padding: 35, minW: 100 },
    TABLET:  { bh: 46, fontSize: 24, padding: 30, minW: 80 },
    MOBILE:  { bh: 40, fontSize: 20, padding: 25, minW: 60 },
  },

  // 물리 엔진 파라미터
  PHYSICS: {
    ATTEMPTS: 100,      // 빈자리 탐색 시도 횟수
    MARGIN_X: 0.7,      // 텍스트 너비 대비 충돌 감지 비율 (0.7 = 캡슐 중첩 허용)
    MARGIN_Y: 10,       // 세로 최소 여유 공간 (px)
    RESTITUTION: 0.4,   // 탄성
    FRICTION: 0.1,      // 마찰
  }
};

// ─────────────────────────────────────────────
// 8. 브랜드 로고 상세 색상 (State-dependent Colors)
// ─────────────────────────────────────────────
export const LOGO_COLOR_CFG = {
  OFF: {
    TEXT: '#e8d5b0',
    TRIANGLE: '#e8d5b0',
    CIRCLE: '#c4a882',
    GLOW: 'rgba(232, 213, 176, 0.3)',
  },
  ON: {
    TEXT: '#0891b2',
    TRIANGLE: '#0891b2',
    CIRCLE: '#0e7490',
    GLOW: 'transparent',
  }
};

// ─────────────────────────────────────────────
// 9. 맥락 중심 애니메이션 타이밍 (Contextual Durations)
// ─────────────────────────────────────────────
export const ANIMS_CFG = {
  // 로고 형태 및 요소 변이
  LOGO_MORPH: 0.2,           // 로고 내부 쉐이프(Status, Lines) 변이
  
  // 히어로 <-> 공유 네모 전이 (Visual Trick)
  SWAP_FADE: 0.1,            // 기존 요소의 소멸
  SWAP_APPEAR: 0.01,         // 공유 요소의 즉시 발현
  SWAP_TEXT_EXIT: 0.1,       // 텍스트 상승 유실
  
  // 콘텐츠 및 UI 전환
  UI_FADE: 0.2,              // 일반적인 UI 요소(힌트, 포인트 등) 페이드
  CONTENT_SOFT: 0.5,         // 주요 텍스트 등장 및 안착
  
  // 물리 시뮬레이션 및 엔진 제어
  PHYSICS_TRIGGER: 0.001,    // 물리 입자 주입 시점 (찰나)
  PHYSICS_GAP: 0.02,         // 입자 간 연속 생성 간격
  PHYSICS_RESET: 0.1,        // 엔진 리셋 및 드랍 대기
  
  // 섹션 대전환 (Transition)
  RESONANCE_BG: 0.6,         // 배경색 대규모 전이
  MESSAGE_MOVE: 0.4,         // 메시지 섹션 위치 안착
};
