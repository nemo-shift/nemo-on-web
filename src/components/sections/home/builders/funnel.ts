import { gsap } from 'gsap';
import { SharedNemoHandle } from '../SharedNemo';
import { GlobalBuilderOptions } from '../types';

/**
 * [V18.Phase2] buildCoreFunnelTimeline
 * 메시지 섹션 종료 후 Core Funnel 브릿지 시퀀스의 도입부를 관장합니다.
 * 
 * 시퀀스:
 * 1. 네모가 그리드 1번 자리(좌측)로 이동
 * 2. 배경에 빅타이포("네모:ON Driven Core Funnel")가 회색으로 페이드인
 */

interface CoreFunnelSlot {
  w: string;
  h: string;
  left: string;
  top: string;
}

export function buildCoreFunnelTimeline(
  tl: gsap.core.Timeline,
  nemo: SharedNemoHandle,
  L: Record<string, number>,
  options: GlobalBuilderOptions
): number[] {
  if (!nemo.nemoEl) return [];

  const { constants } = options.registry;
  const { STAGES, TIMING_CFG, EASE } = constants;
  const r = TIMING_CFG.TRANSITION_FINISH_RATIO;

  const el = nemo.nemoEl;

  // 기기별 모드 판별 (v18.Fix: 구체적인 범위부터 체크)
  const mode = options.isTabletPortrait ? 'TABLET_P' :
               options.isMobile ? 'MOBILE' : 'PC';

  // ── Phase 2: 네모의 1번 자리 하이재킹 및 배경 리빌 ──
  const funnelStart = L[STAGES.CORE_FUNNEL_START];
  const funnelBuild = L[STAGES.CORE_FUNNEL_BUILD];
  const funnelSnap = L[STAGES.CORE_FUNNEL_SNAP];
  const moveDuration = (funnelBuild - funnelStart) * r;

  // [V18.Fix] 퍼널 진입 시 버스 이미지 및 기존 페인 요소 강제 은닉
  tl.set(nemo.imageEl, { opacity: 0 }, funnelStart);
  tl.set([nemo.stepEl, nemo.lineEl, nemo.contentEl], { opacity: 0 }, funnelStart);

  // 모든 퍼널 요소에 GSAP 엔진 레벨 중앙 정렬 강제 적용 (v18.Phase3.5)
  // CSS translate를 대체하여 완벽한 물리적 중앙점 일치 확보
  tl.set(['#sub-nemo-2', '#sub-nemo-3', '#sub-nemo-4', '[id^="funnel-arrow-"]', '[id^="funnel-label-"]', el], {
    xPercent: -50,
    yPercent: -50,
    top: (i) => {
      // 초기 셋팅 시 각 요소의 목적지 top 값을 미리 점유 (v18.Phase5.Fix)
      if (i === 5) return slot1.top; // el (SharedNemo)
      if (i < 3) return slots[i + 1].top; // sub-nemos
      return '50%'; // arrows, labels (애니메이션 시점에 다시 셋팅됨)
    }
  }, funnelStart);

  // 1번 슬롯 좌표 (기기별 상세 상수 참조)
  const slots: CoreFunnelSlot[] = constants.NEMO_RESPONSIVE_LAYOUT.CORE_FUNNEL_SLOTS[mode];
  const slot1 = slots[0];

  // 네모를 정사각형으로 변형하며 1번 슬롯으로 이동 (기기별 top 동기화)
  tl.to(el, {
    width: slot1.w,
    height: slot1.h,
    left: slot1.left,
    top: slot1.top, 
    borderRadius: 0,
    opacity: 1,
    duration: moveDuration,
    ease: EASE.TRANSITION,
  }, funnelStart);

  // 이미지 강제 비노출 유지
  if (nemo.imageEl) {
    tl.to(nemo.imageEl, {
      opacity: 0,
      duration: moveDuration * 0.2,
      ease: 'none',
    }, funnelStart);
  }

  // 배경 빅타이포 리빌
  const typoEl = document.getElementById('core-funnel-background-typo');
  if (typoEl) {
    tl.fromTo(typoEl, 
      { opacity: 0, scale: 0.95 },
      {
        opacity: 1,
        scale: 1,
        y: mode === 'MOBILE' ? '-8vh' : (mode === 'TABLET_P' ? '-7vh' : 0), // [V18.Exp5.FineTune] 모바일은 더 내림
        duration: moveDuration * 1.2,
        ease: 'power2.out',
      },
      funnelStart
    );
  }

  // ── Phase 3: 그리드 순차 빌드 (Staggered Build) ──
  // L[STAGES.CORE_FUNNEL_BUILD] 시점에서 스태거 시퀀스 시작
  const gridStart = funnelBuild;
  const gridSnap = funnelSnap;
  const gridDuration = (gridSnap - gridStart) * r;
  
  const itemDuration = gridDuration / 4; 
  const segmentRatio = 0.6; 
  
  slots.forEach((target: CoreFunnelSlot, i: number) => {
    const startTime = gridStart + (i * itemDuration);
    const animTime = itemDuration * segmentRatio;

    // A. 슬롯 박스 애니메이션
    if (i === 0) {
      // 1번 박스 텍스트 리빌 (SharedNemo)
      tl.set(`#funnel-label-${i + 1}`, {
        left: slot1.left,
        top: slot1.top,
        width: slot1.w,
        height: slot1.h,
        opacity: 0,
        y: 10
      }, startTime);

      tl.to(`#funnel-label-${i + 1}`, {
        opacity: 1,
        y: 0,
        duration: animTime,
        ease: 'power2.out'
      }, startTime);
    } else {
      const subBox = `#sub-nemo-${i + 1}`;
      tl.set(subBox, {
        width: target.w,
        height: target.h,
        left: target.left,
        top: target.top,
        opacity: 0,
        scale: 0.8
      }, startTime);

      tl.to(subBox, {
        opacity: 1,
        scale: 1,
        duration: animTime,
        ease: 'back.out(1.4)'
      }, startTime);

      // 보조 박스 텍스트 리빌
      tl.set(`#funnel-label-${i + 1}`, {
        left: target.left,
        top: target.top,
        width: target.w,
        height: target.h,
        opacity: 0,
        y: 10
      }, startTime);

      tl.to(`#funnel-label-${i + 1}`, {
        opacity: 1,
        y: 0,
        duration: animTime,
        ease: 'power2.out'
      }, startTime);
    }

    // B. 커넥터 화살표 (>) 애니메이션
    if (i < 3) {
      const arrow = `#funnel-arrow-${i + 1}`;
      const nextTarget = slots[i + 1];
      
      const arrowX = `calc((${target.left} + ${nextTarget.left}) / 2)`;
      const arrowY = `calc((${target.top} + ${nextTarget.top}) / 2)`;
      
      // [V18.Phase5] 화살표 자동 회전 로직 (대각선 대응)
      // PC(1x4)는 수평(0)이며, 모바일/태블릿(2x2)의 2->3 구간은 회전이 필요함
      let rotation = 0;
      if (mode !== 'PC') {
        const x1 = parseFloat(target.left);
        const x2 = parseFloat(nextTarget.left);
        const y1 = parseFloat(target.top);
        const y2 = parseFloat(nextTarget.top);

        if (y2 > y1 || x2 < x1) {
          // 각도 계산 (라디안 -> 도)
          const angle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);
          rotation = angle;
        }
      }

      tl.set(arrow, {
        left: arrowX,
        top: arrowY,
        opacity: 0,
        scale: 0.5,
        xPercent: -50,
        yPercent: -50,
        rotation: rotation, // 계산된 각도 적용
        x: -10
      }, startTime + (animTime * 0.5));

      tl.to(arrow, {
        opacity: 1,
        scale: 1,
        x: 0,
        duration: animTime * 0.5,
        ease: 'power2.out'
      }, startTime + (animTime * 0.5));
    }
  });


  // ── Phase 4: 합체 및 거대 팽창 (Conjunction & Expansion) ──
  // L[STAGES.CORE_FUNNEL_SNAP] ~ L[STAGES.CORE_FUNNEL_EXPAND]: 중앙 합체
  // L[STAGES.CORE_FUNNEL_EXPAND] ~ L[STAGES.TO_FORWHO]: 대팽창 및 이미지 리빌
  
  const funnelExpand = L[STAGES.CORE_FUNNEL_EXPAND];
  const funnelFinish = L[STAGES.TO_FORWHO];
  const mergeDuration = (funnelExpand - gridSnap) * r;
  const expandDuration = (funnelFinish - funnelExpand) * r;

  // A. 중앙 합체 (Magnetic Merge)
  // 모든 화살표와 라벨 제거
  tl.to(['[id^="funnel-arrow-"]', '[id^="funnel-label-"]'], {
    opacity: 0,
    duration: mergeDuration * 0.5,
    ease: 'power2.out'
  }, gridSnap);

  // 모든 박스 중앙 집결 (현재 높이 유지하며 수평으로만 결합)
  tl.to(['#sub-nemo-2', '#sub-nemo-3', '#sub-nemo-4', el], {
    left: '50%',
    top: slot1.top, // [V18.Fix] 50%로 튀지 않고 현재 높이 유지
    duration: mergeDuration,
    ease: 'power3.inOut'
  }, gridSnap);

  // B. 거대 팽창 및 이미지 리빌 (Expansion)
  // 합체된 순간 보조 박스들을 완전히 감추고 SharedNemo가 주도
  tl.set(['#sub-nemo-2', '#sub-nemo-3', '#sub-nemo-4'], { opacity: 0 }, funnelExpand);

  const forwhoLayout = constants.NEMO_RESPONSIVE_LAYOUT.FORWHO[mode];

  // 메인 박스 팽창 (커지면서 화면 중앙 50%로 자연스럽게 이동)
  tl.to(el, {
    width: forwhoLayout.w,
    height: forwhoLayout.h,
    left: '50%',
    top: '50%', // 다음 섹션 핸드오버를 위해 50%로 복귀
    duration: expandDuration,
    ease: 'expo.inOut'
  }, funnelExpand);

  // 이미지 리빌 (Expansion과 동시에 서서히 등장)
  if (nemo.imageEl) {
    tl.to(nemo.imageEl, {
      opacity: 1,
      backgroundPosition: (forwhoLayout as any).bgPos || 'center', // [V18.Phase5] 기기별 맞춤 구도 적용
      duration: expandDuration,
      ease: 'power2.inOut'
    }, funnelExpand);
  }

  // 배경 빅타이포 최종 제거
  if (typoEl) {
    tl.to(typoEl, {
      opacity: 0,
      scale: 1.1,
      duration: expandDuration * 0.5,
      ease: 'power2.in'
    }, funnelExpand);
  }

  // 스냅 포인트 구성: [1~4단계 빌드 피크들] + [중앙 합체 지점] + [최종 팽창 완료 지점]
  const buildPoints = slots.map((_: CoreFunnelSlot, i: number) => gridStart + (i * itemDuration) + (itemDuration * segmentRatio));
  return [
    ...buildPoints,
    funnelExpand,   // 합체 완료 시점
    funnelFinish    // 팽창 완료 및 이미지 리빌 완료 시점
  ];
}


