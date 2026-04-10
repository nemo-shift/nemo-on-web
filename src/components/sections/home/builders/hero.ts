import { gsap } from 'gsap';
import { 
  LOGO_SIZE, TIMING_CFG, STAGES, EASE, ANIMS_CFG 
} from '@/constants/interaction';
import { JOURNEY_MASTER_CONFIG } from '@/data/home/journey';
import { LOGO_JOURNEY_SECTIONS } from '../interaction-journey';
import { JourneyLogoHandle } from '../JourneyLogo';
import { SharedNemoHandle } from '../SharedNemo';

/**
 * [V11.31 Knowledge Transfer] buildHeroSwapSequence
 * 히어로 섹션의 개별 네모(Origin)와 전역 인터랙션 네모(Shared) 간의 교체 시퀀스.
 * 
 * 시각적 트릭(Visual Trick):
 * 1. 물리적으로 다른 두 요소를 한 틱(0.01s) 만에 교체하여 사용자가 '같은 요소'라고 느끼게 함.
 * 2. Origin Nemo는 배경과 테두리를 투명화하여 사라진 것처럼 보이게 하고,
 * 3. 동시에 Shared Nemo의 opacity를 1로 올려 인터랙션을 이어받음.
 */
export function buildHeroSwapSequence(tl: gsap.core.Timeline, nemo: SharedNemoHandle, L: Record<string, number>) {
  const originEl = document.getElementById('hero-nemo-origin');
  const originText = originEl?.querySelector('span');
  if (!originEl) return;

  // [V11.34-P5] 타임라인 영점 고정: 소환되기 전까지는 '결' 박스 위치에서 투명하게 대기
  tl.set([originEl, originText, nemo.nemoEl], { transition: 'none' }, 0);
  tl.set(nemo.nemoEl, { opacity: 0 }, 0); 
  
  // [V11.41 Sync] 네모 교체(Swap): 텍스트가 상승을 시작하는 시점에 맞춰 정적 박스는 사라지고 공유 네모가 나타남
  tl.to(originEl, { 
    backgroundColor: 'transparent', 
    borderColor: 'transparent', 
    boxShadow: 'none', 
    duration: ANIMS_CFG.SWAP_FADE 
  }, L[STAGES.HERO_STILL_CONTENT_RISE]);
  
  tl.to(nemo.nemoEl, { 
    opacity: 1, 
    duration: ANIMS_CFG.SWAP_APPEAR 
  }, L[STAGES.HERO_STILL_CONTENT_RISE]);

  // [V11.41] originText(결 텍스트) 소멸Tween 삭제: 
  // 다른 히어로 콘텐츠와 함께 패러랙스 래퍼(#hero-on-center-stage)를 타고 자연스럽게 상승하도록 보존함.
}

/**
 * [V11.31 Knowledge Transfer] buildLogoTimeline
 * 마스터 시트(JOURNEY_MASTER_CONFIG)를 기반으로 로고의 형태와 색상을 변환하는 타임라인을 빌드.
 * 
 * 주요 로직:
 * 1. 섹션별 환경 설정(env)에 따라 헤더의 전역 색상 값(--header-fg, --bg)을 동적으로 변경.
 * 2. 로고의 내부 형태(Shapes, Status, Rectangle)를 각 스테이지의 정의에 맞춰 노출/숨김 처리.
 * 3. 마스터 타임라인의 시간 라벨(L)과 동기화되어 스크롤 위치에 따라 정확히 변이함.
 */
