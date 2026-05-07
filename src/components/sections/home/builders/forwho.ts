import { gsap } from 'gsap';
import { STAGES } from '@/constants/interaction';
import { ForWhoSectionHandle } from '../forwho/ForWhoSection';
import { GlobalBuilderOptions } from '../types';

import { SharedNemoHandle } from '../SharedNemo';
import { getForWhoTargetRect } from '../global-interaction-utils';
import { FOR_WHO_LIST } from '@/data/home/forwho';

/**
 * [V12] buildForWhoTimeline
 * ForWho Section Builder with Cinematic Finale
 */
export function buildForWhoTimeline(
  tl: gsap.core.Timeline,
  L: Record<string, number>,
  forwho: ForWhoSectionHandle | null,
  nemo: SharedNemoHandle | null,
  options: GlobalBuilderOptions,
  toggle?: () => void // Step 3: Logo Toggle 추가
) {
  if (!forwho || !nemo?.nemoEl) return;

  const { constants, data } = options.registry;
  const { isMobile, isMobileView, isTabletPortrait } = options;
  const { NEMO_RESPONSIVE_LAYOUT, EASE, TIMING_CFG } = constants;
  const FORWHO_FRAME = NEMO_RESPONSIVE_LAYOUT.FORWHO_FRAME;
  
  const start = L[STAGES.TO_FORWHO];        
  const end = L[STAGES.FW_TO_STORY];         
  
  const mode = options.isMobileView ? 'MOBILE' : 
               options.isTabletPortrait ? 'TABLET_P' : 'PC';
               
  const r = TIMING_CFG.TRANSITION_FINISH_RATIO;
  const isTouch = options.interactionMode === 'touch';
  
  const duration = (end - start);
  const effectiveEnd = start + duration * (isTouch ? 0.35 : 0.6);
  const effectiveDuration = (effectiveEnd - start);

  const introRatio = isTouch ? 0.03 : 0.25;
  const introEnd = start + (effectiveDuration * introRatio); 
  const frameMorphStart = introEnd;

  // STEP B: Intro Reveal
  const t = TIMING_CFG.TRANSITION_WEIGHT;
  const revealDuration = isTouch ? (0.25 * r) : (0.5 * r);
  const revealStartOffset = isTouch ? 0 : (t * r * 0.5);

  if (forwho.introTextRef.current) {
    tl.to(forwho.introTextRef.current, {
      opacity: 1,
      y: 0,
      duration: revealDuration,
      ease: 'power2.out'
    }, start + revealStartOffset);

    tl.call(() => {
      forwho.resetCards();
    }, [], start);

    // [V43.Fix] 다른 페이지 복귀 시 남아있는 이미지 왜곡 잔상을 강제로 초기화
    if (nemo.imageEl) {
      tl.set(nemo.imageEl, { 
        scaleX: 1, 
        scaleY: 1, 
        skewX: 0, 
        filter: 'blur(0px)',
        autoAlpha: 1,
        immediateRender: false 
      }, start);
    }
  }

  // STEP C: Carousel Transformation
  const frame = FORWHO_FRAME[mode];

  // [V43.Fix] %, vw, vh 단위를 px 단위로 변환 (모바일/태블릿 픽셀 퍼펙트 대응)
  const getSafePos = (val: string | number, isWidth: boolean) => {
    if (typeof val === 'number') return val;
    const str = val.toString();
    const base = isWidth ? window.innerWidth : window.innerHeight;
    
    if (str.includes('%')) return base * (parseFloat(str) / 100);
    if (str.includes('vw')) return window.innerWidth * (parseFloat(str) / 100);
    if (str.includes('vh')) return window.innerHeight * (parseFloat(str) / 100);
    
    return parseFloat(str) || 0;
  };

  // [V43.Detail] 브라우저 원본 값을 사용하여 서브픽셀 오차 방지
  const getTargetW = () => getForWhoTargetRect()?.width ?? getSafePos(frame.w, true);
  const getTargetH = () => getForWhoTargetRect()?.height ?? getSafePos(frame.h, false);
  const getTargetL = () => getForWhoTargetRect()?.left ?? getSafePos(frame.left, true);
  const getTargetT = () => getForWhoTargetRect()?.top ?? getSafePos(frame.top, false);

  tl.to(nemo.nemoEl, {
    width: () => getTargetW() - 2,  // 양쪽 보더(1px * 2) 고려
    height: () => getTargetH() - 2, // 상하 보더(1px * 2) 고려
    left: () => getTargetL() + 1,   // 보더 두께만큼 안쪽으로 이동
    top: () => getTargetT() + 1,
    borderRadius: frame.borderRadius,
    duration: (effectiveEnd - frameMorphStart) * r,
    ease: EASE.TRANSITION
  }, frameMorphStart);

  if (nemo.imageEl) {
    const morphDuration = (effectiveEnd - frameMorphStart) * r;
    const distortionStart = frameMorphStart + (morphDuration * 0.7); 
    const distortionDuration = morphDuration * 0.3; 

    tl.to(nemo.imageEl, {
      skewX: isTouch ? 50 : 60, 
      scaleX: isTouch ? 2.0 : 2.5, 
      filter: isTouch ? 'blur(1px)' : 'blur(2px)', 
      duration: distortionDuration,
      ease: isTouch ? 'none' : 'power2.in' 
    }, distortionStart);

    // [Fix] 글로벌 스크롤 힌트 퇴장: 캐러셀 등장 전 이미지 왜곡 시점에 선제적으로 페이드아웃
    tl.to('#global-scroll-hint', {
      autoAlpha: 0,
      duration: distortionDuration,
      ease: 'power2.inOut'
    }, distortionStart);

    const swapPoint = distortionStart + distortionDuration;
    
    // [V43.Fix] 버스 이미지 페이드아웃 가속 (0.3s -> 0.1s)
    tl.to([nemo.nemoEl, nemo.imageEl], { 
      autoAlpha: 0, 
      duration: 0.1, 
      ease: 'none',
      immediateRender: false 
    }, swapPoint);

    if (forwho.contentWrapperRef.current) {
      // 캐러셀 등장 시점을 버스 이미지 소멸 시점과 더 밀접하게 동기화
      tl.set(forwho.contentWrapperRef.current, { autoAlpha: 0, transition: 'none', immediateRender: false }, frameMorphStart);
      // [V63] 삼위일체 동기화: 캐러셀 안착 즉시 드래그 허용
      tl.set(forwho.contentWrapperRef.current, { 
        autoAlpha: 1, 
        pointerEvents: "auto", // 드래그 즉시 허용
        transition: 'none', 
        immediateRender: false 
      }, swapPoint); 
      
      // [V51] 안착 시점에 화살표 및 힌트 즉시 노출 (효과 없이 딱!)
      // [V63] 삼위일체 동기화: 안착 시점에 화살표 및 힌트 즉시 노출 (오프셋 0)
      tl.set("#forwho-arrows, #forwho-scroll-hint", {
        autoAlpha: 1,
        pointerEvents: "auto",
        immediateRender: false // 안착 전 노출 방지 핵심 설정
      }, swapPoint); 
      
      // [V49] 기기별 맞춤 타이틀 트랜스포메이션 (Mobile / Tablet / PC 분기)
      if (forwho.introTextRef.current) {
        const titleEl = forwho.introTextRef.current.querySelector('h2');
        const animDuration = 0.8;
        const animStart = swapPoint - 0.8;


        // 2. 위치 및 디자인 이동 애니메이션
        if (!isMobileView) {
          // [V57] PC: 수평 이동(Side-ways) 시네마틱 궤적 복원
          const titleEl = forwho.introTextRef.current?.querySelector('h2');
          tl.to(forwho.introTextRef.current, {
            left: "5%",
            top: "50%", // 안착 지점
            yPercent: -50,
            xPercent: 0,
            duration: 1.2,
            ease: "power3.inOut"
          }, animStart);

          if (titleEl) {
            tl.to(titleEl, {
              lineHeight: 1.4,
              color: "#1a1a1a",
              duration: 1.2,
              ease: "power3.inOut"
            }, animStart);
          }
        } else if (isTabletPortrait) {
          // [V57] Tablet Portrait: 카드 위 좌측 상단 안착
          const titleEl = forwho.introTextRef.current?.querySelector('h2');
          tl.to(forwho.introTextRef.current, {
            left: "8%",
            top: "15%", // 카드 이미지 위 여백
            yPercent: 0,
            xPercent: 0,
            duration: 1.2,
            ease: "power3.inOut"
          }, animStart);

          if (titleEl) {
            tl.to(titleEl, {
              lineHeight: 1.4,
              color: "#4e4c4cff",
              textAlign: "left",
              duration: 1.2,
              ease: "power3.inOut"
            }, animStart);
          }
        } else if (isMobile) {
          // [V57] Mobile: 카드 위 좌측 상단 정밀 안착
          const titleEl = forwho.introTextRef.current?.querySelector('h2');
          tl.to(forwho.introTextRef.current, {
            left: "8%",
            top: "20%", // 사용자 지정 안착 지점
            yPercent: 0,
            xPercent: 0,
            duration: 1.2,
            ease: "power3.inOut"
          }, animStart);

          if (titleEl) {
            tl.to(titleEl, {
              lineHeight: 1.4,
              color: "#4e4c4cff", 
              textAlign: "left",
              duration: 1.2,
              ease: "power3.inOut"
            }, animStart);
          }
        }
      }
    }
  }


  // STEP D & E: [V12 Unified] Carousel Lifecycle & Philosophy Reveal + Finale
  if (forwho.contentWrapperRef.current && forwho.philosophyRef.current) {
    const totalPhaseDuration = (end - effectiveEnd);
    
    // D-1. 카드 등장 (Reveal)
    const revealPhaseStart = effectiveEnd;
    const revealPhaseDuration = totalPhaseDuration * 0.15;
    
    tl.to(forwho.contentWrapperRef.current, {
      autoAlpha: 1,
      pointerEvents: 'auto',
      yPercent: 0, 
      duration: revealPhaseDuration,
      ease: 'power2.out'
    }, revealPhaseStart);

    // D-2. 카드 퇴장 (Exit) & 문구 노출 (Philosophy Reveal)
    const exitStart = effectiveEnd + totalPhaseDuration * 0.25;
    const exitDuration = totalPhaseDuration * 0.45;

    tl.to(forwho.contentWrapperRef.current, {
      yPercent: -150,
      force3D: true,
      duration: exitDuration,
      ease: 'none' 
    }, exitStart);

    // [Step 4] 글로벌 스크롤 힌트 재등장 (바통 터치 종료) & 가로 힌트 선제적 퇴장
    tl.to('#forwho-scroll-hint', {
      autoAlpha: 0,
      duration: exitDuration * 0.2,
      ease: 'power2.inOut'
    }, exitStart - (exitDuration * 0.1)); // 카드 이동 시작 전 선제적으로 숨김

    tl.to('#global-scroll-hint', {
      autoAlpha: 1,
      duration: exitDuration * 0.5,
      ease: 'none'
    }, exitStart);

    if (forwho.introTextRef.current) {
      tl.to(forwho.introTextRef.current, {
        yPercent: -150,
        opacity: 0,
        duration: exitDuration,
        ease: 'none'
      }, exitStart);
    }

    tl.to(forwho.philosophyRef.current, {
      autoAlpha: 1,
      duration: exitDuration * 0.5,
      ease: 'none'
    }, exitStart);

    // E. 피날레 (Finale): 철학 문구 퇴장 및 로고 전환
    const finaleStart = exitStart + exitDuration + totalPhaseDuration * 0.1;
    const finaleDuration = totalPhaseDuration * 0.2;

    // 철학 문구 상단 퇴장
    tl.to(forwho.philosophyRef.current, {
      yPercent: -100,
      autoAlpha: 0,
      duration: finaleDuration,
      ease: 'power2.inOut'
    }, finaleStart);

    // 문구 올라가는 시점에 로고 전격 교체 (REC+ANGLE -> 네모:ON)
    if (toggle) {
      tl.call(() => {
        toggle();
      }, [], finaleStart);
    }

    // 섹션 이탈 시 최종 리셋
    tl.call(() => {
      forwho.resetCards();
    }, [], end);
  }
}
