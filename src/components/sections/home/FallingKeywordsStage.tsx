'use client';

import React, { useEffect, useRef, useImperativeHandle, forwardRef, useCallback } from 'react';
import Matter from 'matter-js';
import { gsap } from 'gsap';
import { INTERACTION_Z_INDEX, KEYWORD_CFG } from '@/constants/interaction';

export interface FallingKeywordsHandle {
  /** 키워드 하나를 대기열(상단)에 추가 */
  addKeyword: (text: string) => void;
  /** 키워드 하나를 대기열에서 제거 (역방향 스크롤 대응) */
  popKeyword: (text: string) => void;
  /** 모든 키워드 투하 시작 */
  dropAll: () => void;
  /** 바닥의 키워드들을 상단 대기 위치로 자석처럼 복구 (역재생 대응) */
  magneticReset: () => void;
  /** 초기화 */
  reset: () => void;
  /** [V16.41] 물리 엔진 및 렌더링 루프 일시 정지 */
  pauseSimulation: () => void;
  /** [V16.41] 물리 엔진 및 렌더링 루프 가동 재개 */
  resumeSimulation: () => void;
}

interface FallingKeywordsStageProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
  isMobile: boolean;
  isMidRange: boolean; // [V16.32] 추가
}

/**
 * [V16.32] FallingKeywordsStage
 */
