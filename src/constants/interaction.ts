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
  // [계층 4] 브랜드 로고: 헤더(HEADER: 10000)보다 위에 위치.
  // GlobalInteractionStage가 position: fixed라 부모 z-index 제약 없이
  // 뷰포트 기준 독립적 stacking context를 형성함.
  // 로고의 실제 전역 순위는 자식값(10001)이 아닌 이 값 자체로 결정됨.
  JOURNEY_LOGO: 10001, 

  HEADER: 10000,
  MENU: 10002,
  // [계층 최상위] 햄버거 모핑 토글 버튼 — 항상 SideMenu 패널(10002) 위에 위치
  MENU_TOGGLE: 10003,
  
  // [계층 3] 스크롤 가이드
  SCROLL_HINT: 1000, 
  
  // [계층 2] 주요 애니메이션 객체 (공유 네모)
  SHARED_NEMO: 20, 
  
  // [계층 1] 배경 물리 시뮬레이션 (감정 키워드)
  KEYWORDS: 10,
  
  // [향후] 섹션 콘텐츠 레이어용 (콘텐츠 작업 시 활성화)
  CONTENT_LAYER: 20,
  // [향후] 배경 레이어용
  BACKGROUND: 0,
};

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
  HERO:    100,   // vh
  PAIN:    1000,
  MESSAGE: 800,
  FORWHO:  1000,
  STORY:   100,
  CTA:     100,
  FOOTER:  75,     // 뷰포트의 75% (3/4) 노출
};

// ─────────────────────────────────────────────
// 4. 감도 및 가중치 설정 (V4.0 Tuning)
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
    RESONANCE_STILL: 2.0, // 공명 문장 집중
    MESSAGE_STILL: 4.0,   // 핵심 카운트 관통
    FOR_WHO_STILL: 4.0,   // 타겟 리스트
    STORY_STILL: 3.0,     // 브랜드 스토리
    CTA_STILL: 2.0,       // CTA 진입 전 호흡
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
  HEADER_SCALE: 0.2,        // PC (150px -> 30px)
  HEADER_SCALE_MOBILE: 0.35, // Mobile (approx 70px -> 24px)
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
