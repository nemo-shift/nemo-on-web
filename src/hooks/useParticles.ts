import { useEffect, useRef, useState, type RefObject } from 'react';

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  a: number;
  s: 'c' | 't' | 's'; // 원 / 삼각 / 사각
};

type UseParticlesReturn = {
  particleAlpha: number; // 파티클 투명도 (0~1)
};

/**
 * useParticles 훅
 *
 * 배경 캔버스에 파티클(원/삼각/사각 3종)을 렌더링한다.
 * - isOn=false: 크림 파티클, 투명도 1
 * - isOn=true: 틸 파티클, 투명도 0으로 페이드
 * - 마우스 근접 시 파티클 밀려남
 * - 100px 이내 파티클 간 연결선
 *
 * @param canvasRef - 렌더링할 캔버스 ref
 * @param isOn - 히어로 ON/OFF 상태
 */
export default function useParticles(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  isOn: boolean
): UseParticlesReturn {
  const [particleAlpha, setParticleAlpha] = useState(1);

  const particleAlphaRef = useRef(1);
  const isOnRef = useRef(isOn);
  const rafRef = useRef<number>(0);
  const fadeRafRef = useRef<number>(0);
  const mouseRef = useRef({ x: 0, y: 0 });
  const ptsRef = useRef<Particle[]>([]);

  // isOn 변경 시 파티클 알파 페이드
  useEffect(() => {
    isOnRef.current = isOn;
    const target = isOn ? 0 : 1;
    const duration = isOn ? 1000 : 800;
    const start = performance.now();
    const from = particleAlphaRef.current;

    cancelAnimationFrame(fadeRafRef.current);

    const fade = () => {
      const t = Math.min((performance.now() - start) / duration, 1);
      particleAlphaRef.current = from + (target - from) * t;
      setParticleAlpha(particleAlphaRef.current);
      if (t < 1) {
        fadeRafRef.current = requestAnimationFrame(fade);
      } else {
        particleAlphaRef.current = target;
      }
    };

    fadeRafRef.current = requestAnimationFrame(fade);

    return () => cancelAnimationFrame(fadeRafRef.current);
  }, [isOn]);

  // 캔버스 초기화 및 애니메이션 루프
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 캔버스 크기 초기화
    const setSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    setSize();

    // 파티클 65개 생성
    ptsRef.current = Array.from({ length: 65 }, (_, i) => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.2,
      vy: (Math.random() - 0.5) * 0.2,
      r: Math.random() * 1.1 + 0.3,
      a: Math.random() * 0.22 + 0.04,
      s: (['c', 't', 's'] as const)[i % 3],
    }));

    // 단일 파티클 그리기
    const drawParticle = (p: Particle) => {
      ctx.save();
      ctx.globalAlpha = p.a * particleAlphaRef.current;
      const col = isOnRef.current ? 'rgba(8,145,178,.6)' : '#f0ebe3';
      ctx.strokeStyle = col;
      ctx.lineWidth = 0.4;
      ctx.translate(p.x, p.y);

      if (p.s === 'c') {
        ctx.beginPath();
        ctx.arc(0, 0, p.r * 4, 0, Math.PI * 2);
        ctx.stroke();
      } else if (p.s === 't') {
        const s = p.r * 4.5;
        ctx.beginPath();
        ctx.moveTo(0, -s);
        ctx.lineTo(s, s);
        ctx.lineTo(-s, s);
        ctx.closePath();
        ctx.stroke();
      } else {
        const s = p.r * 4;
        ctx.strokeRect(-s, -s, s * 2, s * 2);
      }
      ctx.restore();
    };

    // 애니메이션 루프
    const animate = () => {
      const alpha = particleAlphaRef.current;
      const on = isOnRef.current;

      if (on) {
        // ON 상태: 크림 배경 채우기
        ctx.fillStyle = 'rgba(250,247,242,0.93)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }

      if (alpha > 0.005) {
        const { x: pmx, y: pmy } = mouseRef.current;

        // 마우스 주변 반경 그라디언트
        const g = ctx.createRadialGradient(pmx, pmy, 0, pmx, pmy, 250);
        g.addColorStop(0, on
          ? `rgba(8,145,178,${0.04 * alpha})`
          : `rgba(196,168,130,${0.05 * alpha})`
        );
        g.addColorStop(1, 'transparent');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 파티클 간 연결선 (100px 이내)
        for (let i = 0; i < ptsRef.current.length; i++) {
          for (let j = i + 1; j < ptsRef.current.length; j++) {
            const dx = ptsRef.current[i].x - ptsRef.current[j].x;
            const dy = ptsRef.current[i].y - ptsRef.current[j].y;
            const d = Math.sqrt(dx * dx + dy * dy);
            if (d < 100) {
              ctx.save();
              ctx.globalAlpha = (1 - d / 100) * 0.045 * alpha;
              ctx.strokeStyle = on ? '#0891b2' : '#f0ebe3';
              ctx.lineWidth = 0.3;
              ctx.beginPath();
              ctx.moveTo(ptsRef.current[i].x, ptsRef.current[i].y);
              ctx.lineTo(ptsRef.current[j].x, ptsRef.current[j].y);
              ctx.stroke();
              ctx.restore();
            }
          }
        }

        // 파티클 업데이트 및 그리기
        ptsRef.current.forEach((p) => {
          const dx = p.x - pmx;
          const dy = p.y - pmy;
          const d = Math.sqrt(dx * dx + dy * dy);
          // 마우스 80px 이내: 밀어냄
          if (d < 80 && d > 0) {
            p.vx += (dx / d) * 0.06;
            p.vy += (dy / d) * 0.06;
          }
          p.vx *= 0.98;
          p.vy *= 0.98;
          p.x += p.vx;
          p.y += p.vy;

          // 경계 처리 (반대편으로 이동)
          if (p.x < 0) p.x = canvas.width;
          if (p.x > canvas.width) p.x = 0;
          if (p.y < 0) p.y = canvas.height;
          if (p.y > canvas.height) p.y = 0;

          drawParticle(p);
        });
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    // 마우스 추적
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', handleMouseMove);

    // 리사이즈 대응
    const handleResize = () => setSize();
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
    };
  }, [canvasRef]);

  return { particleAlpha };
}
