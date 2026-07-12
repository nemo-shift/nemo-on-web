'use client';

import React, { useRef, useImperativeHandle, forwardRef, useEffect } from 'react';
import { useScramble } from '@/hooks/useScramble';
import { NemoIcon } from '@/components/ui';
import { cn } from '@/lib';
import { LOGO_COLOR_CFG } from '@/constants/interaction';

/**
 * JourneyLogoHandle
 * GlobalInteractionStage(GSAP 마스터 타임라인)가 로고 각 파트를 직접 제어하기 위한 DOM 핸들.
 * 각 ref는 GSAP tween의 타깃으로 사용됨.
 */
export interface JourneyLogoHandle {
  containerEl: HTMLDivElement | null;
  /** RECTANGLE 로고 전체 — MSG_CONTENT 구간에서 페이드인 */
  rectangleEl: HTMLDivElement | null;
  /** 'T' 문자를 구성하는 십자 선 — T→+ 모핑 애니메이션용 */
  tLines: {
    h: HTMLDivElement | null; // 가로 선
    v: HTMLDivElement | null; // 세로 선
  };
  /** 영문 'nemo' — HERO·BRAND STORY 구간 표시 */
  nemoEnEl: HTMLDivElement | null;
  /** 한글 '네모' — PAIN 구간 크로스페이드로 전환 */
  nemoKrEl: HTMLDivElement | null;
  /** 도형 세트 (삼각형 + 원) */
  shapesEl: HTMLDivElement | null;
  /** 'on' / 'off' 스크램블 텍스트 */
  statusEl: HTMLDivElement | null;
}

interface JourneyLogoProps {
  isOn: boolean;
  progress?: number;
  isTransitioning?: boolean;
  onLogoClick?: () => void; // [V11.19] 정밀 히트박스를 위한 클릭 핸들러
}

/**
 * JourneyLogo
 * 홈 히어로에 고정된 브랜드 로고. 섹션 진행에 따라 GSAP이 각 파트를 개별 제어함.
 *
 * 레이어 구조:
 *   Layer A  — [nemoEn | nemoKr] (CSS Grid 스택, 크로스페이드) + 도형 + on/off
 *   Layer B  — RECTANGLE (MSG_CONTENT 구간에서 Layer A를 대체)
 *
 * 폰트:
 *   nemoEn   → font-syne
 *   nemoKr   → font-esamanru
 *   on/off   → font-gmarket
 *
 * 크기 시스템:
 *   모바일(~743px)    : clamp + 25vw 급경사 (360px 기준값 유지, 대형폰까지 스케일)
 *   tablet-p(744~991px): clamp + 18~23vw (구간 전체를 고르게 사용)
 *   tablet 이상       : 기존 clamp 유지
 */
