import { COLORS } from '@/constants/colors';

/**
 * 히어로 빅 타이포 파티클 애니메이션 (△○ 날아가는 효과)
 */

export function easeOutBack(t: number): number {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

export function easeInBack(t: number): number {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return c3 * t * t * t - c1 * t * t;
}

function flyParticle(
  isTri: boolean,
  fx: number,
  fy: number,
  tx: number,
  ty: number,
  delay: number,
  duration: number,
  easeFn: (t: number) => number,
  useDarkColors: boolean
): void {
  const isActuallyPCView = typeof window !== 'undefined' && window.innerWidth >= 992;
  const triSize = isActuallyPCView ? 26 : 16;
  const triH = isActuallyPCView ? triSize * 1.732 : triSize * 1.732;
  const cirSize = isActuallyPCView ? 32 : 22;
  const triColor = useDarkColors ? COLORS.HERO.OFF.ACCENT : COLORS.HERO.ON.ACCENT;
  const cirColor = useDarkColors ? COLORS.HERO.OFF.SUB_ACCENT : COLORS.HERO.ON.SUB_ACCENT;
  const div = document.createElement('div');
  div.style.cssText = `position:fixed;top:0;left:0;z-index:400;transform:translate(${fx}px,${fy}px);pointer-events:none;`;
  if (isTri) {
    div.style.width = '0';
    div.style.height = '0';
    div.style.borderLeft = `${triSize}px solid transparent`;
    div.style.borderRight = `${triSize}px solid transparent`;
    div.style.borderBottom = `${triH}px solid ${triColor}`;
  } else {
    div.style.width = `${cirSize}px`;
    div.style.height = `${cirSize}px`;
    div.style.borderRadius = '50%';
    div.style.background = cirColor;
  }
  document.body.appendChild(div);
  setTimeout(() => {
    const start = performance.now();
    const run = (): void => {
      const elapsed = performance.now() - start;
      const t = Math.min(elapsed / duration, 1);
      const e = easeFn(t);
      const x = fx + (tx - fx) * e;
      const y = fy + (ty - fy) * e;
      div.style.transform = `translate(${x}px,${y}px)`;
      if (t < 1) requestAnimationFrame(run);
      else div.remove();
    };
    requestAnimationFrame(run);
  }, delay);
}

export function runExplodeFromColon(tri: HTMLElement, cir: HTMLElement, onComplete: () => void): void {
  const tr = tri.getBoundingClientRect();
  const cr = cir.getBoundingClientRect();
  const tx = window.innerWidth * 0.7;
  const ty = window.innerHeight * 0.45;
  flyParticle(true, tr.left + tr.width / 2, tr.top + tr.height / 2, tx, ty, 0, 600, easeOutBack, false);
  flyParticle(false, cr.left + cr.width / 2, cr.top + cr.height / 2, tx + 80, ty, 80, 550, easeOutBack, false);
  setTimeout(onComplete, 620);
}

export function runFlyToShapes(
  tri: HTMLElement,
  cir: HTMLElement,
  stageEl: HTMLElement | null,
  onColonHide: (hidden: boolean) => void,
  onTriCirHover: (hovered: boolean) => void
): void {
  onColonHide(true);
  const tr = tri.getBoundingClientRect();
  const cr = cir.getBoundingClientRect();
  let tx: number;
  let ty: number;
  if (stageEl) {
    const sr = stageEl.getBoundingClientRect();
    tx = sr.left + sr.width / 2 - 40;
    ty = sr.top + sr.height / 2;
  } else {
    tx = window.innerWidth * 0.7;
    ty = window.innerHeight * 0.45;
  }
  flyParticle(true, tr.left + tr.width / 2, tr.top + tr.height / 2, tx, ty, 0, 500, easeOutBack, true);
  flyParticle(false, cr.left + cr.width / 2, cr.top + cr.height / 2, tx + 80, ty, 80, 480, easeOutBack, true);
  setTimeout(() => onTriCirHover(true), 320);
}

export function runImplodeToColon(tri: HTMLElement, cir: HTMLElement): void {
  const tr = tri.getBoundingClientRect();
  const cr = cir.getBoundingClientRect();
  const tx = window.innerWidth * 0.7;
  const ty = window.innerHeight * 0.45;
  flyParticle(true, tx, ty, tr.left + tr.width / 2, tr.top + tr.height / 2, 0, 500, easeInBack, true);
  flyParticle(false, tx + 80, ty, cr.left + cr.width / 2, cr.top + cr.height / 2, 50, 480, easeInBack, true);
}
