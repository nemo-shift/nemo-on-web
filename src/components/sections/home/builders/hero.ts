import { gsap } from 'gsap';
import { 
  LOGO_SIZE, TIMING_CFG, STAGES, EASE 
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
export function buildHeroSwapSequence(tl: gsap.core.Timeline, nemo: SharedNemoHandle) {
  const originEl = document.getElementById('hero-nemo-origin');
  const originText = originEl?.querySelector('span');
  if (!originEl) return;

  tl.set([originEl, originText, nemo.nemoEl], { transition: 'none' }, 0);
  tl.to(originEl, { backgroundColor: 'transparent', borderColor: 'transparent', boxShadow: 'none', duration: 0.1 }, 0);
  tl.to(nemo.nemoEl, { opacity: 1, duration: 0.01 }, 0);
  if (originText) tl.to(originText, { opacity: 0, y: -15, duration: 0.1 }, 0);
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
export function buildLogoTimeline(tl: gsap.core.Timeline, logo: JourneyLogoHandle, isMobile: boolean, L: Record<string, number>) {
  const bigScale = isMobile ? LOGO_SIZE.BIG_SCALE_MOBILE : LOGO_SIZE.BIG_SCALE;
  
  // 초기 스케일 설정 (빅 타이포 상태)
  tl.set(logo.containerEl, { scale: bigScale, x: 0, y: 0 }, 0);

  const headerScale = LOGO_SIZE.HEADER_SCALE;
  const t = TIMING_CFG.TRANSITION_WEIGHT;
  const r = TIMING_CFG.TRANSITION_FINISH_RATIO;
  
  const sections = LOGO_JOURNEY_SECTIONS;

  sections.forEach(({ label, stage }) => {
    const raw = JOURNEY_MASTER_CONFIG[stage];
    if (!raw) return;
    const cfg = isMobile && raw.mobile ? { ...raw, ...raw.mobile } : raw;
    const time = L[label];

    // [전역 색상 전이] 배경 및 텍스트 색상을 스테이지 설정에 맞춰 부드럽게 변경
    tl.to(document.documentElement, {
      '--header-fg': cfg.env.fg,
      '--bg': cfg.env.bg,
      duration: t * r
    }, time);

    // 로고 세부 요소(한글 텍스트, 상태 바 등) 변환
    tl.to(logo.nemoKrEl, { opacity: cfg.logo.nemoKr ? 1 : 0, duration: 0.2 }, time);
    tl.to([logo.shapesEl, logo.statusEl], { 
      opacity: cfg.logo.status ? 1 : 0, 
      visibility: cfg.logo.status ? 'visible' : 'hidden', 
      duration: 0.2 
    }, time);
    tl.to(logo.rectangleEl, { 
      opacity: cfg.logo.rectangle ? 1 : 0, 
      visibility: cfg.logo.rectangle ? 'visible' : 'hidden', 
      duration: 0.2 
    }, time);

    // [+] <-> [-] 형태적 모핑(Morphing)
    if (logo.tLines.h && logo.tLines.v) {
      const isPlus = cfg.logo.morph === '+';
      tl.to(logo.tLines.h, { top: isPlus ? '60px' : '20px', duration: 0.2 }, time);
    }
  });

  // 최종적으로 헤더 사이즈로 축소되는 구간 (START_TO_PAIN 시점)
  tl.to(logo.containerEl, {
    scale: headerScale, x: 0, y: 0, duration: t * r, ease: EASE.TRANSITION
  }, L[STAGES.START_TO_PAIN]);
}
