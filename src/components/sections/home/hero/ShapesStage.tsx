"use client";

import React, { forwardRef } from "react";

type ShapesStageProps = {
  isOn: boolean;
  isMobile?: boolean;
  offModeVisible?: boolean;
  onModeRevealed?: boolean;
};

/**
 * ShapesStage 컴포넌트
 *
 * 원/삼각/사각 3종 SVG 쉐이프를 렌더링.
 * - isOn=false: 다크 버전 SVG (크림·골드 계열)
 * - isOn=true: 라이트 버전 SVG (틸·딥틸 계열)
 * 각 쉐이프는 두둥실 float 애니메이션 적용.
 * OFF 상태에서는 visibility:hidden.
 *
 * @param {boolean} isOn - ON/OFF 상태 [Required]
 *
 * Example usage:
 * <ShapesStage isOn={isOn} />
 */
const ShapesStage = forwardRef<HTMLDivElement, ShapesStageProps>(
  (
    { isOn, isMobile = false, offModeVisible = false, onModeRevealed = false },
    ref,
  ) => (
    <>
      {/* 두둥실 float 키프레임 */}
      <style>{`
        @keyframes shapeFloatA { 0%,100%{transform:translateY(0)rotate(0)} 50%{transform:translateY(-15px)rotate(6deg)} }
        @keyframes shapeFloatB { 0%,100%{transform:translateY(0)rotate(0)scale(1)} 50%{transform:translateY(12px)rotate(-5deg)scale(.97)} }
        @keyframes shapeFloatC { 0%,100%{transform:translateY(0)rotate(0)} 33%{transform:translateY(-8px)rotate(2.5deg)} 66%{transform:translateY(7px)rotate(-2.5deg)} }
        .shC { animation: shapeFloatA 7s ease-in-out infinite; transform-origin: 50% 50%; }
        .shT { animation: shapeFloatB 6s ease-in-out 1s infinite; transform-origin: 50% 50%; }
        .shS { animation: shapeFloatC 8.5s ease-in-out .5s infinite; transform-origin: 50% 50%; }
        .shapes-off-hover .shC:hover, .shapes-off-hover .shT:hover { filter: url(#g1) brightness(1.2); transition: filter 0.35s ease; }
        .shapes-off-hover .shS:hover { filter: url(#g2) brightness(1.2); transition: filter 0.35s ease; }
      `}</style>

      <div
        ref={ref}
        className={!isOn && offModeVisible ? "shapes-off-hover" : undefined}
        style={{
          position: "absolute",
          ...(isOn
            ? { left: isMobile ? "2%" : "5%", right: "auto" }
            : { right: isMobile ? "-20px" : "-40px", left: "auto" }),
          top: "50%",
          transform: isMobile
            ? "translateY(-50%) translateY(-24px)"
            : "translateY(-50%) translateY(80px)",
          width: isMobile
            ? "clamp(140px, 40vw, 250px)"
            : "clamp(200px, 28vw, 420px)",
          height: isMobile
            ? "clamp(140px, 40vw, 250px)"
            : "clamp(200px, 28vw, 420px)",
          visibility: "visible",
          opacity: isOn && onModeRevealed ? 0.75 : offModeVisible ? 1 : 0,
          pointerEvents:
            (isOn && onModeRevealed) || offModeVisible ? "auto" : "none",
          filter: isOn && onModeRevealed ? "blur(1.5px)" : "none",
          transition: "opacity 0.7s ease, filter 0.7s ease",
        }}
      >
        {/* 다크 SVG — OFF 상태 */}
        <svg
          viewBox="0 0 500 500"
          fill="none"
          overflow="visible"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            display: isOn ? "none" : "block",
          }}
        >
          <defs>
            <filter id="g1">
              <feGaussianBlur stdDeviation="5" result="b" />
              <feComposite in="SourceGraphic" in2="b" operator="over" />
            </filter>
            <filter id="g2">
              <feGaussianBlur stdDeviation="12" result="b" />
              <feComposite in="SourceGraphic" in2="b" operator="over" />
            </filter>
            <radialGradient id="r1" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#c4a882" stopOpacity=".06" />
              <stop offset="100%" stopColor="#c4a882" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="r2" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#e8d5b0" stopOpacity=".08" />
              <stop offset="100%" stopColor="#e8d5b0" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="r3" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#f0ebe3" stopOpacity=".04" />
              <stop offset="100%" stopColor="#f0ebe3" stopOpacity="0" />
            </radialGradient>
            <path
              id="shapeOrbitPath"
              d="M250,235 m-168,0 a168,168 0 1,1 336,0 a168,168 0 1,1 -336,0"
              fill="none"
            />
          </defs>
          <g className="shC" filter="url(#g1)">
            <circle
              cx="250"
              cy="235"
              r="168"
              fill="url(#r1)"
              stroke="#c4a882"
              strokeWidth="1"
              strokeDasharray="4 9"
              strokeOpacity=".4"
            />
            <circle
              cx="250"
              cy="235"
              r="122"
              fill="none"
              stroke="#c4a882"
              strokeWidth=".4"
              strokeDasharray="2 14"
              strokeOpacity=".15"
            />
            <text
              x="250"
              y="55"
              textAnchor="middle"
              fontFamily="DM Mono, monospace"
              fontSize="8"
              letterSpacing="3"
              fill="rgba(240,235,227,.28)"
            >
              ○ 감성
            </text>
          </g>
          <g className="shT" filter="url(#g1)">
            <polygon
              points="250,72 422,334 78,334"
              fill="url(#r2)"
              stroke="#e8d5b0"
              strokeWidth="1"
              strokeOpacity=".45"
            />
            <text
              x="395"
              y="362"
              fontFamily="DM Mono, monospace"
              fontSize="8"
              letterSpacing="3"
              fill="rgba(240,235,227,.28)"
            >
              △ 구조
            </text>
          </g>
          <g className="shS" filter="url(#g2)">
            <rect
              x="138"
              y="132"
              width="224"
              height="224"
              fill="url(#r3)"
              stroke="#f0ebe3"
              strokeWidth="1.5"
              strokeOpacity=".5"
            />
            <line
              x1="138"
              y1="138"
              x2="164"
              y2="138"
              stroke="#e8d5b0"
              strokeWidth="2"
              strokeOpacity=".8"
            />
            <line
              x1="138"
              y1="138"
              x2="138"
              y2="164"
              stroke="#e8d5b0"
              strokeWidth="2"
              strokeOpacity=".8"
            />
            <line
              x1="362"
              y1="138"
              x2="336"
              y2="138"
              stroke="#e8d5b0"
              strokeWidth="2"
              strokeOpacity=".8"
            />
            <line
              x1="362"
              y1="138"
              x2="362"
              y2="164"
              stroke="#e8d5b0"
              strokeWidth="2"
              strokeOpacity=".8"
            />
            <line
              x1="138"
              y1="356"
              x2="164"
              y2="356"
              stroke="#e8d5b0"
              strokeWidth="2"
              strokeOpacity=".8"
            />
            <line
              x1="138"
              y1="356"
              x2="138"
              y2="330"
              stroke="#e8d5b0"
              strokeWidth="2"
              strokeOpacity=".8"
            />
            <line
              x1="362"
              y1="356"
              x2="336"
              y2="356"
              stroke="#e8d5b0"
              strokeWidth="2"
              strokeOpacity=".8"
            />
            <line
              x1="362"
              y1="356"
              x2="362"
              y2="330"
              stroke="#e8d5b0"
              strokeWidth="2"
              strokeOpacity=".8"
            />
            <text
              x="116"
              y="248"
              textAnchor="end"
              fontFamily="DM Mono, monospace"
              fontSize="8"
              letterSpacing="3"
              fill="rgba(240,235,227,.28)"
            >
              □ 결
            </text>
          </g>
          <circle cx="250" cy="244" r="3" fill="#e8d5b0" opacity=".6">
            <animate
              attributeName="r"
              values="3;8;3"
              dur="3s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values=".6;.12;.6"
              dur="3s"
              repeatCount="indefinite"
            />
          </circle>
          <circle r="2.5" fill="#c4a882" opacity=".4">
            <animateMotion dur="12s" repeatCount="indefinite">
              <mpath href="#shapeOrbitPath" />
            </animateMotion>
          </circle>
        </svg>

        {/* 라이트 SVG — ON 상태 */}
        <svg
          viewBox="0 0 500 500"
          fill="none"
          overflow="visible"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            display: isOn ? "block" : "none",
          }}
        >
          <defs>
            <path
              id="shapeOrbitPathLight"
              d="M250,235 m-168,0 a168,168 0 1,1 336,0 a168,168 0 1,1 -336,0"
              fill="none"
            />
          </defs>
          <g className="shC">
            <circle
              cx="250"
              cy="235"
              r="168"
              fill="rgba(8,145,178,.02)"
              stroke="#0891b2"
              strokeWidth="1.2"
              strokeDasharray="5 8"
              strokeOpacity=".45"
            />
            <circle
              cx="250"
              cy="235"
              r="120"
              fill="none"
              stroke="#0891b2"
              strokeWidth=".5"
              strokeDasharray="2 12"
              strokeOpacity=".2"
            />
            <text
              x="250"
              y="55"
              textAnchor="middle"
              fontFamily="DM Mono, monospace"
              fontSize="10"
              fill="#0891b2"
              fillOpacity=".5"
              letterSpacing="2"
            >
              ○ 감성
            </text>
          </g>
          <g className="shT">
            <polygon
              points="250,72 422,334 78,334"
              fill="rgba(14,116,144,.015)"
              stroke="#0e7490"
              strokeWidth="1.2"
              strokeOpacity=".45"
            />
            <polygon
              points="250,112 396,334 104,334"
              fill="none"
              stroke="#0e7490"
              strokeWidth=".5"
              strokeDasharray="3 10"
              strokeOpacity=".18"
            />
            <text
              x="400"
              y="362"
              fontFamily="DM Mono, monospace"
              fontSize="10"
              fill="#0e7490"
              fillOpacity=".5"
              letterSpacing="2"
            >
              △ 구조
            </text>
          </g>
          <g className="shS">
            <rect
              x="138"
              y="132"
              width="224"
              height="224"
              fill="rgba(13,26,31,.012)"
              stroke="#0d1a1f"
              strokeWidth="1.2"
              strokeOpacity=".35"
            />
            <line
              x1="138"
              y1="138"
              x2="164"
              y2="138"
              stroke="#0891b2"
              strokeWidth="2"
              strokeOpacity=".65"
            />
            <line
              x1="138"
              y1="138"
              x2="138"
              y2="164"
              stroke="#0891b2"
              strokeWidth="2"
              strokeOpacity=".65"
            />
            <line
              x1="362"
              y1="138"
              x2="336"
              y2="138"
              stroke="#0891b2"
              strokeWidth="2"
              strokeOpacity=".65"
            />
            <line
              x1="362"
              y1="138"
              x2="362"
              y2="164"
              stroke="#0891b2"
              strokeWidth="2"
              strokeOpacity=".65"
            />
            <line
              x1="138"
              y1="356"
              x2="164"
              y2="356"
              stroke="#0891b2"
              strokeWidth="2"
              strokeOpacity=".65"
            />
            <line
              x1="138"
              y1="356"
              x2="138"
              y2="330"
              stroke="#0891b2"
              strokeWidth="2"
              strokeOpacity=".65"
            />
            <line
              x1="362"
              y1="356"
              x2="336"
              y2="356"
              stroke="#0891b2"
              strokeWidth="2"
              strokeOpacity=".65"
            />
            <line
              x1="362"
              y1="356"
              x2="362"
              y2="330"
              stroke="#0891b2"
              strokeWidth="2"
              strokeOpacity=".65"
            />
            <text
              x="116"
              y="248"
              textAnchor="end"
              fontFamily="DM Mono, monospace"
              fontSize="10"
              fill="#0d1a1f"
              fillOpacity=".38"
              letterSpacing="2"
            >
              □ 결
            </text>
          </g>
          <circle cx="250" cy="244" r="3" fill="#0891b2" opacity=".55">
            <animate
              attributeName="r"
              values="3;7;3"
              dur="3s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values=".55;.12;.55"
              dur="3s"
              repeatCount="indefinite"
            />
          </circle>
          <circle r="2.5" fill="#0891b2" opacity=".35">
            <animateMotion dur="12s" repeatCount="indefinite">
              <mpath href="#shapeOrbitPathLight" />
            </animateMotion>
          </circle>
        </svg>
      </div>
    </>
  ),
);

ShapesStage.displayName = "ShapesStage";
export default ShapesStage;
