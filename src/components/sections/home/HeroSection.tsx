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
import HeroSlogan from "./hero/HeroSlogan";
import HeroToggle from "./hero/HeroToggle";
import ShapesStage from "./hero/ShapesStage";
import HeroPhraseLayer from "./hero/HeroPhraseLayer";
import HeroBigTypo from "./hero/HeroBigTypo";
import HeroBottomBar from "./hero/HeroBottomBar";

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
  useParticles(canvasRef, isOn);

  const tcRef = useRef<HTMLDivElement>(null);
  const [phraseVisible, setPhraseVisible] = useState(true);
  const [shapesOffColonHidden, setShapesOffColonHidden] = useState(false);
  const [shapesOffHovered, setShapesOffHovered] = useState(false);
  const [shapesOnRevealed, setShapesOnRevealed] = useState(false);
  const shapesStageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setShapesOnRevealed(false);
  }, [isOn]);

  // 모바일 OFF 모드: 도형모음 터치 후 2초 뒤 자동 숨김
  const mobileOffTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  useEffect(() => {
    if (!isMobile || isOn || !shapesOffHovered) return;
    clearTimeout(mobileOffTimerRef.current);
    mobileOffTimerRef.current = setTimeout(() => {
      setShapesOffHovered(false);
      setShapesOffColonHidden(false);
    }, 2000);
    return () => clearTimeout(mobileOffTimerRef.current);
  }, [isMobile, isOn, shapesOffHovered]);

  const flashTextRef = useRef<HTMLDivElement>(null);
  const flashTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  const flashMessage = useCallback(
    (text: string) => {
      if (!isOn) return;
      const el = flashTextRef.current;
      if (!el) return;

      setPhraseVisible(false);
      clearTimeout(flashTimerRef.current);

      let displayText = text;
      if (isMobile && text.length >= 5) {
        displayText = text.slice(0, 3) + "\n" + text.slice(3);
      }
      el.textContent = displayText;
      el.style.whiteSpace = "pre-line";
      el.style.animation = "none";
      void (el as HTMLDivElement).offsetWidth;
      el.style.animation = "flashIn 1.2s ease-out forwards";

      flashTimerRef.current = setTimeout(() => {
        setPhraseVisible(true);
      }, 1200);
    },
    [isOn, isMobile],
  );

  const wipeRef = useRef<HTMLDivElement>(null);

  const handleToggle = useCallback(() => {
    if (!isOn) {
      runWipeTransition(wipeRef.current, onToggle);
    } else {
      onToggle();
    }
  }, [isOn, onToggle]);

  const handleCopyVisible = useCallback(() => setShapesOnRevealed(true), []);

  // CSS 변수 주입 (ON/OFF에 따른 색상 토큰)
  const cssVars = useMemo(
    () =>
      ({
        "--bg": isOn ? "#faf7f2" : "#0a0a0a",
        "--fg": isOn ? "#0d1a1f" : "#f0ebe3",
        "--accent": isOn ? "#0891b2" : "#e8d5b0",
        "--sub": isOn ? "#0e7490" : "#c4a882",
      }) as React.CSSProperties,
    [isOn],
  );

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
        )}

      {portalContent &&
        createPortal(
          <div
            style={{
              ...cssVars,
              position: "fixed",
              inset: 0,
              zIndex: 300,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "none",
            }}
          >
            <div
              ref={flashTextRef}
              style={{
                fontFamily: "var(--font-bebas)",
                fontSize: "clamp(90px, 14vw, 200px)",
                color: "var(--accent)",
                opacity: 0,
                transform: "scale(0.7)",
                transition: "none",
                textAlign: "center",
              }}
            />
          </div>,
          document.body,
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
            opacity: 0.025,
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundSize: "200px",
          }}
        />

        <div style={{ minHeight: "64px", flexShrink: 0 }} />

        <div
          ref={tcRef}
          style={{
            position: "relative",
            zIndex: 20,
            maxWidth: "54%",
            flexShrink: 0,
            ...(isMobile ? { marginTop: "24px" } : {}),
          }}
        >
          <HeroSlogan isOn={isOn} isMobile={isMobile} />
          <HeroToggle isOn={isOn} onToggle={handleToggle} />
        </div>

        <div
          style={{
            position: "relative",
            zIndex: 20,
            flexShrink: 0,
            minHeight: "clamp(200px, 32vh, 380px)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <HeroPhraseLayer
            isOn={isOn}
            visible={phraseVisible}
            isMobile={isMobile}
            onCopyVisible={handleCopyVisible}
          />
          <ShapesStage
            ref={shapesStageRef}
            isOn={isOn}
            isMobile={isMobile}
            offModeVisible={shapesOffHovered}
            onModeRevealed={shapesOnRevealed}
          />
        </div>

        <div
          style={
            isMobile
              ? { flexShrink: 0, minHeight: "24px", height: "24px" }
              : { flex: 1, minHeight: 0 }
          }
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            zIndex: 20,
            flexShrink: 0,
          }}
        >
          <HeroBigTypo
            isOn={isOn}
            isMobile={isMobile}
            tcRef={tcRef}
            shapesStageRef={shapesStageRef}
            offShapes={{
              colonHidden: shapesOffColonHidden,
              hovered: shapesOffHovered,
              onColonHide: setShapesOffColonHidden,
              onTriCirHover: setShapesOffHovered,
            }}
            onFlash={flashMessage}
          />
        </div>
      </section>
    </div>
  );
}
