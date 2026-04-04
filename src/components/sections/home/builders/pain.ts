import { gsap } from 'gsap';
import { 
  COLORS, STAGES, TIMING_CFG, EASE, ANIMS_CFG 
} from '@/constants/interaction';
import { JOURNEY_MASTER_CONFIG } from '@/data/home/journey';
import { PAIN_POINTS, RESONANCE_MESSAGE } from '@/data/home/pain';
import { NEMO_JOURNEY_SECTIONS } from '../interaction-journey';
import { SharedNemoHandle } from '../SharedNemo';
import { FallingKeywordsHandle } from '../FallingKeywordsStage';

/**
 * [V11.31 Knowledge Transfer] buildNemoTimeline
 * 네모(Nemo)의 상태 변이와 콘텐츠(Pain Points) 애니메이션을 담당하는 핵심 빌더.
 * 
 * 주요 역할:
 * 1. 네모의 기하학적 변형: 스테이지별 설정에 따라 너비, 높이, 색상, 테두리 등을 애니메이션.
 * 2. 콘텐츠 시퀀싱: PAIN_POINTS 데이터를 순회하며 스텝 번호와 텍스트를 순차적으로 노출.
 * 3. 물리 엔진 연동: 각 페인 포인트 시점에 맞춰 FallingKeywordsStage에 실시간으로 키워드를 주입.
 */
