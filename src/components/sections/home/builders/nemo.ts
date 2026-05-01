import { gsap } from 'gsap';
import { SharedNemoHandle } from '../SharedNemo';
import { FallingKeywordsHandle } from '../FallingKeywordsStage';
import { PainSectionHandle } from '../pain/PainSection';
import { GlobalBuilderOptions } from '../types';

/**
 * [V11.55] buildNemoTimeline (Nemo Master Engine)
 * 네모(Nemo)의 전 여정(Hero ~ CTA) 및 기기별 최적 레이아웃을 제어하는 통합 빌더.
 */
export function buildNemoTimeline(
  tl: gsap.core.Timeline, 
  nemo: SharedNemoHandle, 
  options: GlobalBuilderOptions, 
  falling: FallingKeywordsHandle, 
  pain: React.RefObject<PainSectionHandle | null>,
  L: Record<string, number>,
  isRestoringRef: { current: boolean }
) {
  const { constants, data } = options.registry;
  const { 
    COLORS, STAGES, TIMING_CFG, EASE, ANIMS_CFG, NEMO_SIZE, NEMO_RESPONSIVE_LAYOUT
  } = constants;
  const { 
    JOURNEY_MASTER_CONFIG, PAIN_POINTS, RESONANCE_MESSAGE, NEMO_JOURNEY_SECTIONS 
  } = data;

  if (!nemo.nemoEl) return;
  const el = nemo.nemoEl;
  const t = TIMING_CFG.TRANSITION_WEIGHT;
  const r = TIMING_CFG.TRANSITION_FINISH_RATIO;

  // 현재 기기 모드 판단 (상수 키와 동기화)
  const mode: keyof typeof NEMO_RESPONSIVE_LAYOUT.PAIN_POINTS = 
    options.isMobileView ? 'MOBILE' : 
      options.isTabletPortrait ? 'TABLET_P' : 'PC';

  const isTouch = options.interactionMode === 'touch';
  const sections = NEMO_JOURNEY_SECTIONS;

  // 마스터 시트에 정의된 네모의 여정(Journey) 순차 실행
  // [V11.Macro_Final] ForWho 인트로 이미지는 해당 섹션 전까진 절대 노출되지 않도록 강제 초기화
  tl.set(nemo.imageEl, { opacity: 0 }, 0);

  sections.forEach(({ label, stage, ease }: { label: string, stage: string, ease?: any }) => {
    const raw = JOURNEY_MASTER_CONFIG[stage];
    if (!raw) return;
    
    let cfg = raw.nemo;
    
    // [V43] 동적 베이스라인 및 경로 오프셋 주입
    const initial = options.initialNemoPos;
    const heroLayout = NEMO_RESPONSIVE_LAYOUT.HERO[mode];
    
    // [V11.55 Priority Sync] 전 섹션 기기별 레이아웃 상수 우선 참조 로직 (정규화 완성)
    if (label === STAGES.HERO) {
      cfg = { 
        ...cfg, 
        width: initial?.width ?? heroLayout.w, 
        height: initial?.height ?? heroLayout.h, 
        left: initial?.left ?? heroLayout.left, 
        top: initial?.top ?? heroLayout.top 
      };
    } else if (label === STAGES.START_TO_PAIN) {
      const layout = NEMO_RESPONSIVE_LAYOUT.START_TO_PAIN[mode];
      
      // [V43.PathFix] 히어로 박스가 50%가 아닌 다른 곳에 있다면, 다음 지점도 그만큼 시프트하여 경로의 일관성을 유지합니다.
      let adjustedTop = layout.top;
      if (initial && typeof heroLayout.top === 'string' && heroLayout.top.endsWith('%')) {
        const vh = window.innerHeight;
        const heroConstantPx = (parseFloat(heroLayout.top) * vh) / 100;
        const offsetPx = initial.top - heroConstantPx;
        
        // 다음 목적지(layout.top)가 %일 경우 픽셀로 변환하여 오프셋 적용 후 다시 %화
        if (typeof layout.top === 'string' && layout.top.endsWith('%')) {
          const nextConstantPx = (parseFloat(layout.top) * vh) / 100;
          adjustedTop = `${((nextConstantPx + offsetPx) / vh) * 100}%`;
        }
      }

      cfg = { ...cfg, width: layout.w, height: layout.h, left: layout.left, top: adjustedTop };
    } else if (label === STAGES.TO_PAIN) {
      const layout = NEMO_RESPONSIVE_LAYOUT.PAIN_POINTS[mode];
      cfg = { ...cfg, width: layout.w, height: layout.h, left: layout.left, top: layout.top };
    } else if (label === STAGES.RESONANCE) {
      const layout = NEMO_RESPONSIVE_LAYOUT.RESONANCE[mode];
      cfg = { ...cfg, width: layout.w, height: layout.h, left: layout.left, top: layout.top };
    } else if (label === STAGES.PAIN_TO_MSG || label === STAGES.TO_MESSAGE) {
      const layout = NEMO_RESPONSIVE_LAYOUT.MESSAGE[mode];
      cfg = { ...cfg, width: layout.w, height: layout.h, left: layout.left, top: layout.top };
    } else if (label === STAGES.MSG_TO_FW || label === STAGES.TO_FORWHO) {
      const layout = NEMO_RESPONSIVE_LAYOUT.FORWHO[mode];
      cfg = { ...cfg, width: layout.w, height: layout.h, left: layout.left, top: layout.top };
    } else if (label === STAGES.FW_TO_STORY || label === STAGES.TO_STORY) {
      const layout = NEMO_RESPONSIVE_LAYOUT.STORY[mode];
      cfg = { ...cfg, width: layout.w, height: layout.h, left: layout.left, top: layout.top };
    } else if (label === STAGES.TO_CTA) {
      const layout = NEMO_RESPONSIVE_LAYOUT.CTA[mode];
      cfg = { ...cfg, width: layout.w, height: layout.h, left: layout.left, top: layout.top };
    }
    
    const time = L[label];

    // [V11.56 Sync] 메세지 섹션 전이 타이밍 최적화
    // PAIN_TO_MSG 브릿지 구간에서 이미 TO_MESSAGE의 형태와 색상을 지향하게 하여
    // 실제 메세지 섹션 도착 시점에 변신이 완료되어 있도록 함.
    if (label === STAGES.PAIN_TO_MSG) {
      const targetCfg = JOURNEY_MASTER_CONFIG[STAGES.TO_MESSAGE].nemo;
      cfg = { ...cfg, ...targetCfg };
    }

    tl.to(el, {
      width: cfg.width,
      height: cfg.height,
      borderRadius: cfg.borderRadius,
      backgroundColor: cfg.backgroundColor,
      border: cfg.border,
      left: cfg.left,
      top: cfg.top,
      opacity: cfg.opacity,
      rotation: 0,
      duration: (label === STAGES.PAIN_TO_MSG || label === STAGES.TO_MESSAGE) 
        ? 1.5 * r 
        : (label === STAGES.TO_PAIN) ? ANIMS_CFG.MESSAGE_MOVE * r : t * r,
      ease: ease
    }, time);
  });

  // (중간 로직 유지: 각 페인 포인트 애니메이션 및 물리 엔진 연동...)
  const step = nemo.stepEl, line = nemo.lineEl, content = nemo.contentEl;
  
  const waitOffset = 0.4 * r;
  const painDuration = (L[STAGES.PAIN_CONTENT] - (L[STAGES.TO_PAIN] + waitOffset));
  const itemGap = painDuration / PAIN_POINTS.length;
  const aniRatio = 0.3; // 입차 애니메이션 비중 (30%)
  const animDuration = itemGap * aniRatio;



  PAIN_POINTS.forEach((point: any, i: number) => {
    const startTime = L[STAGES.TO_PAIN] + waitOffset + (i * itemGap);
    // 이전 문구 퇴장: 다음 문구 입차 전에 여유 있게 사라짐
    if (i > 0) tl.to([step, content], { opacity: 0, x: -20, duration: animDuration * 0.5 }, startTime - animDuration * 0.5);
    
    tl.set(step, { textContent: `STEP 0${point.id}`, opacity: 0, x: 100 }, startTime);
    tl.set(content, { textContent: point.text, opacity: 0, x: 100 }, startTime);
    
    // 입차: 신속하게 등장 (30% 구간)
    tl.to([step, content], { opacity: 1, x: 0, duration: animDuration, ease: 'power2.out' }, startTime);
    
    tl.fromTo(line, { scaleX: 0, opacity: 0, x: 100 }, { scaleX: 1, opacity: 0.9, x: 0, duration: animDuration, ease: 'power2.out' }, startTime);
    
    point.keywords.forEach((kw: any, kwIdx: number) => {
      tl.to({}, { 
        duration: ANIMS_CFG.PHYSICS_TRIGGER, 
        onStart: () => { if (!isRestoringRef.current) falling.addKeyword(kw); }, 
        onReverseComplete: () => { if (!isRestoringRef.current) falling.popKeyword(kw); }
      }, startTime + animDuration + (kwIdx * ANIMS_CFG.PHYSICS_GAP));
    });
    
    if (i < PAIN_POINTS.length - 1) tl.to(line, { opacity: 0, duration: 0.2 }, startTime + itemGap - 0.2);
  });

  const bridgeItems = (RESONANCE_MESSAGE as any).bridge;
  const bridgeDelay = 1.2;
  const bridgeDuration = L[STAGES.PAIN_SHIFT] - (L[STAGES.PAIN_CONTENT] + bridgeDelay);
  const bridgeGap = bridgeDuration / bridgeItems.length;

  tl.to([step, line, content, '#pain-scroll-hint'], { opacity: 0, duration: 0.2 }, L[STAGES.PAIN_CONTENT]);

  bridgeItems.forEach((text: string, i: number) => {
    const startTime = L[STAGES.PAIN_CONTENT] + bridgeDelay + (i * bridgeGap);
    tl.set(content, { textContent: text, color: COLORS.TEXT.DARK, opacity: 0 }, startTime);
    tl.to(content, { opacity: 1, duration: 0.2 }, startTime);
    tl.to(content, { opacity: 0, duration: 0.1 }, startTime + bridgeGap - 0.1);
  });

  tl.to({}, { 
    duration: ANIMS_CFG.PHYSICS_RESET, 
    onStart: () => { if (!isRestoringRef.current) falling.dropAll(); },
    onReverseComplete: () => { if (!isRestoringRef.current) falling.magneticReset(); }
  }, L[STAGES.PAIN_SHIFT]);

  // 공명(Resonance) 1단계: 브릿지 메시지 구간 (박스 형태 유지)
  const bridgeLayout = NEMO_RESPONSIVE_LAYOUT.BRIDGE[mode];
  tl.to(el, {
    width: bridgeLayout.w,
    height: bridgeLayout.h,
    left: bridgeLayout.left,
    top: bridgeLayout.top,
    backgroundColor: '#F7F4F0',
    borderRadius: 12,                  // 브릿지 구간은 기존 박스 유지
    border: 'none',
    duration: 1.0 * r,                 // [V11.55 교정] 박스 선제적 안착
    ease: EASE.TRANSITION
  }, L[STAGES.PAIN_CONTENT]);

  // [V11.55 교정] 2단계: 모핑 구간 (PAIN_SHIFT에서 키워드 드랍과 동시에 선으로 변신)
  const resonanceLayout = NEMO_RESPONSIVE_LAYOUT.RESONANCE[mode];
  
  tl.to(el, {
    width: resonanceLayout.w,
    height: resonanceLayout.h,
    left: resonanceLayout.left,
    top: resonanceLayout.top,
    backgroundColor: COLORS.TEXT.LIGHT,
    borderRadius: 0,                   
    duration: 1.2 * r,                 // [V11.55 교정] 드랍 리듬에 맞춰 Snappy하게 변신
    ease: 'power2.out'
  }, L[STAGES.PAIN_SHIFT]);

  // [V11.55 교정] 3단계: 하위 인터랙션 연출 (PC 마퀴 vs 터치 ReactBits 스타일 슬라이드)
  const resonanceStart = L[STAGES.RESONANCE];
  const resonanceEnd = L[STAGES.PAIN_TO_MSG];
  const resonanceDuration = resonanceEnd - resonanceStart;

  if (!isTouch) {
    // [PC Mode] 기존 무한 마퀴 로직 유지 (범위를 120%로 확장하여 화면 밖에서 진입하도록 교정)
    const m1 = pain.current?.marqueeLine1;
    const m2 = pain.current?.marqueeLine2;
    const marqueeRange = 120;

    if (m1 && m2) {
      tl.set([m1, m2], { x: 0, xPercent: 0, opacity: 0 }, resonanceStart);
      tl.to([m1, m2], { opacity: 1, duration: 0.1 }, resonanceStart);
      
      // Line 1: 오른쪽 밖(70vw + 50%w) -> 왼쪽 밖(-70vw - 50%w)
      tl.fromTo(m1, 
        { x: '70vw', xPercent: 50 }, 
        { x: '-70vw', xPercent: -50, ease: 'none', duration: resonanceDuration }, 
        resonanceStart
      );
      
      // Line 2: 왼쪽 밖(-70vw - 50%w) -> 오른쪽 밖(70vw + 50%w)
      tl.fromTo(m2, 
        { x: '-70vw', xPercent: -50 }, 
        { x: '70vw', xPercent: 50, ease: 'none', duration: resonanceDuration }, 
        resonanceStart
      );
      
      tl.to([m1, m2], { opacity: 0, duration: 0.1 }, resonanceEnd - 0.1);
    }
  } else {
    // [Touch Mode] 4단계 ReactBits 스타일 글자 부상 시퀀스
    const slides = pain.current?.resonanceSlides;
    if (slides && slides.length >= 4) {
      const seg = resonanceDuration / 4; // 4단계 스크롤 분할

      slides.forEach((slide, i) => {
        if (!slide) return;
        const sStart = resonanceStart + (i * seg);
        const sEnd = sStart + seg;
        const chars = gsap.utils.toArray(slide.children);
        
        // 1. 입차 애니메이션: 아래에서 위로 부드럽게 부상 (ReactBits 스타일)
        tl.to(chars, { 
          y: 0, 
          opacity: 1, 
          stagger: 0.03, 
          duration: seg * 0.4, // 구간 내 40% 지점까지 애니메이션 완료 후 유지
          ease: 'power3.out' 
        }, sStart);

        // 2. 퇴장 처리: 다음 문장으로 넘어갈 때 효과 없이 즉시 제거
        if (i < 3) {
          tl.set(slide, { opacity: 0 }, sEnd);
        } else {
          // 마지막 문장은 섹션 전이 시작 시 퇴장
          tl.to(slide, { opacity: 0, duration: 0.1 }, resonanceEnd);
        }
      });
    }
  }

  // 감정 키워드 페이드 아웃 (메세지 섹션 전이 대응)
  tl.set('#falling-keywords-canvas', { opacity: 1 }, L[STAGES.TO_PAIN]);
  tl.to('#falling-keywords-canvas', { opacity: 0, duration: 0.8 * r }, L[STAGES.PAIN_TO_MSG]);

  // 다음 섹션(For Who) 이미지 준비
  // [V11.58] 메시지 -> 포후 전이 브릿지: 버스 이미지 선제적 노출 로직 제거
  // (이미지는 퍼널 단계의 결합/팽창 이후에 나타나도록 재설계됨)
}
