"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { homeContent } from "@/data/homeContent";
import { useBigTypoSizing } from "@/hooks";
import { runExplodeFromColon, runFlyToShapes, runImplodeToColon } from "@/lib";
import type { HeroBigTypoProps } from "@/types";
import { COLORS } from "@/constants/colors";

/**
 * HeroBigTypo — 빅 타이포 + 플래시 마우스오버 + flyParticle + Scramble
 */
export default function HeroBigTypo({
  isOn,
  isMobile = false,
  tcRef,
  shapesStageRef,
  onInteraction,
  onExplodeComplete,
  isTransitioning = false,
  isTitleDown = false,
  onScrambleComplete,
  sequenceStep = 0, // 추가
}: HeroBigTypoProps & {
  isTransitioning?: boolean;
  isTitleDown?: boolean;
  onScrambleComplete?: () => void;
  onExplodeComplete?: () => void;
  onInteraction?: (active: boolean) => void;
  sequenceStep?: number;
}): React.ReactElement {
  const { bigTypo } = homeContent.hero;
  const { btRef, nemoRef, onRef, triRef, cirRef, colonRef } = useBigTypoSizing(
    tcRef,
    isMobile,
  );
  const [coverRevealed, setCoverRevealed] = useState(false);
  const [visible, setVisible] = useState(false);

  // Scramble 로직
  const scrambleChars = "!<>-_\\/[]{}—=+*^?#_~";
  const [scrambleText, setScrambleText] = useState(bigTypo.off);
  const scrambleIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isScramblingRef = useRef(false);

  useEffect(() => {
    if (isTransitioning && !isOn && !isScramblingRef.current) {
      const delayTimer = setTimeout(() => {
        isScramblingRef.current = true;
        let iteration = 0;
        const targetText = bigTypo.on;

        if (scrambleIntervalRef.current) clearInterval(scrambleIntervalRef.current);

        scrambleIntervalRef.current = setInterval(() => {
          const scrambled = targetText
            .split("")
            .map((char, index) => {
              if (index < iteration) {
                return char;
              }
              return scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
            })
            .join("");

          setScrambleText(scrambled);
          iteration += 0.12;

          if (iteration >= targetText.length) {
            if (scrambleIntervalRef.current) clearInterval(scrambleIntervalRef.current);
            setScrambleText(targetText);
            isScramblingRef.current = false;
            onScrambleComplete?.();
          }
        }, 35);
      }, 500);

      return () => clearTimeout(delayTimer);
    } else if (!isTransitioning && !isOn) {
      setScrambleText(bigTypo.off);
      isScramblingRef.current = false;
    }
  }, [isTransitioning, isOn, bigTypo.on, bigTypo.off, onScrambleComplete]);

  useEffect(() => {
    return () => {
      if (scrambleIntervalRef.current) clearInterval(scrambleIntervalRef.current);
    };
  }, []);


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
  }, [isOn, onExplodeComplete, triRef, cirRef]);

  const showActiveUI = isOn || isTransitioning;

  return (
    <div className="relative z-20 mt-auto overflow-visible select-none">
      <style>{`
        .bt-on-mode .bt-hover-nemo:hover { transform: scale(1.06); }
        .bt-on-mode .bt-hover-tri:hover { transform: scale(1.2); filter: brightness(1.15); }
        .bt-on-mode .bt-hover-cir:hover { transform: scale(1.25); background: ${COLORS.BRAND.TEAL} !important; }
        .bt-on-mode .bt-hover-on:hover { transform: scale(1.06); }
        .bt-hover-nemo, .bt-hover-tri, .bt-hover-cir, .bt-hover-on {
          display: inline-block;
          transition: transform 0.35s ease, filter 0.35s ease, background 0.35s ease;
        }
        @keyframes pulseAbt {
          0%, 100% { opacity: 1; filter: brightness(1); }
          50% { opacity: 0.45; filter: brightness(1.3); }
        }
      `}</style>
      
      <div
        ref={btRef}
        className={`flex items-center transition-all duration-[1200ms] cubic-bezier(0.16,1,0.3,1) ${isOn ? 'bt-on-mode' : ''}`}
        style={{
          opacity: visible ? 1 : 0,
          transform: visible 
            ? (isTitleDown ? "translateY(50px)" : "translateY(0)") 
            : "translateY(50px)",
          // 컨테이너 자체는 이벤트를 받지 않도록 함 (내부 div에서 처리)
          pointerEvents: "none", 
        }}
      >
        {/* [v18] 실제 텍스트 영역에만 인터랙션 한정 */}
        <div
          className="inline-flex items-center"
          onMouseEnter={() => !isMobile && isOn && sequenceStep >= 4 && onInteraction?.(true)}
          onMouseLeave={() => !isMobile && isOn && sequenceStep >= 4 && onInteraction?.(false)}
          onClick={() => isOn && sequenceStep >= 4 && onInteraction?.(true)}
          data-cursor={isOn && sequenceStep >= 4 ? "pointer" : undefined}
          style={{
            cursor: isOn && sequenceStep >= 4 ? "pointer" : "default",
            pointerEvents: "auto",
          }}
        >
        <span
          ref={nemoRef}
          className="bt-hover-nemo leading-[0.88] whitespace-nowrap transition-colors duration-700"
          style={{
            fontFamily: "var(--font-esamanru)",
            color: isOn ? COLORS.TEXT.DARK : COLORS.TEXT.LIGHT,
            transform: isMobile ? "none" : "translateY(0.18em)",
            cursor: "inherit",
          }}
        >
          {bigTypo.nemo}
        </span>

        <span
          ref={colonRef}
          className="inline-flex flex-col items-center justify-center -translate-y-[0.8em] transition-all duration-200"
        >
          <span
            ref={triRef}
            className="block w-0 h-0 bt-hover-tri transition-all duration-700"
            style={{
              borderLeft: "13px solid transparent",
              borderRight: "13px solid transparent",
              borderBottomStyle: "solid",
              borderBottomColor: showActiveUI
                ? (isOn ? COLORS.BRAND.TEAL : COLORS.BRAND.GOLD)
                : COLORS.EFFECTS.TRI_DIM,
              cursor: "inherit",
              filter: (isTransitioning && !isOn) ? `drop-shadow(0 0 8px ${COLORS.BRAND.GOLD})` : "none",
              animation: showActiveUI ? "pulseAbt 2.5s ease infinite" : "none",
            }}
          />
          <span
            ref={cirRef}
            className="block rounded-full bt-hover-cir transition-all duration-700 mt-1.5"
            style={{
              background: showActiveUI
                ? (isOn ? COLORS.BRAND.DEEP_TEAL : COLORS.BRAND.BROWN)
                : COLORS.EFFECTS.TRI_DIM,
              width: "18px",
              height: "18px",
              cursor: "inherit",
              filter: (isTransitioning && !isOn) ? `drop-shadow(0 0 6px ${COLORS.BRAND.BROWN})` : "none",
              animation: showActiveUI ? "pulseAbt 2.5s ease .5s infinite" : "none",
            }}
          />
        </span>

        <span
          ref={onRef}
          className="bt-hover-on leading-[0.88] whitespace-nowrap transition-all duration-700"
          style={{
            fontFamily: "var(--font-gmarket)",
            color: showActiveUI 
              ? (isOn ? COLORS.BRAND.TEAL : COLORS.BRAND.GOLD)
              : (isScramblingRef.current ? COLORS.EFFECTS.SCRAMBLE_OFF : COLORS.TEXT.LIGHT),
            transform: isMobile ? "none" : "translateY(0.18em)",
            textShadow: (isTransitioning && !isOn) ? `0 0 30px ${COLORS.BRAND.GOLD}4d` : "none", // 0.3 opacity
            cursor: "inherit",
          }}
        >
          {isTransitioning && !isOn ? scrambleText : (isOn ? bigTypo.on : bigTypo.off)}
        </span>

        </div>

        <div
          className="absolute inset-0 z-[2] pointer-events-none transition-all duration-1000 cubic-bezier(0.77,0,.18,1)"
          style={{
            background: "var(--bg)",
            transformOrigin: "left",
            transform: coverRevealed ? "scaleX(0)" : "scaleX(1)",
            opacity: coverRevealed ? 0 : 1,
          }}
        />
      </div>
    </div>
  );
}
