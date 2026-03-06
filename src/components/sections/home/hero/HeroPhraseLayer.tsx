"use client";

import React, { useEffect, useState } from "react";
import { homeContent } from "@/data/homeContent";
import PhraseLine from "./PhraseLine";

type HeroPhraseLayerProps = {
  isOn: boolean;
  visible?: boolean;
  isMobile?: boolean;
  onCopyVisible?: () => void;
};

/**
 * HeroPhraseLayer — 프레이즈 3줄 (도형 포함)
 * 줄1: ○ 감성위에 / 줄2: 구조 △를 더해 / 줄3: 당신의 □로
 */
export default function HeroPhraseLayer({
  isOn,
  visible = true,
  isMobile = false,
  onCopyVisible,
}: HeroPhraseLayerProps): React.ReactElement {
  const { phrases } = homeContent.hero;
  const [lineVisible, setLineVisible] = useState([false, false, false]);
  const [circleHover, setCircleHover] = useState(false);
  const [triHover, setTriHover] = useState(false);
  const [squareHover, setSquareHover] = useState(false);
  // 복사 메시지: 메시지 다 나온 뒤 같은 위치에 나타났다가 약간 왼쪽으로 이동
  const [copyVisible, setCopyVisible] = useState(false);
  const [copyShiftLeft, setCopyShiftLeft] = useState(false);

  useEffect(() => {
    if (isOn) {
      const DELAY_AFTER_PARTICLES = 800;
      const INTERVAL = 700;
      const timers = phrases.map((_, i) =>
        setTimeout(
          () =>
            setLineVisible((prev) => {
              const next = [...prev];
              next[i] = true;
              return next;
            }),
          DELAY_AFTER_PARTICLES + i * INTERVAL,
        ),
      );
      return () => timers.forEach(clearTimeout);
    } else {
      setLineVisible([false, false, false]);
      setCopyVisible(false);
      setCopyShiftLeft(false);
    }
  }, [isOn, phrases]);

  // 메시지 3줄 다 나온 뒤 복사 레이어 같은 위치에 등장 → 잠시 후 왼쪽으로 이동
  useEffect(() => {
    if (!isOn) return;
    const allVisible = lineVisible[0] && lineVisible[1] && lineVisible[2];
    if (!allVisible) return;

    const t1 = setTimeout(() => {
      setCopyVisible(true);
      onCopyVisible?.();
    }, 400);
    const t2 = setTimeout(() => setCopyShiftLeft(true), 800);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [isOn, lineVisible, onCopyVisible]);

  const circleColor = isOn ? "#0891b2" : "rgba(196,168,130,.9)";
  const triColor = isOn ? "#0e7490" : "rgba(232,213,176,.9)";
  const squareColor = isOn ? "rgba(13,26,31,.6)" : "rgba(240,235,227,.75)";
  // 기존 메시지 레이어가 검은 복사본 위에 올라가므로, 회색은 불투명하게 해서 검정이 비치지 않게 함
  const baseColor = isOn ? "rgb(176, 182, 184)" : "rgba(240,235,227,.22)";

  const blackColor = "#5d6263";

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: ".24em",
        transform: isMobile
          ? "translateX(-8%) translateY(15%)"
          : "translateX(-8%) translateY(22%)",
        pointerEvents: "none",
        zIndex: 20,
        visibility: isOn ? "visible" : "hidden",
        opacity: visible ? 1 : 0,
        transition: "opacity 0.4s ease",
      }}
    >
      {/* 검정색 복사 레이어 — 메시지 다 나온 뒤 같은 위치에 등장 후 약간 왼쪽으로 이동 */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: ".24em",
          zIndex: 0,
          pointerEvents: "none",
          opacity: copyVisible ? 0.72 : 0,
          filter: copyVisible ? "blur(1.5px)" : "blur(0)",
          transform: copyShiftLeft
            ? `translate(${isMobile ? -2 : -5}px, 0)`
            : "translate(0, 0)",
          transition:
            "opacity 0.5s ease, filter 0.5s ease, transform 0.6s ease-out",
        }}
      >
        {/* 줄1: ○ 자리는 placeholder(복사 안 보임), 감성·위에는 복사 표시 */}
        <PhraseLine isMobile={isMobile}
          visible={copyVisible}
          baseColor={blackColor}
          animateFromBottom={false}
        >
          <span
            style={{
              display: "inline-block",
              width: "0.58em",
              height: "0.58em",
              flexShrink: 0,
              visibility: "hidden",
            }}
            aria-hidden
          />
          <span style={{ color: blackColor }}>감성</span>
          <span>위에</span>
        </PhraseLine>
        {/* 줄2: 구조·를 더해 복사 표시, △ 자리는 placeholder */}
        <PhraseLine isMobile={isMobile}
          visible={copyVisible}
          baseColor={blackColor}
          animateFromBottom={false}
        >
          <span style={{ color: blackColor }}>구조</span>
          <span
            style={{
              display: "inline-block",
              width: "0.62em",
              height: "0.58em",
              flexShrink: 0,
              visibility: "hidden",
            }}
            aria-hidden
          />
          <span>를 더해</span>
        </PhraseLine>
        {/* 줄3: 당신의·로 복사 표시, □+결 자리는 placeholder */}
        <PhraseLine isMobile={isMobile}
          visible={copyVisible}
          baseColor={blackColor}
          animateFromBottom={false}
        >
          <span>당신의</span>
          <span
            style={{
              display: "inline-flex",
              width: "1em",
              height: "1em",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              visibility: "hidden",
            }}
            aria-hidden
          >
            <span
              style={{ fontFamily: "Noto Serif KR, serif", fontSize: "0.55em" }}
            >
              결
            </span>
          </span>
          <span>로</span>
        </PhraseLine>
      </div>

      {/* 기존 컬러 메시지 (복사본 앞에 배치) */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: ".24em",
        }}
      >
        <PhraseLine isMobile={isMobile} visible={lineVisible[0]} baseColor={baseColor}>
          <span
            onMouseEnter={() => setCircleHover(true)}
            onMouseLeave={() => setCircleHover(false)}
            style={{
              display: "inline-block",
              width: "0.58em",
              height: "0.58em",
              borderRadius: "50%",
              border: "0.035em solid currentColor",
              background: circleHover ? "currentColor" : "transparent",
              transition: "background 0.3s ease",
              color: circleColor,
              verticalAlign: "middle",
              flexShrink: 0,
              cursor: "pointer",
            }}
          />
          <span style={{ color: circleColor, transition: "color .7s ease" }}>
            감성
          </span>
          <span>위에</span>
        </PhraseLine>

        <PhraseLine isMobile={isMobile} visible={lineVisible[1]} baseColor={baseColor}>
          <span style={{ color: triColor, transition: "color .7s ease" }}>
            구조
          </span>
          <svg
            width="0.62em"
            height="0.58em"
            viewBox="0 0 24 22"
            style={{ flexShrink: 0, cursor: "pointer" }}
            onMouseEnter={() => setTriHover(true)}
            onMouseLeave={() => setTriHover(false)}
          >
            <polygon
              points="12,2 22,20 2,20"
              fill={triHover ? triColor : "none"}
              stroke={triColor}
              strokeWidth="1.5"
              style={{ transition: "fill 0.3s ease" }}
            />
          </svg>
          <span>를 더해</span>
        </PhraseLine>

        <PhraseLine isMobile={isMobile} visible={lineVisible[2]} baseColor={baseColor}>
          <span>당신의</span>
          <span
            onMouseEnter={() => setSquareHover(true)}
            onMouseLeave={() => setSquareHover(false)}
            style={{
              display: "inline-flex",
              width: "1em",
              height: "1em",
              border: "0.04em solid",
              borderColor: squareColor,
              background: squareHover ? squareColor : "transparent",
              color: squareHover ? "var(--bg)" : squareColor,
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              position: "relative",
              overflow: "hidden",
              transition: "background 0.3s ease, color 0.3s ease",
              cursor: "pointer",
            }}
          >
            <span
              style={{ fontFamily: "Noto Serif KR, serif", fontSize: "0.55em" }}
            >
              결
            </span>
          </span>
          <span>로</span>
        </PhraseLine>
      </div>
    </div>
  );
}
