"use client";

import React, { useEffect, useRef, useState } from "react";
import { homeContent } from "@/data/homeContent";
import { useBigTypoSizing } from "@/hooks";
import { runExplodeFromColon, runFlyToShapes, runImplodeToColon } from "@/lib";
import type { HeroBigTypoProps } from "@/types";

/**
 * HeroBigTypo — 빅 타이포 + 플래시 마우스오버 + flyParticle
 */
export default function HeroBigTypo({
  isOn,
  isMobile = false,
  tcRef,
  shapesStageRef,
  offShapes,
  onFlash,
  onExplodeComplete,
}: HeroBigTypoProps): React.ReactElement {
  const { bigTypo } = homeContent.hero;
  const { btRef, nemoRef, onRef, triRef, cirRef, colonRef } = useBigTypoSizing(
    tcRef,
    isMobile,
  );
  const [coverRevealed, setCoverRevealed] = useState(false);
  const [visible, setVisible] = useState(false);

  const flashMessage = (text: string): void => {
    if (!isOn) return;
    onFlash?.(text);
  };

  const flyToShapes = (): void => {
    const tri = triRef.current;
    const cir = cirRef.current;
    if (!tri || !cir) return;
    runFlyToShapes(
      tri,
      cir,
      shapesStageRef?.current ?? null,
      offShapes.onColonHide,
      offShapes.onTriCirHover,
    );
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(true);
      setCoverRevealed(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const prevIsOnRef = useRef<boolean | null>(null);
  useEffect(() => {
    if (prevIsOnRef.current === null) {
      prevIsOnRef.current = isOn;
      return;
    }
    const tri = triRef.current;
    const cir = cirRef.current;
    if (!tri || !cir) return;

    if (isOn) {
      runExplodeFromColon(tri, cir, () => onExplodeComplete?.());
    } else {
      runImplodeToColon(tri, cir);
    }
    prevIsOnRef.current = isOn;
  }, [isOn]);

  return (
    <>
      <style>{`
        .bt-on-mode .bt-hover-nemo:hover { transform: scale(1.06); }
        .bt-on-mode .bt-hover-tri:hover { transform: scale(1.2); filter: brightness(1.15); }
        .bt-on-mode .bt-hover-cir:hover { transform: scale(1.25); background: var(--accent) !important; }
        .bt-on-mode .bt-hover-on:hover { transform: scale(1.06); }
        .bt-on-mode .bt-hover-on:hover > span { filter: brightness(1.15); }
        .bt-hover-nemo, .bt-hover-tri, .bt-hover-cir, .bt-hover-on {
          display: inline-block;
          transition: transform 0.35s ease, filter 0.35s ease, background 0.35s ease;
        }
      `}</style>
      <div
        ref={btRef}
        className={isOn ? "bt-on-mode" : undefined}
        style={{
          position: "relative",
          zIndex: 20,
          marginTop: "auto",
          paddingTop: "clamp(16px, 2.5vh, 36px)",
          display: "flex",
          alignItems: "center",
          overflow: "visible",
          opacity: visible ? 1 : 0,
          // 컨테이너는 동일하게 두고, 네모/ON만 개별적으로 내려서 도형 위치는 유지
          transform: visible ? "translateY(0)" : "translateY(50px)",
          transition:
            "opacity 1s ease, transform 1.2s cubic-bezier(0.16,1,0.3,1)",
        }}
      >
        <span
          ref={nemoRef}
          className="bt-hover-nemo"
          data-bt="nemo"
          onMouseEnter={() => flashMessage("당신의 결로")}
          style={{
            fontFamily: "var(--font-esamanru)",
            color: isOn ? "var(--fg)" : "rgba(240,235,227,.18)",
            lineHeight: 0.88,
            whiteSpace: "nowrap",
            // PC에서는 네모 텍스트만 약간 더 아래로 내려, 도형과의 간격을 맞춤
            transform: isMobile ? "none" : "translateY(0.18em)",
            transition: "color .7s ease, transform .7s ease",
            cursor: isOn ? "pointer" : "default",
          }}
        >
          {bigTypo.nemo}
        </span>

        <span
          ref={colonRef}
          onMouseEnter={() => !isOn && !isMobile && flyToShapes()}
          onClick={() => !isOn && isMobile && flyToShapes()}
          onMouseLeave={() =>
            !isOn &&
            (offShapes.onColonHide(false), offShapes.onTriCirHover(false))
          }
          style={{
            display: "inline-flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            // 세미콜론 전체를 네모/ON 사이로 강하게 끌어올림
            transform: "translateY(-0.8em)",
            opacity: !isOn && offShapes.colonHidden ? 0 : 1,
            transition: "opacity 0.2s ease, transform 0.2s ease",
          }}
        >
          <span
            ref={triRef}
            className="bt-hover-tri"
            data-bt="tri"
            onMouseEnter={() => flashMessage("구조를 더해")}
            onClick={() => !isOn && isMobile && flyToShapes()}
            style={{
              display: "block",
              width: 0,
              height: 0,
              // 한 단계 더 크게 키워도 네모/ON 대비 과하지 않은 최대 크기
              borderLeft: "13px solid transparent",
              borderRight: "13px solid transparent",
              borderBottom: "24px solid var(--accent)",
              // 그룹 전체를 위로 올렸으므로 개별 삼각형은 중심 정렬
              transition: "border-bottom-color .7s ease",
              cursor: isOn ? "pointer" : "default",
            }}
          />
          <span
            ref={cirRef}
            className="bt-hover-cir"
            data-bt="cir"
            onMouseEnter={() => flashMessage("감성위에")}
            onClick={() => !isOn && isMobile && flyToShapes()}
            style={{
              display: "block",
              borderRadius: "50%",
              background: "var(--sub)",
              // 동그라미도 삼각형과 비율 맞게 더 키움
              width: "18px",
              height: "18px",
              // 세모와 동그라미 사이 간격을 더 벌려 시각적 여유 확보
              marginTop: "6px",
              // 동그라미도 그룹 기준으로 중앙 정렬
              transition: "background .7s ease",
              cursor: isOn ? "pointer" : "default",
            }}
          />
        </span>

        <span
          ref={onRef}
          className="bt-hover-on"
          data-bt="on-on"
          onMouseEnter={() => flashMessage("함께")}
          style={{
            fontFamily: "var(--font-gmarket)",
            lineHeight: 0.88,
            whiteSpace: "nowrap",
            // PC에서는 ON 텍스트도 네모와 동일하게 살짝 내려 배치
            transform: isMobile ? "none" : "translateY(0.18em)",
            position: "relative",
            cursor: isOn ? "pointer" : "default",
          }}
        >
          <span
            style={{
              color: "rgba(240,235,227,.45)",
              opacity: isOn ? 0 : 1,
              transition: "opacity .8s ease",
            }}
          >
            {bigTypo.off}
          </span>
          <span
            style={{
              color: "var(--accent)",
              position: "absolute",
              left: 0,
              top: 0,
              opacity: isOn ? 1 : 0,
              transition: "opacity .8s ease",
            }}
          >
            {bigTypo.on}
          </span>
        </span>

        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "var(--bg)",
            transformOrigin: "left",
            transform: coverRevealed ? "scaleX(0)" : "scaleX(1)",
            opacity: coverRevealed ? 0 : 1,
            transition:
              "transform 1s cubic-bezier(0.77,0,.18,1), opacity 0.5s ease, background .7s",
            zIndex: 2,
            pointerEvents: "none",
          }}
        />
      </div>
    </>
  );
}
