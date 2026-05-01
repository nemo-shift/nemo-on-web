import { gsap } from 'gsap';
import { GlobalBuilderOptions } from '../types';

/**
 * 섹션 스크롤링 타임라인 빌더
 */
/**
 * [V11.Macro_Final_Refine] buildSectionScrollTimeline
 * 섹션 이동 및 무대 환경(배경색, 헤더색) 제어권을 완전히 통합 관리합니다.
 */
export function buildSectionScrollTimeline(
  tl: gsap.core.Timeline, 
  L: Record<string, number>, 
  finalY: number, 
  options: GlobalBuilderOptions
) {
  const { constants, data } = options.registry;
  const { STAGES, TIMING_CFG, EASE, SECTION_SCROLL_HEIGHT } = constants;
  const { LOGO_JOURNEY_SECTIONS, JOURNEY_MASTER_CONFIG } = data;
  
  const target = '#sections-content-wrapper';
  if (typeof document !== 'undefined' && !document.querySelector(target)) return;

  const t = TIMING_CFG.TRANSITION_WEIGHT;
  const r = TIMING_CFG.TRANSITION_FINISH_RATIO;
  const H = SECTION_SCROLL_HEIGHT;

  // 1. 기초 레이아웃 영점 보정
  gsap.set('#home-stage', { minHeight: '100vh' });
  gsap.set(target, { position: 'absolute', top: 0, left: 0, width: '100vw' });

  // 2. 히어로 콘텐츠 패러랙스 상승 (무대 비우기)
  const heroTargets = typeof document !== 'undefined' 
    ? Array.from(document.querySelectorAll('#hero-on-center-phrase, #hero-on-center-stage'))
    : [];

  if (heroTargets.length > 0) {
    tl.to(heroTargets, {
      y: -150,
      duration: L[STAGES.HERO_STILL_END] - L[STAGES.HERO_STILL_CONTENT_RISE],
      ease: EASE.TRANSITION
    }, L[STAGES.HERO_STILL_CONTENT_RISE]);
  }

  // [V11.Macro_Final] 섹션별 물리적 스크롤 이동 (VHS 기반)
  tl.to(target, { y: `-${H.HERO}vh`, duration: t, ease: EASE.TRANSITION }, L[STAGES.START_TO_PAIN]);
  tl.to(target, { y: `-${H.HERO + H.PAIN}vh`, duration: t, ease: EASE.TRANSITION }, L[STAGES.PAIN_TO_MSG]);

  // [V18.Audit] 퍼널 조립 중에는 배경 고정, 팽창 시점에 맞춰 포후 섹션으로 전이
  const expandDuration = L[STAGES.TO_FORWHO] - L[STAGES.CORE_FUNNEL_EXPAND];
  tl.to(target, { 
    y: `-${H.HERO + H.PAIN + H.MESSAGE}vh`, 
    duration: expandDuration, 
    ease: EASE.TRANSITION 
  }, L[STAGES.CORE_FUNNEL_EXPAND]);

  tl.to(target, { y: `-${H.HERO + H.PAIN + H.MESSAGE + H.FORWHO}vh`, duration: t, ease: EASE.TRANSITION }, L[STAGES.FW_TO_STORY]);
  
  // [V11.4] 3단계: 스토리 -> CTA 전환 연출 옵션 설정
  // 나중에 터미널 그린 색상을 다시 확인하고 싶을 때 이 값을 true로 변경하세요.
  const STORY_TRANSITION_OPTS = {
    ENABLE_TERMINAL_GREEN: false, // 현재는 흰색 유지 (사용자 피드백 반영)
    TERMINAL_GREEN: '#00FF41'
  };
  
  // [V11.4] 4단계: 배경 전이(Teal -> Black) 완료 시점에 터미널 모드 활성화
  tl.to({}, {
    duration: 0.01, // 찰나의 순간에 상태를 변경하는 트리거 역할
    onComplete: () => {
      // 옵션이 활성화된 경우에만 텍스트 색상을 그린으로 변경
      if (STORY_TRANSITION_OPTS.ENABLE_TERMINAL_GREEN) {
        gsap.set('#story-text-4', { color: STORY_TRANSITION_OPTS.TERMINAL_GREEN });
      }
      // 터미널 깜빡이 커서 노출
      gsap.set('#story-cursor-4', { display: 'inline-block', opacity: 1 });
    },
    onReverseComplete: () => {
      // 역스크롤 시(CTA에서 다시 스토리로 올라올 때) 상태 원복
      if (STORY_TRANSITION_OPTS.ENABLE_TERMINAL_GREEN) {
        gsap.set('#story-text-4', { color: '#FFFFFF' }); // 다시 흰색으로
      }
      gsap.set('#story-cursor-4', { display: 'none', opacity: 0 });
    }
  }, L[STAGES.STORY_CONTENT] + t - 0.01);
  
  // [V11.4] 4.5단계: 백스페이스 삭제 브릿지 연출
  // 스크롤에 따라 글자가 뒤에서부터 한 글자씩 지워지는 물리적 효과를 구현합니다.
  const fullText = '불안을 끄고, 기준을 켭니다.\n\n이제 브랜드를 켤 차례입니다.';
  const eraseState = { length: fullText.length };

  // [Tuning] 커서 등장 후 충분히 머물렀다가 삭제가 시작되도록 0.5의 지연 시간(Offset) 추가
  tl.to(eraseState, {
    length: 0,
    ease: 'none',
    // 대기 시간이 늘어난 만큼 실제 삭제 애니메이션의 듀레이션 계산 조정
    duration: L[STAGES.TO_CTA] - (L[STAGES.STORY_ERASE] + 0.5),
    onUpdate: () => {
      const count = Math.floor(eraseState.length);
      const sliced = fullText.substring(0, count);
      gsap.set('#story-text-4', { textContent: sliced });
    }
  }, L[STAGES.STORY_ERASE] + 0.5);

  // [V11.4] 삭제 중에는 기차를 고정하여 터미널 연출의 몰입감을 높입니다.
  // 기차 이동을 여기서 하지 않고, 삭제가 완료된 후 TO_CTA에서 이동시킵니다.

  // [V11.4] 5단계: 백스페이스 삭제 완료 후 CTA 섹션으로 부드럽게 이동
  tl.to(target, {
    y: `-${H.HERO + H.PAIN + H.MESSAGE + H.FORWHO + H.STORY + H.BRIDGE}vh`,
    duration: t,
    ease: EASE.TRANSITION
  }, L[STAGES.TO_CTA]);

  // [V12.Overlay] 기차 안착 후 CTA 콘텐츠 등장
  tl.fromTo('#cta-content', 
    { opacity: 0, y: 100 },
    { opacity: 1, y: 0, duration: t * 0.8, ease: 'power2.out' }, 
    L[STAGES.TO_CTA] + 0.1
  );

  // [V12] 푸터 안착 시 부드러운 승차감(Easing) 테스트 적용
  tl.to(target, { y: -finalY, duration: t, ease: 'power2.out' }, L[STAGES.TO_FOOTER]);

  // 4. [V11.Macro_Final] 전역 환경(배경색/헤더색) 통합 엔진


  const heroCfg = JOURNEY_MASTER_CONFIG[STAGES.HERO];
  let lastEnv = (options.isOn && heroCfg.on?.env) ? heroCfg.on.env : heroCfg.env;

  // 초기 상태 강제 주입
  tl.set(document.documentElement, {
    '--bg': lastEnv.bg,
    '--header-fg': lastEnv.fg,
    '--scroll-hint-fg': lastEnv.hintFg || 'rgba(240, 235, 227, 0.6)'
  }, 0);

  LOGO_JOURNEY_SECTIONS.forEach(({ label, stage }: { label: string, stage: string }) => {
    const raw = JOURNEY_MASTER_CONFIG[stage];
    if (!raw) return;
    const cfg = options.isMobileView && raw.mobile ? { ...raw, ...raw.mobile } : raw;
    const time = L[label];

    // 포인트 구간별 환경 데이터 수립
    let targetEnv = cfg.env;
    if (label === STAGES.PAIN_TO_MSG) {
      targetEnv = JOURNEY_MASTER_CONFIG[STAGES.TO_MESSAGE].env;
    }

    // 환경 전이 (CSS 변수)
    // [V12_Refine] ForWho -> Story 구간은 문구 퇴장 시점에 맞춰 더 부드럽고 길게 전이
    const isForWhoToStory = label === STAGES.FW_TO_STORY;
    const transitionDuration = isForWhoToStory ? 1.5 * r : 
                               (label === STAGES.PAIN_TO_MSG || label === STAGES.TO_MESSAGE) ? 1.5 * r : t * r;
    
    tl.fromTo(document.documentElement, 
      { '--header-fg': lastEnv.fg, '--bg': lastEnv.bg, '--scroll-hint-fg': lastEnv.hintFg || 'rgba(240, 235, 227, 0.6)' },
      {
        '--header-fg': targetEnv.fg!,
        '--bg': targetEnv.bg!,
        '--scroll-hint-fg': targetEnv.hintFg || 'rgba(240, 235, 227, 0.6)',
        duration: transitionDuration,
        ease: isForWhoToStory ? 'power2.inOut' : 'none',
        immediateRender: false
      }, 
      isForWhoToStory ? time - (transitionDuration * 0.5) : time // ForWho 전환은 선제적으로 시작
    );


    lastEnv = { fg: targetEnv.fg!, bg: targetEnv.bg!, hintFg: targetEnv.hintFg };
  });

  // 5. [V12 Dynamic Scroll Hint Pacing] 다이내믹 스크롤 힌트 노출 제어
  // 애니메이션이나 글씨에 집중해야 하는 구간에서는 힌트를 끄고, 전환 직전(휴식 구간)에만 켭니다.
  const hintTarget = '#global-scroll-hint';
  
  // 1. Hero -> Pain
  // 네모가 안착한 뒤, 첫 번째 페인포인트 텍스트가 등장하는 시점(TO_PAIN + r * 0.4)에 숨김
  tl.to(hintTarget, { autoAlpha: 0, duration: t * 0.5, ease: 'power2.out' }, L[STAGES.TO_PAIN] + (r * 0.4));
  
  // 공명(Resonance) 문장 퇴장 시 기기별(PC/Touch) 타이밍 분리
  const isTouch = options.interactionMode === 'touch';
  const resonanceDuration = L[STAGES.PAIN_TO_MSG] - L[STAGES.RESONANCE];
  const resonanceHintInTime = isTouch 
    ? L[STAGES.PAIN_TO_MSG] - (t * 0.8) 
    : L[STAGES.PAIN_TO_MSG] - (resonanceDuration * 0.1); // PC는 구간이 길어 20% 지점 앞당겨 일찍 등장시킴

  tl.to(hintTarget, { autoAlpha: 1, duration: t * 0.5, ease: 'power2.in' }, resonanceHintInTime);

  // 2. Pain -> Message -> Core Funnel
  // 네모가 수직 박스로 완전히 안착한 뒤, 첫 메시지가 밑에서 위로 솟아오르며 뷰포트에 등장할 때 힌트를 숨김
  tl.to(hintTarget, { autoAlpha: 0, duration: t * 0.5, ease: 'power2.out' }, L[STAGES.TO_MESSAGE] + (t * 0.5));
  
  // 4번째 자동화 퍼널 박스가 등장하기 시작하는 시점 즈음 (전체 그리드 빌드 시간의 약 75% 지점)으로 앞당김
  const gridDuration = L[STAGES.CORE_FUNNEL_SNAP] - L[STAGES.CORE_FUNNEL_BUILD];
  const fourthFunnelFinishTime = L[STAGES.CORE_FUNNEL_BUILD] + (gridDuration * 0.75);
  tl.to(hintTarget, { autoAlpha: 1, duration: t * 0.5, ease: 'power2.in' }, fourthFunnelFinishTime);

  // 3. ForWho (가로 스와이프 구간)
  // * 참고: 포후 캐러셀 릴레이 제어는 forwho.ts 빌더 내부에 선행 구현되어 있음.

  // 4. Story -> CTA
  // 스토리를 본격적으로 읽기 시작할 때 숨기고, 스토리 백스페이스(삭제) 연출 시 재등장
  tl.to(hintTarget, { autoAlpha: 0, duration: t * 0.5, ease: 'power2.out' }, L[STAGES.TO_STORY]);
  tl.to(hintTarget, { autoAlpha: 1, duration: t * 0.5, ease: 'power2.in' }, L[STAGES.STORY_ERASE]);

  // 5. CTA 끝자락 (최종 소멸)
  // 터미널 타이핑이 끝나고 YES/NO 버튼이 완전히 나타날 때(TO_FOOTER 직전) 스크롤 힌트 완전 소멸
  tl.to(hintTarget, { autoAlpha: 0, duration: t * 0.5, ease: 'power2.out' }, L[STAGES.TO_FOOTER] - (t * 3));
}

