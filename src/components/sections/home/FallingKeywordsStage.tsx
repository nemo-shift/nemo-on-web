'use client';

import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import Matter from 'matter-js';

export interface FallingKeywordsHandle {
  /** 키워드 하나를 대기열(상단)에 추가 */
  addKeyword: (text: string) => void;
  /** 키워드 하나를 대기열에서 제거 (역방향 스크롤 대응) */
  popKeyword: (text: string) => void;
  /** 모든 키워드 투하 시작 */
  dropAll: () => void;
  /** 초기화 */
  reset: () => void;
}

interface FallingKeywordsStageProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
}

/**
 * FallingKeywordsStage: 감정 키워드가 상단에 머물다 스크롤에 맞춰 떨어지는 물리 시뮬레이션 레이어
 */
const FallingKeywordsStage = forwardRef<FallingKeywordsHandle, FallingKeywordsStageProps>(
  ({ containerRef }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const engineRef = useRef<Matter.Engine | null>(null);
    const renderRef = useRef<Matter.Render | null>(null);
    const runnerRef = useRef<Matter.Runner | null>(null);
    const bodiesRef = useRef<Matter.Body[]>([]);

    // 키워드 바디 생성을 위한 헬퍼 함수
    const createKeywordBody = (text: string) => {
      if (!engineRef.current || !canvasRef.current) return;
      const { Bodies, World } = Matter;

      const ctx = canvasRef.current.getContext('2d');
      let textWidth = 140;
      if (ctx) {
        ctx.font = 'bold 48px SUIT';
        textWidth = ctx.measureText(text).width + 60;
      }
      
      const width = textWidth;
      const height = 64; 

      // 겹침 방지 배치 시도 (최대 15회)
      let x = 0;
      let y = 0;
      let isOverlapping = true;
      let attempts = 0;

      while (isOverlapping && attempts < 15) {
        // [v26.50] 뷰포트 상단 전체(10% ~ 90%) 활용하도록 범위 확장
        x = Math.random() * (window.innerWidth * 0.8) + (window.innerWidth * 0.1);
        y = 120 + (Math.random() * 180); // Y축 랜덤성 확보
        
        isOverlapping = bodiesRef.current.some(body => {
          const dx = Math.abs(body.position.x - x);
          const dy = Math.abs(body.position.y - y);
          // 실제 텍스트 크기 + 간격 고려하여 넉넉하게 체크
          return dx < (width + 50) && dy < (height + 30);
        });
        attempts++;
      }

      const body = Bodies.rectangle(x, y, width, height, {
        chamfer: { radius: 32 },
        restitution: 0.4,
        friction: 0.1,
        isStatic: true,
        render: {
          fillStyle: '#0891b2',
          strokeStyle: '#f0ebe3',
          lineWidth: 2
        }
      });

      (body as any).text = text;
      bodiesRef.current.push(body);
      World.add(engineRef.current.world, body);
    };

    useImperativeHandle(ref, () => ({
      addKeyword: (text: string) => {
        createKeywordBody(text);
      },
      popKeyword: (text: string) => {
        if (engineRef.current) {
          // 가장 최근에 추가된 해당 텍스트 바디 찾기 (뒤에서부터 검색)
          const idx = [...bodiesRef.current].reverse().findIndex(b => (b as any).text === text);
          if (idx !== -1) {
            const actualIdx = bodiesRef.current.length - 1 - idx;
            const body = bodiesRef.current[actualIdx];
            Matter.World.remove(engineRef.current.world, body);
            bodiesRef.current.splice(actualIdx, 1);
          }
        }
      },
      dropAll: () => {
        if (!engineRef.current) return;
        bodiesRef.current.forEach(body => {
          Matter.Body.setStatic(body, false);
          // 우수수 쏟아지는 다이나믹한 효과 (물리 힘 대폭 강화)
          Matter.Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.6);
          Matter.Body.applyForce(body, body.position, {
            x: (Math.random() - 0.5) * 0.15,
            y: 0.25 // 강한 중력 보조
          });
        });
      },
      reset: () => {
        if (engineRef.current) {
          const allBodies = Matter.Composite.allBodies(engineRef.current.world);
          allBodies.forEach(body => {
            if (!body.isStatic || (body as any).text) {
              Matter.World.remove(engineRef.current.world, body);
            }
          });
          bodiesRef.current = [];
        }
      }
    }));

    useEffect(() => {
      if (!containerRef.current || !canvasRef.current) return;

      const { Engine, Render, Runner, World, Bodies } = Matter;
      const engine = Engine.create();
      engineRef.current = engine;
      
      const render = Render.create({
        canvas: canvasRef.current,
        engine: engine,
        options: {
          width: window.innerWidth,
          height: window.innerHeight,
          background: 'transparent',
          wireframes: false,
          pixelRatio: window.devicePixelRatio,
        }
      });
      renderRef.current = render;

      const ground = Bodies.rectangle(window.innerWidth / 2, window.innerHeight + 50, window.innerWidth * 2, 100, { isStatic: true });
      World.add(engine.world, [ground]);

      Render.run(render);
      const runner = Runner.create();
      Runner.run(runner, engine);
      runnerRef.current = runner;

      const handleResize = () => {
        if (!canvasRef.current || !renderRef.current) return;
        renderRef.current.options.width = window.innerWidth;
        renderRef.current.options.height = window.innerHeight;
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      };

      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        Render.stop(render);
        Runner.stop(runner);
        Engine.clear(engine);
      };
    }, [containerRef]);

    useEffect(() => {
        let animId: number;
        const update = () => {
            const canvas = canvasRef.current;
            const ctx = canvas?.getContext('2d');
            if (ctx && canvas) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                
                ctx.font = 'bold 48px SUIT';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                
                bodiesRef.current.forEach(body => {
                    const { x, y } = body.position;
                    const angle = body.angle;
                    const text = (body as any).text;

                    ctx.save();
                    ctx.translate(x, y);
                    ctx.rotate(angle);
                    ctx.fillStyle = '#f0ebe3';
                    ctx.fillText(text, 0, 1);
                    ctx.restore();
                });
            }
            animId = requestAnimationFrame(update);
        };

        animId = requestAnimationFrame(update);
        return () => cancelAnimationFrame(animId);
    }, []);

    return (
      <canvas 
        ref={canvasRef} 
        style={{ 
          position: 'fixed', 
          inset: 0, 
          pointerEvents: 'none',
          zIndex: 500 // 로고(10001) 및 헤더(10000)보다 아래
        }} 
      />
    );
  }
);

FallingKeywordsStage.displayName = 'FallingKeywordsStage';

export default FallingKeywordsStage;