const FallingKeywordsStage = forwardRef<FallingKeywordsHandle, FallingKeywordsStageProps>(
  ({ containerRef, isMobile, isMidRange }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const engineRef = useRef<Matter.Engine | null>(null);
    const runnerRef = useRef<Matter.Runner | null>(null);
    const bodiesRef = useRef<Matter.Body[]>([]);
    const groundRef = useRef<Matter.Body | null>(null);
    const rafIdRef = useRef<number | null>(null);
    const isRunningRef = useRef(true); // [V16.41] 가동 상태 추적

    // [V16.27] 충돌 카테고리 정의
    const CATEGORY_KEYWORD = 0x0001;
    const CATEGORY_GROUND = 0x0002;

    // [V16.38] 중앙 집중화된 디자인 토큰으로 교체
    const getDesignSpec = useCallback(() => {
      if (isMobile) return KEYWORD_CFG.DESIGN.MOBILE;
      if (isMidRange) return KEYWORD_CFG.DESIGN.TABLET;
      return KEYWORD_CFG.DESIGN.PC;
    }, [isMobile, isMidRange]);

    // [V16.25] 핀(Constraint) ↔ 바디 매핑
    const pinsRef = useRef<Map<Matter.Body, Matter.Constraint>>(new Map());

    // [V26.80] 렌더 루프 함수 Ref (전역 오염 제거)
    const renderLoopRef = useRef<(() => void) | null>(null);

    // 뷰포트 크기 안전 측정 헬퍼
    const getViewport = useCallback(() => ({
      w: (typeof window !== 'undefined' ? window.innerWidth : 0) || 1200,
      h: (typeof window !== 'undefined' ? window.innerHeight : 0) || 800,
    }), []);

    // [V16.32] 키워드 바디 생성 헬퍼 (기기별 사이즈 적용)
    const createKeywordBody = useCallback((text: string) => {
      if (!engineRef.current || !canvasRef.current) return;

      const spec = getDesignSpec();
      const ctx = canvasRef.current.getContext('2d');
      let textWidth = spec.minW;
      
      if (ctx) {
        ctx.font = `bold ${spec.fontSize}px SUIT`;
        textWidth = ctx.measureText(text).width + spec.padding;
      }

      const width = Math.max(textWidth, spec.minW);
      const height = spec.bh;

      // 수치 안전 장치 (NaN Guard)
      const { w: viewW } = getViewport();
      const safeViewW = (isNaN(viewW) || viewW <= 0) ? 1200 : viewW;

      let x = 0;
      let y = 0;
      let isOverlapping = true;
      let attempts = 0;

      while (isOverlapping && attempts < KEYWORD_CFG.PHYSICS.ATTEMPTS) {
        // [V16.38] 중앙 집중화된 영역 토큰 적용
        const area = (isMobile || isMidRange) ? KEYWORD_CFG.SPAWN_AREA.MOBILE : KEYWORD_CFG.SPAWN_AREA.PC;
        x = (Math.random() * (safeViewW * (area.END - area.START))) + (safeViewW * area.START);
        
        y = 120 + (Math.random() * 180);

        // [V16.38] 중앙 집중화된 마진 토큰 적용
        isOverlapping = bodiesRef.current.some(body => {
          const dx = Math.abs(body.position.x - x);
          const dy = Math.abs(body.position.y - y);
          return dx < (textWidth * KEYWORD_CFG.PHYSICS.MARGIN_X + 10) && 
                 dy < (spec.fontSize + KEYWORD_CFG.PHYSICS.MARGIN_Y);
        });
        attempts++;
      }

      if (isNaN(x) || isNaN(y)) {
        x = safeViewW / 2;
        y = 150;
      }

      // [V16.38] 중앙 집중화된 물리 토큰 적용
      const body = Matter.Bodies.rectangle(x, y, width, height, {
        chamfer: { radius: height / 2.5 },
        restitution: KEYWORD_CFG.PHYSICS.RESTITUTION,
        friction: KEYWORD_CFG.PHYSICS.FRICTION,
        isStatic: false,
        collisionFilter: {
          category: CATEGORY_KEYWORD,
          mask: CATEGORY_GROUND,
        },
      });

      // 커스텀 속성
      body.text = text;
      (body as any).initialPos = { x, y };
      (body as any).bodyWidth = width;
      (body as any).bodyHeight = height;

      // [V16.25] 핀(Constraint)으로 고정 — 동적이지만 떨어지지 않음
      const pin = Matter.Constraint.create({
        pointA: { x, y },       // 월드 고정점
        bodyB: body,             // 고정 대상
        pointB: { x: 0, y: 0 }, // 바디 중심
        stiffness: 1,            // 완전 강체 연결
        length: 0,               // 거리 0 = 제자리 고정
      });

      bodiesRef.current.push(body);
      pinsRef.current.set(body, pin);
      Matter.World.add(engineRef.current.world, [body, pin]);
    }, [getViewport, getDesignSpec]);

    // ─── Handle 인터페이스 (builders.ts와의 계약 — 시그니처 변경 없음) ───
    useImperativeHandle(ref, () => ({
      addKeyword: (text: string) => {
        createKeywordBody(text);
      },

      popKeyword: (text: string) => {
        if (!engineRef.current) return;
        const idx = [...bodiesRef.current].reverse().findIndex(b => b.text === text);
        if (idx !== -1) {
          const actualIdx = bodiesRef.current.length - 1 - idx;
          const body = bodiesRef.current[actualIdx];

          // [V16.25] 바디와 핀을 동반 제거
          const pin = pinsRef.current.get(body);
          if (pin) {
            Matter.World.remove(engineRef.current.world, pin);
            pinsRef.current.delete(body);
          }
          Matter.World.remove(engineRef.current.world, body);
          bodiesRef.current.splice(actualIdx, 1);
        }
      },

      dropAll: () => {
        if (!engineRef.current) return;
        bodiesRef.current.forEach(body => {
          // [V16.25] 핀만 제거 → 자연 낙하
          const pin = pinsRef.current.get(body);
          if (pin) {
            Matter.World.remove(engineRef.current!.world, pin);
            pinsRef.current.delete(body);
          }

          // [V16.27] 투하 시 충돌 필터 복구
          body.collisionFilter.mask = CATEGORY_GROUND | CATEGORY_KEYWORD;

          Matter.Body.setVelocity(body, {
            x: (Math.random() - 0.5) * 4,
            y: 8 + Math.random() * 4,
          });
          Matter.Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.2);
        });
      },

      magneticReset: () => {
        if (!engineRef.current) return;

        bodiesRef.current.forEach(body => {
          const initial = (body as any).initialPos;
          if (!initial || (initial.x === 0 && initial.y === 0)) return;

          Matter.Body.setVelocity(body, { x: 0, y: 0 });
          Matter.Body.setAngularVelocity(body, 0);

          const proxy = { x: body.position.x, y: body.position.y };

          gsap.to(proxy, {
            x: initial.x,
            y: initial.y,
            duration: 1.2,
            ease: 'power3.inOut',
            onUpdate: () => {
              Matter.Body.setPosition(body, { x: proxy.x, y: proxy.y });
              Matter.Body.setVelocity(body, { x: 0, y: 0 });
            },
            onComplete: () => {
              if (!engineRef.current) return;
              body.collisionFilter.mask = CATEGORY_GROUND;
              const existingPin = pinsRef.current.get(body);
              if (existingPin) {
                Matter.World.remove(engineRef.current.world, existingPin);
              }
              const newPin = Matter.Constraint.create({
                pointA: { x: initial.x, y: initial.y },
                bodyB: body,
                pointB: { x: 0, y: 0 },
                stiffness: 1,
                length: 0,
              });
              pinsRef.current.set(body, newPin);
              Matter.World.add(engineRef.current.world, newPin);
            },
          });

          const angleProxy = { angle: body.angle };
          gsap.to(angleProxy, {
            angle: 0,
            duration: 1.2,
            ease: 'power3.inOut',
            onUpdate: () => {
              Matter.Body.setAngle(body, angleProxy.angle);
            },
          });
        });
      },

      reset: () => {
        if (!engineRef.current || !canvasRef.current) return;
        
        // 1. 물리 엔진 월드에서 모든 바디와 핀 제거
        bodiesRef.current.forEach(body => {
          const pin = pinsRef.current.get(body);
          if (pin) Matter.World.remove(engineRef.current!.world, pin);
          Matter.World.remove(engineRef.current!.world, body);
        });
        bodiesRef.current = [];
        pinsRef.current.clear();

        // 2. [V26.98 Fix] 렌더 루프가 중단되더라도 잔상이 남지 않도록 캔버스를 즉시 박박 닦아냄
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          const dpr = window.devicePixelRatio || 1;
          ctx.clearRect(0, 0, canvasRef.current.width / dpr, canvasRef.current.height / dpr);
        }
      },

      pauseSimulation: () => {
        if (!isRunningRef.current) return;
        if (runnerRef.current) Matter.Runner.stop(runnerRef.current);
        if (rafIdRef.current) {
          cancelAnimationFrame(rafIdRef.current);
          rafIdRef.current = null;
        }
        isRunningRef.current = false;
      },

      resumeSimulation: () => {
        if (isRunningRef.current) return;
        if (runnerRef.current && engineRef.current) {
          Matter.Runner.run(runnerRef.current, engineRef.current);
        }
        // [V26.80] 내부 Ref를 통한 루프 즉시 재개
        if (renderLoopRef.current) {
          rafIdRef.current = requestAnimationFrame(renderLoopRef.current);
        }
        isRunningRef.current = true;
      },
    }));

    // ─── 물리 엔진 초기화 ───
    useEffect(() => {
      if (!containerRef.current || !canvasRef.current) return;

      const { w: viewW, h: viewH } = getViewport();
      const dpr = window.devicePixelRatio || 1;
      canvasRef.current.width = viewW * dpr;
      canvasRef.current.height = viewH * dpr;
      canvasRef.current.style.width = `${viewW}px`;
      canvasRef.current.style.height = `${viewH}px`;

      const ctx = canvasRef.current.getContext('2d');
      if (ctx) ctx.scale(dpr, dpr);

      const engine = Matter.Engine.create();
      engineRef.current = engine;


      const ground = Matter.Bodies.rectangle(
        viewW / 2,
        viewH + 50,
        viewW * 2,
        100,
        { 
          isStatic: true,
          collisionFilter: { category: CATEGORY_GROUND }
        }
      );
      groundRef.current = ground;
      Matter.World.add(engine.world, [ground]);

      const runner = Matter.Runner.create();
      Matter.Runner.run(runner, engine);
      runnerRef.current = runner;

      const handleResize = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const newW = window.innerWidth;
        const newH = window.innerHeight;
        const newDpr = window.devicePixelRatio || 1;
        canvas.width = newW * newDpr;
        canvas.height = newH * newDpr;
        canvas.style.width = `${newW}px`;
        canvas.style.height = `${newH}px`;
        const resizeCtx = canvas.getContext('2d');
        if (resizeCtx) resizeCtx.scale(newDpr, newDpr);
        if (groundRef.current) {
          Matter.Body.setPosition(groundRef.current, { x: newW / 2, y: newH + 50 });
        }
      };

      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        if (runnerRef.current) Matter.Runner.stop(runnerRef.current);
        Matter.Engine.clear(engine);
        engineRef.current = null;
        runnerRef.current = null;
        bodiesRef.current = [];
        pinsRef.current.clear();
      };
    }, [containerRef, getViewport]);

    // ─── rAF 렌더링 루프 (기기별 사이즈 적용) ───
    const renderLoop = useCallback(() => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');

      if (ctx && canvas) {
        const dpr = window.devicePixelRatio || 1;
        const w = canvas.width / dpr;
        const h = canvas.height / dpr;
        ctx.clearRect(0, 0, w, h);

        const spec = getDesignSpec();
        ctx.font = `bold ${spec.fontSize}px SUIT`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        bodiesRef.current.forEach(body => {
          const { x, y } = body.position;
          const angle = body.angle;
          const text = body.text;
          if (!text) return;

          const bw = (body as any).bodyWidth || spec.minW;
          const bh = (body as any).bodyHeight || spec.bh;

          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(angle);

          const radius = bh / 2.5; 
          ctx.beginPath();
          ctx.moveTo(-bw / 2 + radius, -bh / 2);
          ctx.lineTo(bw / 2 - radius, -bh / 2);
          ctx.arcTo(bw / 2, -bh / 2, bw / 2, -bh / 2 + radius, radius);
          ctx.lineTo(bw / 2, bh / 2 - radius);
          ctx.arcTo(bw / 2, bh / 2, bw / 2 - radius, bh / 2, radius);
          ctx.lineTo(-bw / 2 + radius, bh / 2);
          ctx.arcTo(-bw / 2, bh / 2, -bw / 2, bh / 2 - radius, radius);
          ctx.lineTo(-bw / 2, -bh / 2 + radius);
          ctx.arcTo(-bw / 2, -bh / 2, -bw / 2 + radius, -bh / 2, radius);
          ctx.closePath();

          ctx.fillStyle = 'rgba(8, 145, 178, 0.25)';
          ctx.fill();

          ctx.fillStyle = '#f0ebe3';
          ctx.fillText(text, 0, 1);
          ctx.restore();
        });
      }

      rafIdRef.current = requestAnimationFrame(renderLoop);
    }, [getDesignSpec]);

    // [V26.80] 렌더 루프 Ref 동기화 및 시작
    useEffect(() => {
      renderLoopRef.current = renderLoop;
      rafIdRef.current = requestAnimationFrame(renderLoop);

      return () => {
        if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
      };
    }, [renderLoop]);

    return (
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          zIndex: INTERACTION_Z_INDEX.KEYWORDS,
        }}
      />
    );
  }
);

FallingKeywordsStage.displayName = 'FallingKeywordsStage';

export default FallingKeywordsStage;
