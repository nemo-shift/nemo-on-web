import React, { forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type ShapesStageProps = {
  isOn: boolean;
  isMobile?: boolean;
  onModeRevealed?: boolean;
  isCentered?: boolean;
  sequenceStep?: number;
  activeShape?: 'all' | 'circle' | 'triangle' | 'square'; // 추가
};

const ShapesStage = forwardRef<HTMLDivElement, ShapesStageProps>(
  (
    {
      isOn,
      isMobile = false,
      onModeRevealed = false,
      isCentered = false,
      sequenceStep = 0,
      activeShape = 'all',
    },
    ref,
  ) => {
    // 0: OFF, 1: 원, 2: 세모, 3: 네모, 4: 전체합체, 5: 고정
    const isStep1 = sequenceStep === 1;
    const isStep2 = sequenceStep === 2;
    const isStep3 = sequenceStep === 3;
    const isStepAll = sequenceStep >= 4;

    return (
      <>
        <style>{`
          @keyframes shapeFloatA { 0%,100%{transform:translateY(0)rotate(0)} 50%{transform:translateY(-15px)rotate(6deg)} }
          @keyframes shapeFloatB { 0%,100%{transform:translateY(0)rotate(0)scale(1)} 50%{transform:translateY(12px)rotate(-5deg)scale(.97)} }
          @keyframes shapeFloatC { 0%,100%{transform:translateY(0)rotate(0)} 33%{transform:translateY(-8px)rotate(2.5deg)} 66%{transform:translateY(7px)rotate(-2.5deg)} }
          .shC { animation: shapeFloatA 7s ease-in-out infinite; transform-origin: 50% 50%; }
          .shT { animation: shapeFloatB 6s ease-in-out 1s infinite; transform-origin: 50% 50%; }
          .shS { animation: shapeFloatC 8.5s ease-in-out .5s infinite; transform-origin: 50% 50%; }
          .glow-filter { filter: drop-shadow(0 0 12px var(--glow-color)); }
        `}</style>

        <div
          ref={ref}
          className="shapes-stage-container"
          style={{
            position: 'absolute',
            // PC: 우측 영역 확보 (텍스트와 거리 두기)
            // Mobile: 우측 상단 여백 (텍스트 위쪽)
            left: isCentered ? '50%' : 'auto',
            right: isCentered ? 'auto' : (isMobile ? '8%' : '12%'),
            top: isCentered ? '50%' : (isMobile ? '35%' : '45%'),
            transform: isCentered 
              ? 'translate(-50%, -50%) scale(1.1)' 
              : 'translateY(-50%)',
            width: isMobile
              ? 'clamp(120px, 35vw, 180px)'
              : 'clamp(260px, 32vw, 500px)',
            height: isMobile
              ? 'clamp(120px, 35vw, 180px)'
              : 'clamp(260px, 32vw, 500px)',
            visibility: isOn ? 'visible' : 'hidden',
            opacity: isOn ? (isStepAll ? (onModeRevealed || isCentered ? 0.75 : 1) : 0.95) : 0,
            pointerEvents: isOn && (onModeRevealed || isCentered || sequenceStep > 0) ? 'auto' : 'none',
            filter: isCentered ? 'drop-shadow(0 0 20px rgba(8,145,178,0.2))' : 'none', // 블러 제거
            transition: 'all 1.2s cubic-bezier(0.16,1,0.3,1)',
            zIndex: isCentered ? 600 : 10,
          }}
        >
          <svg
            viewBox="0 0 500 500"
            fill="none"
            overflow="visible"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              display: isOn ? 'block' : 'none',
            }}
          >
            <defs>
              <path
                id="shapeOrbitPathLight"
                d="M250,235 m-168,0 a168,168 0 1,1 336,0 a168,168 0 1,1 -336,0"
                fill="none"
              />
            </defs>

            <AnimatePresence mode="popLayout">
              {/* 1. 원 (감성) */}
              {(isStep1 || (isStepAll && (activeShape === 'all' || activeShape === 'circle'))) && (
                <motion.g 
                  key="circle-group"
                  className="shC"
                  initial={{ opacity: 0, scale: 0.8, filter: 'blur(10px)' }}
                  animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, scale: 1.1, filter: 'blur(5px)' }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  style={{ '--glow-color': 'rgba(8,145,178,0.25)' } as React.CSSProperties}
                >
                  <circle
                    cx="250"
                    cy="235"
                    r="168"
                    className="glow-filter"
                    fill={activeShape === 'circle' ? '#0891b2' : 'none'} // 강조 시 색상 채움
                    fillOpacity={activeShape === 'circle' ? 0.08 : 0} // 은은한 필링
                    stroke="#0891b2"
                    strokeWidth="1.2"
                    strokeDasharray="5 8"
                    strokeOpacity=".45"
                    style={{ transition: 'fill 0.4s ease, fill-opacity 0.4s ease' }}
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
                </motion.g>
              )}

              {/* 2. 세모 (구조) */}
              {(isStep2 || (isStepAll && (activeShape === 'all' || activeShape === 'triangle'))) && (
                <motion.g 
                  key="tri-group"
                  className="shT"
                  initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 1.1 }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  style={{ '--glow-color': 'rgba(8,145,178,0.2)' } as React.CSSProperties}
                >
                  <polygon
                    points="250,72 422,334 78,334"
                    className="glow-filter"
                    fill={activeShape === 'triangle' ? '#0891b2' : 'none'}
                    fillOpacity={activeShape === 'triangle' ? 0.08 : 0}
                    stroke="#0891b2"
                    strokeWidth="1.2"
                    strokeOpacity=".45"
                    style={{ transition: 'fill 0.4s ease, fill-opacity 0.4s ease' }}
                  />
                  <polygon
                    points="250,112 396,334 104,334"
                    fill="none"
                    stroke="#0891b2"
                    strokeWidth=".5"
                    strokeDasharray="3 10"
                    strokeOpacity=".18"
                  />
                  <text
                    x="400"
                    y="362"
                    fontFamily="DM Mono, monospace"
                    fontSize="10"
                    fill="#0891b2"
                    fillOpacity=".5"
                    letterSpacing="2"
                  >
                    △ 구조
                  </text>
                </motion.g>
              )}

              {/* 3. 네모 (결) - 복구됨 */}
              {(isStep3 || isStepAll) && (
                <motion.g 
                  key="square-group"
                  className="shS"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  style={{ '--glow-color': 'rgba(8,145,178,0.15)' } as React.CSSProperties}
                >
                  <rect
                    x="110"
                    y="110"
                    width="280"
                    height="280"
                    rx="4"
                    className="glow-filter"
                    fill={activeShape === 'square' ? '#0891b2' : 'none'}
                    fillOpacity={activeShape === 'square' ? 0.08 : 0}
                    stroke="#0891b2"
                    strokeWidth="1.2"
                    strokeDasharray="8 4"
                    strokeOpacity=".45"
                    style={{ transition: 'fill 0.4s ease, fill-opacity 0.4s ease' }}
                  />
                  <text
                    x="116"
                    y="248"
                    textAnchor="end"
                    fontFamily="DM Mono, monospace"
                    fontSize="10"
                    fill="#0891b2"
                    fillOpacity=".38"
                    letterSpacing="2"
                  >
                    □ 결
                  </text>
                </motion.g>
              )}
            </AnimatePresence>

            {/* 고정 요소들 (4단계 합체 이후에만 노출) */}
            {isStepAll && (
              <motion.g
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
              >
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
              </motion.g>
            )}
          </svg>
        </div>
      </>
    );
  },
);

ShapesStage.displayName = 'ShapesStage';
export default ShapesStage;
