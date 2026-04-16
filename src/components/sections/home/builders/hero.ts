import { gsap } from 'gsap';
import { JourneyLogoHandle } from '../JourneyLogo';
import { SharedNemoHandle } from '../SharedNemo';
import { GlobalBuilderOptions } from '../types';

/**
 * [V11.31 Knowledge Transfer] buildHeroSwapSequence
 * 히어로 섹션의 개별 네모(Origin)와 전역 인터랙션 네모(Shared) 간의 교체 시퀀스.
 * 
 * 시각적 트릭(Visual Trick):
 * 1. 물리적으로 다른 두 요소를 한 틱(0.01s) 만에 교체하여 사용자가 '같은 요소'라고 느끼게 함.
 * 2. Origin Nemo는 배경과 테두리를 투명화하여 사라진 것처럼 보이게 하고,
 * 3. 동시에 Shared Nemo의 opacity를 1로 올려 인터랙션을 이어받음.
 */
export function buildHeroSwapSequence(
  tl: gsap.core.Timeline, 
  nemo: SharedNemoHandle, 
  L: Record<string, number>,
  options: GlobalBuilderOptions
) {
  const { ANIMS_CFG, STAGES } = options.registry.constants;
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
 * @param {Record<string, number>} L - 마스터 타임라인의 시간 라벨 맵
 */
export function buildLogoTimeline(
  tl: gsap.core.Timeline, 
  logo: JourneyLogoHandle, 
  options: GlobalBuilderOptions, 
  L: Record<string, number>
) {
  const { isMobile, isTabletPortrait, isOn } = options;
  const { LOGO_SIZE, STAGES, LAYOUT_SPEC, TIMING_CFG, EASE, ANIMS_CFG } = options.registry.constants;
  const { JOURNEY_MASTER_CONFIG, LOGO_JOURNEY_SECTIONS } = options.registry.data;

  if (!logo.containerEl) return;
  
  const bigScale = isMobile ? LOGO_SIZE.BIG_SCALE_MOBILE : LOGO_SIZE.BIG_SCALE;
  
  // 기기별 헤더 스케일 선정
  const headerScale = isMobile 
    ? LOGO_SIZE.HEADER_SCALE_MOBILE 
    : (isTabletPortrait ? LOGO_SIZE.HEADER_SCALE_TABLET : LOGO_SIZE.HEADER_SCALE);

  // [V11.34-P5] 데이터 체이닝(Data Chaining): 이전 섹션의 환경 데이터를 기억하여 fromTo의 시작값으로 사용
  // [V14.7 Refinement] 현재의 진실(isOn)을 인지하여 데이터 무결성을 확보합니다.
  const heroStage = JOURNEY_MASTER_CONFIG[STAGES.HERO];
  let lastEnv = (isOn && heroStage.on?.env) ? heroStage.on.env : heroStage.env;

  // 초기 스케일 영점 고정 (빅 타이포 상태)
  tl.set(logo.containerEl, { scale: bigScale, x: 0, y: 0 }, 0);

  // [V11.41 シ퀀스] Phase 1: 로고 부속품(△/○, ON) 상승 퇴장
  tl.to([logo.shapesEl, logo.statusEl], { 
    y: -LAYOUT_SPEC.LOGO.EJECT_Y, 
    opacity: 0, 
    duration: TIMING_CFG.TRANSITION_WEIGHT,
    ease: EASE.FADE
  }, L[STAGES.HERO_STILL_START]);

  const t = TIMING_CFG.TRANSITION_WEIGHT;
  const r = TIMING_CFG.TRANSITION_FINISH_RATIO;
  
  const sections = LOGO_JOURNEY_SECTIONS;
  
  sections.forEach(({ label, stage, ease }: { label: string, stage: string, ease?: any }) => {
    const raw = JOURNEY_MASTER_CONFIG[stage];
    if (!raw) return;
    const cfg = isMobile && raw.mobile ? { ...raw, ...raw.mobile } : raw;
    const time = L[label];

    // [V11.56 Sync] 배경색 및 로고 전이 타이밍 동기화
    // PAIN_TO_MSG 브릿지 구간에서 이미 TO_MESSAGE의 환경(배경색 등)을 지향하게 함.
    let transitionCfg = cfg;
    if (label === STAGES.PAIN_TO_MSG) {
      transitionCfg = JOURNEY_MASTER_CONFIG[STAGES.TO_MESSAGE];
    }

    // [V11.18 이전] 배경색 및 로고 전용 CSS 변수 전이 로직은 
    // 더욱 거시적인 관리를 위해 buildSectionScrollTimeline(scroll.ts)으로 통합 이전되었습니다.

    // 다음 섹션을 위해 현재 환경 데이터를 업데이트
    if (transitionCfg.env.fg && transitionCfg.env.bg) {
      lastEnv = { fg: transitionCfg.env.fg, bg: transitionCfg.env.bg };
    }

    // [로고 세부 요소 변환]
    if (label === STAGES.PAIN_TO_MSG) {
      // [V11.65 Cinematic Morph] Nemo -> RECTANGLE 정밀 오버랩 시퀀스
      // 한글 로고가 완전히 사라지기 전 영문 로고가 투영되도록 타이밍 설계
      tl.to(logo.nemoKrEl, { 
        opacity: 0, 
        scale: LAYOUT_SPEC.LOGO.MORPH_SCALE, 
        filter: `blur(${LAYOUT_SPEC.LOGO.MORPH_BLUR}px)`,
        duration: ANIMS_CFG.LOGO_MORPH * 2.5,
        ease: 'power2.inOut'
      }, time);

      tl.fromTo(logo.rectangleEl, 
        { 
          opacity: 0, 
          letterSpacing: `${LAYOUT_SPEC.LOGO.RECT_LETTER_GAP}em`,
          visibility: 'visible',
          filter: 'blur(6px)',
          scale: 0.95
        },
        { 
          opacity: 1, 
          letterSpacing: '0.02em', // JourneyLogo의 gap과 조화를 위해 좁게 설정
          filter: 'blur(0px)',
          scale: 1,
          duration: ANIMS_CFG.LOGO_MORPH * 3,
          ease: 'power3.out',
          immediateRender: false
        }, 
        time
      );
    } else {
      // 일반적인 상태 전이: 잔상 방지를 위해 filter 리셋 및 데이터 기반 가시성 제어
      tl.to(logo.nemoKrEl, { 
        opacity: cfg.logo.nemoKr ? 1 : 0, 
        visibility: cfg.logo.nemoKr ? 'visible' : 'hidden',
        pointerEvents: cfg.logo.nemoKr ? 'auto' : 'none',
        filter: 'blur(0px)',
        duration: ANIMS_CFG.LOGO_MORPH 
      }, time);
      
      tl.to(logo.rectangleEl, { 
        opacity: cfg.logo.rectangle ? 1 : 0, 
        visibility: cfg.logo.rectangle ? 'visible' : 'hidden', 
        pointerEvents: cfg.logo.rectangle ? 'auto' : 'none',
        filter: 'blur(0px)',
        duration: ANIMS_CFG.LOGO_MORPH 
      }, time);
    }

    // [로고 부속품 제어] - 데이터 기반 가시성 및 위치 리셋 (y: 0)
    tl.to(logo.shapesEl, { 
      opacity: (cfg.logo as any).shapes ? 0.8 : 0, 
      visibility: (cfg.logo as any).shapes ? 'visible' : 'hidden', 
      pointerEvents: (cfg.logo as any).shapes ? 'auto' : 'none',
      y: 0, // [V11.19 Fix] 히어로 축소 시 올라갔던 위치 초기화
      duration: ANIMS_CFG.LOGO_MORPH 
    }, time);

    tl.to(logo.statusEl, { 
      opacity: cfg.logo.status ? 1 : 0, 
      visibility: cfg.logo.status ? 'visible' : 'hidden', 
      pointerEvents: cfg.logo.status ? 'auto' : 'none',
      y: 0, // [V11.19 Fix] 히어로 축소 시 올라갔던 위치 초기화
      duration: ANIMS_CFG.LOGO_MORPH 
    }, time);

    // [+] <-> [-] 형태적 모핑(Morphing)
    if (logo.tLines.h && logo.tLines.v) {
      const isPlus = cfg.logo.morph === '+';
      tl.to(logo.tLines.h, { top: isPlus ? '0.32em' : '0', duration: ANIMS_CFG.LOGO_MORPH }, time);
    }
  });

  // 최종적으로 헤더 사이즈로 축소되는 구간 (CONTENT_RISE 시점으로 앞당김)
  tl.to(logo.containerEl, {
    scale: headerScale, 
    x: 0, 
    y: 0, 
    duration: t * r, 
    ease: EASE.TRANSITION
  }, L[STAGES.HERO_STILL_CONTENT_RISE]);
}
