import { useEffect, useRef, useState, type RefObject } from 'react';
import { COLORS } from '@/constants/colors';

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
 * - isOn=false: 다크 버전 SVG (크림·골드 계열)
 * - isOn=true: 라이트 버전 SVG (틸·딥틸 계열)
 * - isGathering=true: 모든 파티클이 중앙으로 빠르게 수렴
 */
export default function useParticles(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  isOn: boolean,
  isGathering: boolean = false
): UseParticlesReturn {
  const [particleAlpha, setParticleAlpha] = useState(1);

  const particleAlphaRef = useRef(1);
  const isOnRef = useRef(isOn);
  const prevIsOnRef = useRef(isOn);
  const isGatheringRef = useRef(isGathering);
  const rafRef = useRef<number>(0);
  const fadeRafRef = useRef<number>(0);
  const mouseRef = useRef({ x: 0, y: 0 });
  const ptsRef = useRef<Particle[]>([]);

  useEffect(() => {
    isGatheringRef.current = isGathering;
  }, [isGathering]);

  useEffect(() => {
    const wasOn = prevIsOnRef.current;
    isOnRef.current = isOn;
    prevIsOnRef.current = isOn;

    const target = isOn ? 0 : 1;
    const duration = isOn ? 1200 : 800;
    const start = performance.now();
    const from = particleAlphaRef.current;

    if (wasOn && !isOn && ptsRef.current.length > 0) {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      
      ptsRef.current.forEach((p) => {
        p.x = cx;
        p.y = cy;
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 8 + 4;
        p.vx = Math.cos(angle) * speed;
        p.vy = Math.sin(angle) * speed;
      });
    }

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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const setSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    setSize();

    ptsRef.current = Array.from({ length: 80 }, (_, i) => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      r: Math.random() * 1.3 + 0.4,
      a: Math.random() * 0.28 + 0.1,
      s: (['c', 't', 's'] as const)[i % 3],
    }));

    const drawParticle = (p: Particle) => {
      ctx.save();
      ctx.globalAlpha = p.a * particleAlphaRef.current;
      const useDarkColors = !isOnRef.current; // Assuming isOnRef.current means light mode
      const triColor = useDarkColors ? COLORS.HERO.OFF.ACCENT : COLORS.HERO.ON.ACCENT;
      const cirColor = useDarkColors ? COLORS.HERO.OFF.SUB_ACCENT : COLORS.HERO.ON.SUB_ACCENT;
      // The original 'col' variable was defined here.
      // Based on the new 'triColor' and 'cirColor', it seems the intention is to use these new colors.
      // Assuming 'col' should be replaced by a conditional choice between triColor and cirColor.
      // For now, I'll define 'col' based on the particle type, as it makes sense with the new colors.
      const col = p.s === 'c' ? cirColor : triColor;
      ctx.strokeStyle = col;
      ctx.lineWidth = 0.6;
      ctx.translate(p.x, p.y);

      if (p.s === 'c') {
        ctx.beginPath();
        ctx.arc(0, 0, p.r * 4.5, 0, Math.PI * 2);
        ctx.stroke();
      } else if (p.s === 't') {
        const s = p.r * 5;
        ctx.beginPath();
        ctx.moveTo(0, -s);
        ctx.lineTo(s, s);
        ctx.lineTo(-s, s);
        ctx.closePath();
        ctx.stroke();
      } else {
        const s = p.r * 4.5;
        ctx.strokeRect(-s, -s, s * 2, s * 2);
      }
      ctx.restore();
    };

    const animate = () => {
      const alpha = particleAlphaRef.current;
      const on = isOnRef.current;
      const gathering = isGatheringRef.current;

      if (on) {
        // 온모드에서는 캔버스를 완전히 비워 HeroSection의 배경색이 그대로 보이게 하고 불필요한 잔상을 없앰
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        rafRef.current = requestAnimationFrame(animate);
        return; // 온모드에서는 아래의 파티클 그리기 로직을 수행하지 않음
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }

      if (alpha > 0.005) {
        const { x: pmx, y: pmy } = mouseRef.current;
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;

        const g = ctx.createRadialGradient(pmx, pmy, 0, pmx, pmy, 280);
        g.addColorStop(0, on
          ? `${COLORS.HERO.ON.ACCENT}10` // 0.06 alpha approx
          : `${COLORS.HERO.OFF.ACCENT}14` // 0.08 alpha approx
        );
        g.addColorStop(1, 'transparent');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < ptsRef.current.length; i++) {
          for (let j = i + 1; j < ptsRef.current.length; j++) {
            const dx = ptsRef.current[i].x - ptsRef.current[j].x;
            const dy = ptsRef.current[i].y - ptsRef.current[j].y;
            const d = Math.sqrt(dx * dx + dy * dy);
            if (d < 110) {
              ctx.save();
              ctx.globalAlpha = (1 - d / 110) * 0.08 * alpha;
              ctx.strokeStyle = on ? COLORS.HERO.ON.ACCENT : COLORS.TEXT.LIGHT;
              ctx.lineWidth = 0.4;
              ctx.beginPath();
              ctx.moveTo(ptsRef.current[i].x, ptsRef.current[i].y);
              ctx.lineTo(ptsRef.current[j].x, ptsRef.current[j].y);
              ctx.stroke();
              ctx.restore();
            }
          }
        }

        ptsRef.current.forEach((p) => {
          if (gathering) {
            const dx = cx - p.x;
            const dy = cy - p.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            p.vx += (dx / dist) * 1.2;
            p.vy += (dy / dist) * 1.2;
            p.vx *= 0.85;
            p.vy *= 0.85;
          } else {
            const dx = p.x - pmx;
            const dy = p.y - pmy;
            const d = Math.sqrt(dx * dx + dy * dy);
            if (d < 90 && d > 0) {
              p.vx += (dx / d) * 0.08;
              p.vy += (dy / d) * 0.08;
            }
            p.vx *= on ? 0.7 : 0.98; // 온모드 진입 시(fade out) 속도 빠르게 감쇄
            p.vy *= on ? 0.7 : 0.98;
          }
          
          p.x += p.vx;
          p.y += p.vy;

          if (!gathering) {
            if (p.x < 0) p.x = canvas.width;
            if (p.x > canvas.width) p.x = 0;
            if (p.y < 0) p.y = canvas.height;
            if (p.y > canvas.height) p.y = 0;
          }
          drawParticle(p);
        });
      }
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', handleMouseMove);

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
