import React, { forwardRef, useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

import { useDevice } from '@/context/DeviceContext';

type ShapesStageProps = {
  isOn: boolean;
  onModeRevealed?: boolean;
  isCentered?: boolean;
  sequenceStep?: number;
  activeShape?: 'all' | 'circle' | 'triangle' | 'square';
};

const HeroOnShapesStage = forwardRef<HTMLDivElement, ShapesStageProps>(
  (
    {
      isOn,
      onModeRevealed = false,
      isCentered = false,
      sequenceStep = 0,
      activeShape = 'all',
    },
    ref,
  ) => {
    const { isMobileView } = useDevice();
    // 0: OFF, 1: 원, 2: 세모, 3: 네모, 4: 전체합체, 5: 고정
    const isStep1 = sequenceStep === 1;
    const isStep2 = sequenceStep === 2;
    const isStep3 = sequenceStep === 3;
    const isStepAll = sequenceStep >= 4;

    const containerRef = useRef<HTMLDivElement | null>(null);
    const circleRef = useRef<SVGGElement>(null);
    const triangleRef = useRef<SVGGElement>(null);
    const squareRef = useRef<SVGGElement>(null);
    const fixedElementsRef = useRef<SVGGElement>(null);

    // [V16.3] 무한 부유 애니메이션 (Floating)
    useGSAP(() => {
      if (!isOn) return;

      // 원 부유
      gsap.to(circleRef.current, {
        y: -15,
        rotate: 6,
        duration: 3.5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });

      // 세모 부유
      gsap.to(triangleRef.current, {
        y: 12,
        rotate: -5,
        scale: 0.97,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: 0.5
      });

      // 네모 부유
      gsap.to(squareRef.current, {
        y: 7,
        rotate: -2.5,
        duration: 4.25,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: 0.2
      });
    }, { dependencies: [isOn], scope: containerRef });

    // [V16.3] 전체 시퀀스 및 개별 도형 상태 제어
    useGSAP(() => {
      const showCircle = isStep1 || (isStepAll && (activeShape === 'all' || activeShape === 'circle'));
      const showTriangle = isStep2 || (isStepAll && (activeShape === 'all' || activeShape === 'triangle'));
      const showSquare = isStep3 || isStepAll; // 네모는 3단계부터 항상 유지

      // 원 (Circle) 트랜지션
      if (showCircle) {
        gsap.to(circleRef.current, { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 0.8, ease: 'power2.out' });
      } else {
        gsap.to(circleRef.current, { opacity: 0, scale: 0.8, filter: 'blur(10px)', duration: 0.6, ease: 'power2.in' });
      }

      // 세모 (Triangle) 트랜지션
      if (showTriangle) {
        gsap.to(triangleRef.current, { opacity: 1, scale: 1, rotate: 0, duration: 0.8, ease: 'power2.out' });
      } else {
        gsap.to(triangleRef.current, { opacity: 0, scale: 0.8, rotate: -10, duration: 0.6, ease: 'power2.in' });
      }

      // 네모 (Square) 트랜지션
      if (showSquare) {
        gsap.to(squareRef.current, { opacity: 1, scale: 1, duration: 0.8, ease: 'power2.out' });
      } else {
        gsap.to(squareRef.current, { opacity: 0, scale: 0.8, duration: 0.6, ease: 'power2.in' });
      }

      // 고정 요소 (Fixed Elements) 트랜지션
      if (isStepAll) {
        gsap.to(fixedElementsRef.current, { opacity: 1, duration: 1, ease: 'power1.inOut' });
      } else {
        gsap.to(fixedElementsRef.current, { opacity: 0, duration: 0.5 });
      }
    }, { dependencies: [sequenceStep, activeShape, isOn], scope: containerRef });

    return (
      <div
        ref={(node) => {
          // [V4.9 Fix] as any 제거: 표준 Ref 병합 패턴 적용
          if (typeof ref === 'function') {
            ref(node);
          } else if (ref) {
            ref.current = node;
          }
          containerRef.current = node;
        }}
        className="shapes-stage-container"
        style={{
          position: 'absolute',
          left: isCentered ? '50%' : 'auto',
          right: isCentered ? 'auto' : (isMobileView ? '8%' : '12%'),
          top: isCentered ? '50%' : (isMobileView ? '35%' : '45%'),
          transform: isCentered 
            ? 'translate(-50%, -50%) scale(1.1)' 
            : 'translateY(-50%)',
          width: isMobileView
            ? 'clamp(120px, 35vw, 180px)'
            : 'clamp(260px, 32vw, 500px)',
          height: isMobileView
            ? 'clamp(120px, 35vw, 180px)'
            : 'clamp(260px, 32vw, 500px)',
          visibility: isOn ? 'visible' : 'hidden',
          opacity: isOn ? (isStepAll ? (onModeRevealed || isCentered ? 0.75 : 1) : 0.95) : 0,
          pointerEvents: isOn && (onModeRevealed || isCentered || sequenceStep > 0) ? 'auto' : 'none',
          filter: isCentered ? 'drop-shadow(0 0 20px rgba(8,145,178,0.2))' : 'none',
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

          {/* 1. 원 (감성) */}
          <g ref={circleRef} style={{ opacity: 0, transformOrigin: '250px 235px' }}>
            <circle
              cx="250"
              cy="235"
              r="168"
              fill={activeShape === 'circle' ? '#0891b2' : 'none'}
              fillOpacity={activeShape === 'circle' ? 0.08 : 0}
              stroke="#0891b2"
              strokeWidth="1.2"
              strokeDasharray="5 8"
              strokeOpacity=".45"
              style={{ transition: 'fill 0.4s ease, fill-opacity 0.4s ease', filter: 'drop-shadow(0 0 12px rgba(8,145,178,0.25))' }}
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

          {/* 2. 세모 (구조) */}
          <g ref={triangleRef} style={{ opacity: 0, transformOrigin: '250px 203px' }}>
            <polygon
              points="250,72 422,334 78,334"
              fill={activeShape === 'triangle' ? '#0891b2' : 'none'}
              fillOpacity={activeShape === 'triangle' ? 0.08 : 0}
              stroke="#0891b2"
              strokeWidth="1.2"
              strokeOpacity=".45"
              style={{ transition: 'fill 0.4s ease, fill-opacity 0.4s ease', filter: 'drop-shadow(0 0 12px rgba(8,145,178,0.2))' }}
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
          </g>

          {/* 3. 네모 (결) */}
          <g ref={squareRef} style={{ opacity: 0, transformOrigin: '250px 250px' }}>
            <rect
              x="110"
              y="110"
              width="280"
              height="280"
              rx="4"
              fill={activeShape === 'square' ? '#0891b2' : 'none'}
              fillOpacity={activeShape === 'square' ? 0.08 : 0}
              stroke="#0891b2"
              strokeWidth="1.2"
              strokeDasharray="8 4"
              strokeOpacity=".45"
              style={{ transition: 'fill 0.4s ease, fill-opacity 0.4s ease', filter: 'drop-shadow(0 0 12px rgba(8,145,178,0.15))' }}
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
          </g>

          {/* 고정 요소들 (4단계 합체 이후) */}
          <g ref={fixedElementsRef} style={{ opacity: 0 }}>
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
          </g>
        </svg>
      </div>
    );
  },
);

HeroOnShapesStage.displayName = 'HeroOnShapesStage';
export default HeroOnShapesStage;