export function buildNemoTimeline(
  tl: gsap.core.Timeline, 
  nemo: SharedNemoHandle, 
  device: { isMobile: boolean; isTabletPortrait: boolean }, 
  falling: FallingKeywordsHandle, 
  L: Record<string, number>,
  isRestoringRef: { current: boolean } // [V11.34-P5] 리액트 의존성 없는 순수 타입으로 개선
) {
  const el = nemo.nemoEl!;
  const t = TIMING_CFG.TRANSITION_WEIGHT;
  const r = TIMING_CFG.TRANSITION_FINISH_RATIO;

  // 히어로 오프모드 UI를 자연스럽게 숨김 처리
  tl.to(['.hero-content-layer', '.hero-bottom-bar', '#hero-nemo-origin'], {
    opacity: 0, visibility: 'hidden', duration: t * 0.5, ease: EASE.FADE
  }, L[STAGES.START_TO_PAIN]);

  const sections = NEMO_JOURNEY_SECTIONS;

  // 마스터 시트에 정의된 네모의 여정(Journey) 순차 실행
  sections.forEach(({ label, stage, ease }) => {
    const raw = JOURNEY_MASTER_CONFIG[stage];
    if (!raw) return;
    
    let cfg = raw.nemo;
    if (device.isMobile && raw.mobile?.nemo) {
      cfg = { ...cfg, ...raw.mobile.nemo };
    } else if (device.isTabletPortrait && raw.tablet?.nemo) {
      cfg = { ...cfg, ...raw.tablet.nemo };
    }
    
    const time = L[label];

    tl.to(el, {
      width: cfg.width,
      height: cfg.height,
      borderRadius: cfg.borderRadius,
      backgroundColor: cfg.backgroundColor,
      border: cfg.border,
      left: cfg.left,
      top: cfg.top,
      opacity: cfg.opacity,
      duration: (label === STAGES.TO_PAIN) ? ANIMS_CFG.MESSAGE_MOVE * r : t * r,
      ease: ease
    }, time);
  });

  const step = nemo.stepEl, line = nemo.lineEl, content = nemo.contentEl;
  
  // 콘텐츠 노출을 위한 시간 오프셋 계산
  const waitOffset = 0.4 * r;
  const painDuration = (L[STAGES.PAIN_CONTENT] - (L[STAGES.TO_PAIN] + waitOffset));
  const itemGap = painDuration / PAIN_POINTS.length;

  // 스크롤 유도 힌트 노출
  tl.to('#pain-scroll-hint', { opacity: 1, duration: ANIMS_CFG.UI_FADE }, L[STAGES.TO_PAIN] + waitOffset);

  // 각 페인 포인트(Step)별 애니메이션 구축
  PAIN_POINTS.forEach((point, i) => {
    const startTime = L[STAGES.TO_PAIN] + waitOffset + (i * itemGap);
    
    // 이전 콘텐츠 숨김
    if (i > 0) {
      tl.to([step, content], { opacity: 0, x: -20, duration: ANIMS_CFG.UI_FADE }, startTime - ANIMS_CFG.UI_FADE);
    }

    // 새로운 콘텐츠 데이터 주입 및 노출
    tl.set(step, { textContent: `STEP 0${point.id}`, opacity: 0, x: 100 }, startTime);
    tl.set(content, { textContent: point.text, opacity: 0, x: 100 }, startTime);
    
    tl.to([step, content], { opacity: 1, x: 0, duration: ANIMS_CFG.CONTENT_SOFT, ease: 'power2.out' }, startTime);
    
    tl.fromTo(line, 
      { scaleX: 0, opacity: 0, x: 100 }, 
      { scaleX: 1, opacity: 0.9, x: 0, duration: ANIMS_CFG.CONTENT_SOFT, ease: 'power2.out' }, 
      startTime
    );
    
    // [V11.31 Strategy] 물리 엔진 연동: 타임라인 위치에 맞춰 물리 입자(Keywords) 생성/제거
    point.keywords.forEach((kw, kwIdx) => {
      tl.to({}, { 
        duration: ANIMS_CFG.PHYSICS_TRIGGER, 
        onStart: () => {
          if (isRestoringRef.current) return;
          falling.addKeyword(kw);
        }, 
        onReverseComplete: () => {
          if (isRestoringRef.current) return;
          falling.popKeyword(kw);
        }
      }, startTime + ANIMS_CFG.UI_FADE + (kwIdx * ANIMS_CFG.PHYSICS_GAP));
    });

    if (i < PAIN_POINTS.length - 1) {
      tl.to(line, { opacity: 0, duration: 0.2 }, startTime + itemGap - 0.2);
    }
  });

  // 브릿지 메시지 시퀀스
  const bridgeItems = RESONANCE_MESSAGE.bridge;
  const bridgeDuration = L[STAGES.PAIN_SHIFT] - L[STAGES.PAIN_CONTENT];
  const bridgeGap = bridgeDuration / bridgeItems.length;

  tl.to([step, line], { opacity: 0, duration: 0.2 }, L[STAGES.PAIN_CONTENT]);

  bridgeItems.forEach((text, i) => {
    const startTime = L[STAGES.PAIN_CONTENT] + (i * bridgeGap);
    tl.set(content, { textContent: text, opacity: 0 }, startTime);
    tl.to(content, { opacity: 1, duration: 0.2 }, startTime);
    tl.to(content, { opacity: 0, duration: 0.1 }, startTime + bridgeGap - 0.1);
  });

  // [V16.41 Physics Reset] 페인 섹션 종료 시 모든 키워드를 낙하시키고 물리 시뮬레이션 정리
  tl.to({}, { 
    duration: ANIMS_CFG.PHYSICS_RESET, 
    onStart: () => {
      if (isRestoringRef.current) return;
      falling.dropAll();
    },
    onReverseComplete: () => {
      if (isRestoringRef.current) return;
      falling.magneticReset();
    }
  }, L[STAGES.PAIN_SHIFT]);

  // 공명(Resonance) 섹션으로의 전환 및 배경색 변경
  tl.to(el, {
    left: '50%',
    backgroundColor: '#F7F4F0',
    border: 'none',
    duration: ANIMS_CFG.RESONANCE_BG,
    ease: EASE.TRANSITION
  }, L[STAGES.PAIN_SHIFT] + ANIMS_CFG.PHYSICS_RESET);

  // 메인 메시지 노출
  tl.set(content, { textContent: RESONANCE_MESSAGE.main, color: COLORS.TEXT.DARK, fontWeight: '700', opacity: 0, y: 20 }, L[STAGES.RESONANCE]);
  tl.to(content, { opacity: 1, y: 0, duration: ANIMS_CFG.MESSAGE_MOVE }, L[STAGES.RESONANCE]);

  tl.to(content, { opacity: 0, duration: ANIMS_CFG.UI_FADE }, L[STAGES.RESONANCE] + TIMING_CFG.SECTION_WEIGHT.RESONANCE_STILL - ANIMS_CFG.UI_FADE);

  // 다음 섹션(For Who) 이미지 준비
  if (nemo.imageEl) tl.to(nemo.imageEl, { opacity: 1, duration: 0.5 }, L[STAGES.TO_FORWHO] + 0.2);
}
