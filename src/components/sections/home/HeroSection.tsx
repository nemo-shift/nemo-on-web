"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { useDeviceDetection, useParticles } from "@/hooks";
import { PointRingCursor } from "@/components/ui";
import { runWipeTransition } from "@/lib";
import type { HeroSectionProps } from "@/types";
import HeroTrueFocusSlogan from "./hero/HeroTrueFocusSlogan";
import HeroOffSlogan from "./hero/HeroOffSlogan";
import HeroToggle from "./hero/HeroToggle";
import ShapesStage from "./hero/ShapesStage";
import HeroPhraseLayer from "./hero/HeroPhraseLayer";
import HeroOffCta from "./hero/HeroOffCta";
import HeroBigTypo from "./hero/HeroBigTypo";
import HeroBottomBar from "./hero/HeroBottomBar";
import { COLORS } from "@/constants/colors";

/**
 * HeroSection 컴포넌트
 *
 * 홈페이지 메인 히어로 영역.
 * - OFF 상태: 어두운 배경 #0a0a0a, 크림 텍스트 #f0ebe3
 * - ON 상태: 밝은 크림 배경 #faf7f2, 다크 텍스트 #0d1a1f
 * - 와이프 전환 효과 (틸 원 확장 후 배경 전환)
 * - 파티클 캔버스 배경 (useParticles)
 * - PointRingCursor 커스텀 커서
 *
 * @param {boolean} isOn - 현재 ON/OFF 상태
 * @param {() => void} onToggle - 토글 애니메이션 포함 핸들러
 *
 * Example usage:
 * <HeroSection isOn={isOn} onToggle={handleToggle} />
 */
