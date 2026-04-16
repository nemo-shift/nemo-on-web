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
 * [V11.Macro_Final_Refine] buildLogoTimeline
 * 로고 본연의 형태 전이(Morphing) 및 스케일 제어에만 집중합니다.
 * 배경색 및 환경 제어권은 scroll.ts로 완전 이관되었습니다.
 */
export function buildLogoTimeline(
  tl: gsap.core.Timeline, 
  logo: JourneyLogoHandle, 
  options: GlobalBuilderOptions, 
  L: Record<string, number>
) {
  const { isMobile, isTabletPortrait } = options;
  const { constants, data } = options.registry;
  const { LOGO_SIZE, STAGES, LAYOUT_SPEC, TIMING_CFG, EASE, ANIMS_CFG } = constants;
  const { JOURNEY_MASTER_CONFIG, LOGO_JOURNEY_SECTIONS } = data;

  if (!logo.containerEl) return;
  
  const bigScale = isMobile ? LOGO_SIZE.BIG_SCALE_MOBILE : LOGO_SIZE.BIG_SCALE;
  const headerScale = isMobile 
    ? LOGO_SIZE.HEADER_SCALE_MOBILE 
    : (isTabletPortrait ? LOGO_SIZE.HEADER_SCALE_TABLET : LOGO_SIZE.HEADER_SCALE);

  // 1. 초기 상태 영점 고정
  tl.set(logo.containerEl, { scale: bigScale, x: 0, y: 0 }, 0);

  // 2. 히어로 요소(△/○, ON) 상승 퇴장
  tl.to([logo.shapesEl, logo.statusEl], { 
    y: -LAYOUT_SPEC.LOGO.EJECT_Y, 
    opacity: 0, 
    duration: TIMING_CFG.TRANSITION_WEIGHT,
    ease: EASE.FADE
  }, L[STAGES.HERO_STILL_START]);

  // 3. 여정별 로고 형태 변이 (Morphing)
  LOGO_JOURNEY_SECTIONS.forEach(({ label, stage }: { label: string, stage: string }) => {
    const raw = JOURNEY_MASTER_CONFIG[stage];
    if (!raw) return;
    const cfg = isMobile && raw.mobile ? { ...raw, ...raw.mobile } : raw;
    const time = L[label];

    // [V11.65 Cinematic Morph] Nemo -> RECTANGLE 정밀 오버랩 시퀀스
    if (label === STAGES.PAIN_TO_MSG) {
      tl.to(logo.nemoKrEl, { 
        opacity: 0, 
        scale: LAYOUT_SPEC.LOGO.MORPH_SCALE, 
        filter: `blur(${LAYOUT_SPEC.LOGO.MORPH_BLUR}px)`,
        duration: ANIMS_CFG.LOGO_MORPH * 2.5,
        ease: 'power2.inOut'
      }, time);

      tl.fromTo(logo.rectangleEl, 
        { opacity: 0, letterSpacing: `${LAYOUT_SPEC.LOGO.RECT_LETTER_GAP}em`, visibility: 'visible', filter: 'blur(6px)', scale: 0.95 },
        { opacity: 1, letterSpacing: '0.02em', filter: 'blur(0px)', scale: 1, duration: ANIMS_CFG.LOGO_MORPH * 3, ease: 'power3.out', immediateRender: false }, 
        time
      );
    } else {
      // 일반 상태 전이
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

    // 로고 부속품(도형/상태) 가시성 제어
    tl.to(logo.shapesEl, { 
      opacity: (cfg.logo as any).shapes ? 0.8 : 0, 
      visibility: (cfg.logo as any).shapes ? 'visible' : 'hidden', 
      pointerEvents: (cfg.logo as any).shapes ? 'auto' : 'none',
      y: 0,
      duration: ANIMS_CFG.LOGO_MORPH 
    }, time);

    tl.to(logo.statusEl, { 
      opacity: cfg.logo.status ? 1 : 0, 
      visibility: cfg.logo.status ? 'visible' : 'hidden', 
      pointerEvents: cfg.logo.status ? 'auto' : 'none',
      y: 0,
      duration: ANIMS_CFG.LOGO_MORPH 
    }, time);

    // [+] <-> [-] 형태적 모핑
    if (logo.tLines.h) {
      const isPlus = cfg.logo.morph === '+';
      tl.to(logo.tLines.h, { top: isPlus ? '0.32em' : '0', duration: ANIMS_CFG.LOGO_MORPH }, time);
    }
  });

  // 4. 헤더 사이즈 최종 안착
  tl.to(logo.containerEl, {
    scale: headerScale, 
    x: 0, 
    y: 0, 
    duration: TIMING_CFG.TRANSITION_WEIGHT * TIMING_CFG.TRANSITION_FINISH_RATIO, 
    ease: EASE.TRANSITION
  }, L[STAGES.HERO_STILL_CONTENT_RISE]);
}