const JourneyLogo = forwardRef<JourneyLogoHandle, JourneyLogoProps>(
  (_props, ref) => {
    const { isOn, isTransitioning } = _props;

    // ── DOM refs ──────────────────────────────────────────────────────────
    const containerRef = useRef<HTMLDivElement>(null);
    const nemoEnRef = useRef<HTMLDivElement>(null);
    const nemoKrRef = useRef<HTMLDivElement>(null);
    const shapesRef = useRef<HTMLDivElement>(null);
    const statusRef = useRef<HTMLDivElement>(null);
    const rectangleRef = useRef<HTMLDivElement>(null);
    const tLineHRef = useRef<HTMLDivElement>(null); // RECTANGLE 'T' 가로 선
    const tLineVRef = useRef<HTMLDivElement>(null); // RECTANGLE 'T' 세로 선

    // ── 스크램블 (on ↔ off 전환 타격감) ──────────────────────────────────
    const { scrambledText, startScramble } = useScramble();
    // 마운트 시 불필요한 스크램블을 막기 위해 현재 상태로 초기화
    const prevTargetRef = useRef<string>((_props.isOn || _props.isTransitioning) ? 'on' : 'off');

    useEffect(() => {
      const target = (isOn || isTransitioning) ? 'on' : 'off';
      // 전환 중이거나 타깃이 바뀌면 즉시 스크램블 발동
      if (prevTargetRef.current !== target || isTransitioning) {
        startScramble(target, 450);
        prevTargetRef.current = target;
      }
    }, [isOn, isTransitioning, startScramble]);

    // ── 외부 핸들 노출 (GSAP 타임라인이 직접 접근) ───────────────────────
    useImperativeHandle(ref, () => ({
      get containerEl() { return containerRef.current; },
      get nemoEnEl() { return nemoEnRef.current; },
      get nemoKrEl() { return nemoKrRef.current; },
      get shapesEl() { return shapesRef.current; },
      get statusEl() { return statusRef.current; },
      get rectangleEl() { return rectangleRef.current; },
      tLines: {
        get h() { return tLineHRef.current; },
        get v() { return tLineVRef.current; }
      }
    }));

    // ── 색상 ──────────────────────────────────────────────────────────────
    const activeLogoColors = isOn ? LOGO_COLOR_CFG.ON : LOGO_COLOR_CFG.OFF;
    // nemo/네모/도형: 헤더 포털에서 var(--header-fg) 상속
    const colorStyle = { color: 'inherit' };
    // on/off: isOn 상태에 따라 별도 색상 (0.7s 전환)
    const statusColorStyle = {
      color: activeLogoColors.TEXT,
      transition: 'color 0.7s ease'
    };

    return (
      <div
        ref={containerRef}
        className="journey-logo flex items-baseline select-none gap-1 tablet-p:gap-3 tablet:gap-[clamp(18px,calc(-4px+2.5vw),34px)] desktop-wide:gap-[clamp(34px,calc(16px+1.3vw),46px)] desktop-cap:gap-[46px] h-auto"
        style={{ willChange: 'transform' }}
      >

        {/* ── Layer A-1/A-2: 브랜드명 (CSS Grid 스택) ──────────────────────
            nemoEn과 nemoKr이 같은 grid cell을 공유 → 레이아웃 이동 없이 크로스페이드.
            GSAP이 opacity/visibility를 제어해 섹션별로 전환:
              HERO · BRAND STORY → nemoEn(영문) 표시
              PAIN               → nemoKr(한글) 표시
        ─────────────────────────────────────────────────────────────────── */}
        <div
          className="inline-grid cursor-pointer"
          role="button"
          tabIndex={0}
          aria-label="로고 클릭"
          onClick={_props.onLogoClick}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); _props.onLogoClick?.(); } }}
        >
          {/* nemoEn — 초기 표시 레이어 */}
          <div
            ref={nemoEnRef}
            style={{ gridArea: '1 / 1', ...colorStyle }}
            className="font-syne font-light text-[clamp(58px,calc(-22px+25vw),84px)] tablet-p:text-[clamp(134px,calc(2px+18vw),200px)] tablet:text-[clamp(190px,calc(105px+8.5vw),205px)] desktop-wide:text-[clamp(185px,calc(82px+7.2vw),220px)] desktop-cap:text-[220px] tracking-tight self-end justify-self-start"
          >
            nemo
          </div>

          {/* nemoKr — 초기 숨김 (GSAP이 PAIN 진입 시 페이드인) */}
          <div
            ref={nemoKrRef}
            style={{ gridArea: '1 / 1', ...colorStyle }}
            className="font-esamanru font-light text-[clamp(58px,calc(-22px+25vw),84px)] tablet-p:text-[clamp(134px,calc(2px+18vw),200px)] tablet:text-[clamp(190px,calc(105px+8.5vw),205px)] desktop-wide:text-[clamp(185px,calc(82px+7.2vw),220px)] desktop-cap:text-[220px] tracking-normal self-end justify-self-start opacity-0 invisible"
          >
            네모
          </div>
        </div>

        {/* ── 도형 (NemoIcon) ───────────────────────────────────────────────
            삼각형 + 원. em 단위로 폰트 크기에 비례해 스케일됨.
            pulseAbt 애니메이션으로 미세하게 맥동.
            GSAP이 PAIN→MSG 전환 시 shapesEl 전체를 fade/scale 제어.
        ─────────────────────────────────────────────────────────────────── */}
        <div
          ref={shapesRef}
          className="flex items-center justify-center child-nemo-logo-engine cursor-pointer"
          style={{ willChange: 'transform' }}
          onClick={_props.onLogoClick}
        >
          <NemoIcon
            className={cn('opacity-80 nemo-logo-engine')}
            triangleColor={activeLogoColors.TRIANGLE}
            circleColor={activeLogoColors.CIRCLE}
            triangleStyle={{ animation: 'pulseAbt 2.5s ease-in-out infinite' }}
            circleStyle={{ animation: 'pulseAbt 2.5s ease-in-out 0.5s infinite' }}
            // 모바일: 작은 em값 / tablet-p 이상: 큰 em값
            triangleClassName="border-l-[0.22em] border-r-[0.22em] border-b-[0.35em] tablet-p:border-l-[0.45em] tablet-p:border-r-[0.45em] tablet-p:border-b-[0.7em] desktop-wide:border-l-[0.38em] desktop-wide:border-r-[0.38em] desktop-wide:border-b-[0.6em] transform -translate-y-[0.05em] desktop-wide:translate-y-[0.05em]"
            circleClassName="w-[0.35em] h-[0.35em] tablet-p:w-[0.7em] tablet-p:h-[0.7em] desktop-wide:w-[0.6em] desktop-wide:h-[0.6em] border-[0.12em]"
            gapClassName={cn(
              'gap-[0.15em]',
              'tablet-p:gap-[0.25em]',
              'tablet:gap-[0.4em]',
              'desktop-wide:gap-[0.35em]',
              'desktop-cap:gap-[0.65em]'
            )}
          />
        </div>

        {/* ── on / off 텍스트 (스크램블) ───────────────────────────────────
            isOn 상태 전환 시 useScramble이 글자를 노이즈로 섞다가 타깃 문자로 수렴.
            색상은 LOGO_COLOR_CFG에서 ON/OFF별로 정의, 0.7s 전환.
            모바일: -translate-y로 베이스라인 미세 보정.
        ─────────────────────────────────────────────────────────────────── */}
        <div
          ref={statusRef}
          className="font-gmarket font-light -translate-y-[6px] tablet-p:-translate-y-[8px] tablet:-translate-y-[18px] desktop-wide:-translate-y-[14px] text-[clamp(60px,calc(-32px+25vw),82px)] tablet-p:text-[clamp(128px,calc(-43px+23vw),200px)] tablet:text-[clamp(165px,calc(85px+8vw),183px)] desktop-wide:text-[clamp(175px,calc(75px+7.2vw),210px)] desktop-cap:text-[210px] tracking-tight min-w-[clamp(54px,calc(-36px+25vw),84px)] tablet-p:min-w-[clamp(155px,calc(-43px+23vw),210px)] tablet:min-w-[clamp(170px,calc(8vw+10vw),250px)] desktop-wide:min-w-[clamp(250px,calc(-25px+19vw),380px)] desktop-cap:min-w-[380px] cursor-pointer"
          style={statusColorStyle}
          onClick={_props.onLogoClick}
        >
          {scrambledText || (isOn ? 'on' : 'off')}
        </div>

        {/* ── Layer B: RECTANGLE ────────────────────────────────────────────
            MSG_CONTENT 구간에서 Layer A를 대체하는 브랜드 풀네임.
            초기: opacity-0 / pointer-events-none (GSAP이 타이밍에 맞춰 페이드인).
            'T' 글자는 실제 폰트 대신 CSS 선 두 개로 구현 → T→+ 모핑 가능.
        ─────────────────────────────────────────────────────────────────── */}
        <div
          ref={rectangleRef}
          className={cn(
            'absolute inset-0 flex items-baseline font-gmarket opacity-0 pointer-events-none gap-[0.02em] cursor-pointer',
            'text-[clamp(56px,calc(60px+1.5vw),80px)]',
            'tablet-p:text-[clamp(130px,calc(-170px+32vw),250px)]',
            'tablet:text-[clamp(190px,calc(105px+8.5vw),205px)]',
            'desktop-wide:text-[clamp(185px,calc(82px+7.2vw),220px)]',
            'desktop-cap:text-[220px]'
          )}
          style={colorStyle}
          onClick={_props.onLogoClick}
        >
          <span className="font-bold">REC</span>

          {/* 'T' 모핑 컨테이너: 가로 선이 중앙으로 이동하면 '+' 완성 */}
          <div className="relative inline-flex items-start justify-center flex-shrink-0 w-[0.65em] h-[0.76em] translate-y-[0.06em]">
            {/* 가로 선 — GSAP이 top 값을 조정해 T→+ 모핑 */}
            <div
              ref={tLineHRef}
              className="absolute left-0 top-0 w-full h-[0.14em] bg-current rounded-sm"
              style={{ transition: 'top 0.3s ease' }}
            />
            {/* 세로 선 — 고정 */}
            <div
              ref={tLineVRef}
              className="w-[0.14em] h-[1.5em] bg-current rounded-sm"
            />
          </div>

          <span className="font-bold">ANGLE</span>
        </div>

      </div>
    );
  },
);

JourneyLogo.displayName = 'JourneyLogo';

export default JourneyLogo;