export default function HeroSection({
  isOn,
  onToggle,
}: HeroSectionProps): React.ReactElement {
  const { isMobile } = useDeviceDetection();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // 캔버스 ref
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isGathering, setIsGathering] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isTitleDown, setIsTitleDown] = useState(false);
  useParticles(canvasRef, isOn, isGathering);

  const tcRef = useRef<HTMLDivElement>(null);
  const [phraseVisible, setPhraseVisible] = useState(true);
  const [shapesOnRevealed, setShapesOnRevealed] = useState(false);
  const [showCenteredShapes, setShowCenteredShapes] = useState(false);
  const [sequenceStep, setSequenceStep] = useState(0); // 0: OFF, 1: 원, 2: 세모, 3: 네모, 4: 전체합체, 5: 슬로건
  const shapesStageRef = useRef<HTMLDivElement>(null);
  const [isToggleHovered, setIsToggleHovered] = useState(false);
  // [v25.21] 특정 단어 터치 시 강조할 도형 상태 ('all', 'circle', 'triangle', 'square')
  const [activeShape, setActiveShape] = useState<'all' | 'circle' | 'triangle' | 'square'>('all');

  useEffect(() => {
    setShapesOnRevealed(false);
    // ON 모드 진입 시 시퀀스 초기화 및 시작
    if (isOn) {
      setIsGathering(false);
      setShowCenteredShapes(false);
      setIsTransitioning(false);
      setIsTitleDown(false);
      // 감성적 딜레이: 0.8초 후 첫 번째 문구 등장
      const timer = setTimeout(() => {
        setSequenceStep(1);
      }, 800);
      return () => clearTimeout(timer);
    } else {
      setSequenceStep(0);
      setActiveShape('all'); // 오프 모드 시 상태 초기화
    }
  }, [isOn]);

  // 온모드 시퀀스 타이밍 제어
  useEffect(() => {
    if (!isOn || sequenceStep === 0 || sequenceStep >= 5) return;

    // 초기 단계(1단계: 원)는 인지도를 위해 충분히(1.8초), 나머지는 경쾌하게(1.1초)
    const interval = sequenceStep === 1 ? 1800 : 1100; 

    const timer = setTimeout(() => {
      setSequenceStep((prev) => prev + 1);
    }, interval);

    return () => clearTimeout(timer);
  }, [isOn, sequenceStep]);


  // [v25.23] 하단 타이틀 인터랙션 시 프레이즈 영역에 표시될 문구 상태
  const [isInteractionActive, setIsInteractionActive] = useState(false);
  const interactionTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const handleTitleInteraction = useCallback((active: boolean) => {
    // 온모드 시퀀스가 모두 완료된 후(Step 4)부터 상호작용 가능
    if (!isOn || sequenceStep < 4) return;
    
    if (isMobile) {
      if (active) {
        setIsInteractionActive(true);
        if (interactionTimerRef.current) clearTimeout(interactionTimerRef.current);
        // [v25.26] 모바일은 적절한 시간(1.5초) 후 자동 복구
        interactionTimerRef.current = setTimeout(() => {
          setIsInteractionActive(false);
        }, 1500);
      }
    } else {
      // [v25.26] PC는 마우스 호버 여부에 따라 상태 결정
      setIsInteractionActive(active);
    }
  }, [isOn, sequenceStep, isMobile]);

  const wipeRef = useRef<HTMLDivElement>(null);

  const handleToggle = useCallback(() => {
    if (!isOn) {
      // 1. 스위치 즉시 반응 시작
      setIsTransitioning(true);
      setIsTitleDown(true);
      // 이후 HeroBigTypo에서 스크램블이 시작되고, 완료 시 handleScrambleComplete 호출
    } else {
      onToggle();
    }
  }, [isOn, onToggle]);

  const handleScrambleComplete = useCallback(() => {
    // 1. 스크램블 완료 후 파티클 수렴 시작
    setIsGathering(true);
    // 중앙 도형 등장은 제거함 (사용자 요청)

    // 2. 수렴 효과 감상 후 즉시 와이프 실행
    setTimeout(() => {
      setIsTitleDown(false); // 와이프 시작과 동시에 타이틀 상승 시작
      runWipeTransition(wipeRef.current, onToggle);
    }, 1200);
  }, [onToggle]);

  // [v25.22] 모바일 원터치 지속(Timed) 인터랙션 제어
  const activeShapeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleActiveShapeChange = useCallback((shape: 'all' | 'circle' | 'triangle' | 'square') => {
    setActiveShape(shape);

    if (isMobile) {
      if (activeShapeTimerRef.current) clearTimeout(activeShapeTimerRef.current);
      
      // 터치 시 1.5초 후 자동으로 'all'로 복구
      if (shape !== 'all') {
        activeShapeTimerRef.current = setTimeout(() => {
          setActiveShape('all');
        }, 1500);
      }
    }
  }, [isMobile]);


  // CSS 변수 주입 (ON/OFF에 따른 색상 토큰)
  const cssVars = useMemo(() => {
    return {
      "--bg": isOn ? COLORS.BG.CREAM : COLORS.BG.DARK,
      "--fg": isOn ? COLORS.TEXT.DARK : COLORS.TEXT.LIGHT,
      "--accent": isOn ? COLORS.BRAND.TEAL : COLORS.BRAND.GOLD,
      "--sub": isOn ? COLORS.BRAND.DEEP_TEAL : COLORS.BRAND.BROWN,
    } as React.CSSProperties;
  }, [isOn]);

  const wipeOverlay =
    mounted && typeof document !== "undefined" ? (
      <div
        ref={wipeRef}
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 0,
          height: 0,
          opacity: 0,
          background: "#0891b2",
          zIndex: 500,
          pointerEvents: "none",
          borderRadius: 0,
        }}
      />
    ) : null;

  const portalContent = mounted && typeof document !== "undefined";

  return (
    <div style={cssVars}>
      <PointRingCursor isOn={isOn} />

      {mounted && wipeOverlay && createPortal(wipeOverlay, document.body)}

      {portalContent &&
        createPortal(
          <div style={cssVars}>
            <HeroBottomBar isOn={isOn} />
          </div>,
          document.body,
          "hero-bottom-bar",
        )}


      <section
        style={{
          ...cssVars,
          position: "relative",
          zIndex: 10,
          width: "100vw",
          height: "100svh",
          display: "flex",
          flexDirection: "column",
          padding: isMobile ? "24px 20px" : "36px 48px",
          background: "var(--bg)",
          color: "var(--fg)",
          transition: "background 0.7s ease, color 0.7s ease",
          overflow: "hidden",
        }}
      >
        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 0,
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 5,
            pointerEvents: "none",
            opacity: isOn ? 0.02 : 0.06, // OFF 모드에서 노이즈 질감 강화
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundSize: "200px",
            transition: "opacity 1s ease",
          }}
        />

        <div style={{ minHeight: "64px", flexShrink: 0 }} />

        <div
          ref={tcRef}
          className="relative z-30 w-full flex-shrink-0"
          style={{
            marginTop: isMobile ? "0px" : "0", // 상단 더 밀착
            opacity: showCenteredShapes ? 0 : 1, 
            transition: "opacity 0.5s ease",
            minHeight: isMobile ? "280px" : "180px", // 모바일 높이 상향 (스위치 자리 미리 확보)
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
            gap: "24px"
          }}
        >
          {/* Header Area (Slogan & Toggle) - 절대 흔들리지 않는 프레임 */}
          <div 
            className={isMobile ? "px-5" : "px-[48px]"} 
            style={{ 
              position: "relative",
              width: "100%",
              marginTop: isMobile ? "5px" : "6vh", 
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              justifyContent: isMobile ? "flex-start" : "space-between",
              alignItems: isMobile ? "flex-start" : "flex-end",
              pointerEvents: "none",
              zIndex: 100,
              flexShrink: 0 // 상단 영역 크기 고수
            }}
          >
              {/* 슬로건 영역 (Editorial Grid) */}
              <div 
                className="relative flex-shrink-0" 
                style={{ 
                  width: isMobile ? "100%" : "auto",
                  height: isMobile ? "120px" : "fit-content", // 2줄 높이로 상시 박제 (ON/OFF 동일)
                  pointerEvents: "auto",
                  display: "flex",
                  justifyContent: "flex-start",
                  transform: isMobile ? "translateY(55px)" : "none" 
                }}
              >
                <div style={{ position: "relative", width: isMobile ? "100%" : "600px", height: "100%" }}>
                  <div className="absolute top-0 left-0 w-full flex justify-start">
                    <HeroTrueFocusSlogan 
                      isOn={isOn && (isMobile ? sequenceStep >= 4 : sequenceStep >= 1)} 
                      sentence="불안을 끄고, 기준을 켭니다" 
                    />
                  </div>
                  <div className="absolute top-0 left-0 w-full flex justify-start">
                    <HeroOffSlogan 
                      isVisible={!isOn} 
                      isToggleHovered={isToggleHovered}
                      isMobile={isMobile}
                      isTransitioning={isTransitioning} // prop 전달
                      onToggle={handleToggle}
                    />
                  </div>
                </div>
              </div>

              {/* 스위치 영역 (헤더 내 위치 박제) */}
              <div 
                className="flex-shrink-0" 
                style={{ 
                  top: isMobile ? "115px" : "0px", // 125px에서 115px로 미세 상향 조정
                  left: isMobile ? "20px" : "auto",
                  zIndex: 50,
                  pointerEvents: "auto",
                  transform: isMobile ? "none" : "none" 
                }}
                onMouseEnter={() => setIsToggleHovered(true)}
                onMouseLeave={() => setIsToggleHovered(false)}
              >
               <HeroToggle
                 isOn={isOn}
                 onToggle={handleToggle}
                 isTransitioning={isTransitioning}
               />
             </div>
          </div>
        </div>

        <div
          style={{
            position: "relative",
            zIndex: showCenteredShapes ? 600 : 20,
            width: "100%", 
            flexShrink: 0,
            marginTop: "0px", // 레이아웃 밀림 방지를 위해 마진 제거
            minHeight: isMobile ? "220px" : "320px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            pointerEvents: "none",
            transform: (isMobile && isOn) ? "translateY(-35px)" : "none" // -5px -> -35px로 추가 상향
          }}
        >
          <HeroPhraseLayer
            isOn={isOn}
            visible={phraseVisible && !showCenteredShapes}
            isMobile={isMobile}
            sequenceStep={sequenceStep}
            onActiveShapeChange={handleActiveShapeChange}
            onCopyVisible={() => setShapesOnRevealed(true)}
            isInteractionActive={isInteractionActive} // [v25.23] 변주 메시지 활성화 여부
          />
          {/* [v25.16] PC/모바일 공통 중앙 CTA 복원 (isMobile 필터 해제) */}
          {!isOn && (
            <div 
              className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none"
              style={{
                transform: isMobile ? "translateY(-55px)" : "none" 
              }}
            >
              <div className="pointer-events-auto">
                <HeroOffCta 
                  isVisible={true} 
                  isToggleHovered={isToggleHovered}
                  isMobile={isMobile}
                  isTransitioning={isTransitioning}
                  onToggle={handleToggle}
                />
              </div>
            </div>
          )}
          <ShapesStage
            ref={shapesStageRef}
            isOn={isOn} 
            isMobile={isMobile}
            onModeRevealed={shapesOnRevealed}
            isCentered={showCenteredShapes}
            sequenceStep={sequenceStep}
            activeShape={activeShape} // [v25.21] 필터링용 상태 전달
          />
        </div>

        {/* [v12] 완충 공간 (Spacer Buffer): 상단 시프트를 하단 타이틀에 전달하지 않음 */}
        <div className="flex-1 min-h-[20px]" />

        <div
          style={
            isMobile
              ? { flexShrink: 0, minHeight: "40px", height: "40px" } // 하단 여백 추가하여 옹기종기 해결
              : { flex: 1, minHeight: 0 }
          }
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            zIndex: 20,
            flexShrink: 0,
            gap: isMobile ? "40px" : "20px", 
            marginBottom: isMobile ? "145px" : "60px", // 100px -> 145px로 추가 상향 (하단 여백을 늘려 위로 밀어올림)
            transition: "none"
          }}
        >
          <HeroBigTypo
            isOn={isOn}
            isMobile={isMobile}
            tcRef={tcRef}
            shapesStageRef={shapesStageRef}
            sequenceStep={sequenceStep} // [v25.25] 활성화 제어용
            onInteraction={handleTitleInteraction}
            isTransitioning={isTransitioning}
            isTitleDown={isTitleDown}
            onScrambleComplete={handleScrambleComplete}
          />
        </div>
      </section>
    </div>
  );
}
