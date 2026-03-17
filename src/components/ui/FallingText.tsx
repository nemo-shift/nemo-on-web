'use client';

import React, { useEffect, useRef, useState } from 'react';
import Matter from 'matter-js';

interface FallingTextProps {
  words: string[];
  trigger: boolean; // true가 되면 낙하 시작
  containerRect?: DOMRect;
}

/**
 * FallingText: Matter.js 기반 물리 텍스트 낙하 컴포넌트
 * - 키워드들이 중력에 의해 떨어지는 효과
 */
export const FallingText: React.FC<FallingTextProps> = ({ words, trigger }) => {
  const sceneRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<Matter.Engine | null>(null);
  const renderRef = useRef<Matter.Render | null>(null);
  const runnerRef = useRef<Matter.Runner | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!trigger || !sceneRef.current) return;

    // Matter.js 엔진 초기화
    const engine = Matter.Engine.create();
    const render = Matter.Render.create({
      element: sceneRef.current,
      engine: engine,
      options: {
        width: window.innerWidth,
        height: window.innerHeight,
        background: 'transparent',
        wireframes: false, // 실제 텍스트처럼 보이기 위해 false
      },
    });

    const runner = Matter.Runner.create();
    
    // 바닥과 벽 생성
    const ground = Matter.Bodies.rectangle(
      window.innerWidth / 2,
      window.innerHeight + 50,
      window.innerWidth,
      100,
      { isStatic: true }
    );
    const leftWall = Matter.Bodies.rectangle(
      -50,
      window.innerHeight / 2,
      100,
      window.innerHeight,
      { isStatic: true }
    );
    const rightWall = Matter.Bodies.rectangle(
      window.innerWidth + 50,
      window.innerHeight / 2,
      100,
      window.innerHeight,
      { isStatic: true }
    );

    Matter.World.add(engine.world, [ground, leftWall, rightWall]);

    // 텍스트 바디 생성
    const bodies = words.map((word, i) => {
      const x = (window.innerWidth / words.length) * (i + 0.5);
      const y = -100 - (i * 50);
      
      const body = Matter.Bodies.rectangle(x, y, word.length * 20, 40, {
        restitution: 0.5,
        friction: 0.1,
        render: {
          fillStyle: 'transparent', // Matter 기본 렌더러는 투명하게
        }
      });
      // @ts-ignore: 커스텀 속성 주입
      body.text = word;
      return body;
    });

    Matter.World.add(engine.world, bodies);

    // 커스텀 렌더링 루프 (텍스트 그리기)
    const context = render.context;
    const renderLoop = () => {
      if (!renderRef.current) return;
      
      // 배경 클리어 (Matter 기본 렌더링 이후 덮어쓰기 위해)
      // canvas.width = canvas.width; // 리셋용

      context.font = '700 18px SUIT, sans-serif';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      
      bodies.forEach(body => {
        const { x, y } = body.position;
        const angle = body.angle;
        
        context.save();
        context.translate(x, y);
        context.rotate(angle);
        
        // 텍스트 박스 배경 (약간 투명한 틸)
        context.fillStyle = 'rgba(8, 145, 178, 0.2)';
        context.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        context.lineWidth = 1;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const w = ((body as any).text as string).length * 22;
        context.beginPath();
        context.roundRect(-w / 2, -20, w, 40, 20);
        context.fill();
        context.stroke();
        
        // 텍스트 본체
        context.fillStyle = '#ffffff';
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        context.fillText((body as any).text as string, 0, 0);
        
        context.restore();
      });
      
      requestAnimationFrame(renderLoop);
    };

    Matter.Render.run(render);
    Matter.Runner.run(runner, engine);
    renderLoop();

    engineRef.current = engine;
    renderRef.current = render;
    runnerRef.current = runner;
    setIsInitialized(true);

    return () => {
      if (renderRef.current) Matter.Render.stop(renderRef.current);
      if (runnerRef.current) Matter.Runner.stop(runnerRef.current);
      if (engineRef.current) Matter.Engine.clear(engineRef.current);
      if (renderRef.current) renderRef.current.canvas.remove();
    };
  }, [trigger, words]);

  return (
    <div 
      ref={sceneRef} 
      className="fixed inset-0 pointer-events-none z-50 overflow-hidden" 
      style={{ opacity: isInitialized ? 1 : 0, transition: 'opacity 0.5s ease' }}
    />
  );
};