export function buildLogoTimeline(tl: gsap.core.Timeline, logo: JourneyLogoHandle, isMobile: boolean, isOn: boolean, L: Record<string, number>) {
  const bigScale = isMobile ? LOGO_SIZE.BIG_SCALE_MOBILE : LOGO_SIZE.BIG_SCALE;
  
  // 초기 스케일 설정 (빅 타이포 상태)
  tl.set(logo.containerEl, { scale: bigScale, x: 0, y: 0 }, 0);

  // [V11.41 シ퀀스] Phase 1: 로고 부속품(△/○, ON) 상승 퇴장
  tl.to([logo.shapesEl, logo.statusEl], { 
    y: -150, 
    opacity: 0, 
    duration: TIMING_CFG.TRANSITION_WEIGHT,
    ease: EASE.FADE
  }, L[STAGES.HERO_STILL_START]);

  const headerScale = LOGO_SIZE.HEADER_SCALE;
  const t = TIMING_CFG.TRANSITION_WEIGHT;
  const r = TIMING_CFG.TRANSITION_FINISH_RATIO;
  
  const sections = LOGO_JOURNEY_SECTIONS;
  
  // [V11.34-P5] 데이터 체이닝(Data Chaining): 이전 섹션의 환경 데이터를 기억하여 fromTo의 시작값으로 사용
  // [V14.7 Refinement] 현재의 진실(isOn)을 인지하여 데이터 무결성을 확보합니다.
  const heroStage = JOURNEY_MASTER_CONFIG[STAGES.HERO];
  let lastEnv = (isOn && heroStage.on?.env) ? heroStage.on.env : heroStage.env;

  sections.forEach(({ label, stage }) => {
    const raw = JOURNEY_MASTER_CONFIG[stage];
    if (!raw) return;
    const cfg = isMobile && raw.mobile ? { ...raw, ...raw.mobile } : raw;
    const time = L[label];

    // [전역 색상 전이] fromTo를 사용하여 시작과 끝을 데이터로 강제 고정
    tl.fromTo(document.documentElement, 
      {
        '--header-fg': lastEnv.fg,
        '--bg': lastEnv.bg
      },
      {
        '--header-fg': cfg.env.fg!,
        '--bg': cfg.env.bg!,
        duration: t * r,
        ease: 'none',
        immediateRender: false // [V11.34-P5] 빌드 시점의 시각적 오염 방지
      }, 
      time
    );

    // 다음 섹션을 위해 현재 환경 데이터를 업데이트 (타입 보증을 위해 Non-null 처리)
    if (cfg.env.fg && cfg.env.bg) {
      lastEnv = { fg: cfg.env.fg, bg: cfg.env.bg };
    }

    // 로고 세부 요소(한글 텍스트, 상태 바 등) 변환
    tl.to(logo.nemoKrEl, { opacity: cfg.logo.nemoKr ? 1 : 0, duration: ANIMS_CFG.LOGO_MORPH }, time);
    // 로고 부속품(도형 등) — 히어로 특수 연출 구간(START_TO_PAIN)은 중복 방지를 위해 제외
    if (label !== STAGES.START_TO_PAIN) {
      tl.to([logo.shapesEl, logo.statusEl], { 
        opacity: cfg.logo.status ? 1 : 0, 
        visibility: cfg.logo.status ? 'visible' : 'hidden', 
        duration: ANIMS_CFG.LOGO_MORPH 
      }, time);
    }
    tl.to(logo.rectangleEl, { 
      opacity: cfg.logo.rectangle ? 1 : 0, 
      visibility: cfg.logo.rectangle ? 'visible' : 'hidden', 
      duration: ANIMS_CFG.LOGO_MORPH 
    }, time);

    // [+] <-> [-] 형태적 모핑(Morphing)
    if (logo.tLines.h && logo.tLines.v) {
      const isPlus = cfg.logo.morph === '+';
      tl.to(logo.tLines.h, { top: isPlus ? '60px' : '20px', duration: ANIMS_CFG.LOGO_MORPH }, time);
    }
  });

  // 최종적으로 헤더 사이즈로 축소되는 구간 (CONTENT_RISE 시점으로 앞당김)
  tl.to(logo.containerEl, {
    scale: headerScale, x: 0, y: 0, duration: t * r, ease: EASE.TRANSITION
  }, L[STAGES.HERO_STILL_CONTENT_RISE]);
}
