/**
 * 와이프 전환 애니메이션
 * 틸 사각형이 중앙에서 확장 → onDone 콜백 → 박스 fade out
 */

const WIPE_COLOR = '#0891b2';
const DURATION = 480;

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/**
 * 와이프 박스에 확장 애니메이션 실행 후 onDone 호출
 */
export function runWipeTransition(box: HTMLDivElement | null, onDone: () => void): void {
  if (!box) {
    onDone();
    return;
  }

  const maxSize = Math.max(window.innerWidth, window.innerHeight) * 1.6;
  box.style.cssText = `
    position:fixed; top:50%; left:50%;
    transform:translate(-50%,-50%);
    transition:none;
    width:0; height:0; opacity:1;
    background:${WIPE_COLOR};
    border-radius:0;
    z-index:500;
    pointer-events:none;
  `;

  const start = performance.now();

  const expand = (): void => {
    const t = Math.min((performance.now() - start) / DURATION, 1);
    const e = easeInOutCubic(t);
    const s = e * maxSize;
    box.style.width = `${s}px`;
    box.style.height = `${s}px`;

    if (t < 1) {
      requestAnimationFrame(expand);
    } else {
      onDone();
      setTimeout(() => {
        box.style.transition = 'opacity 0.4s ease';
        box.style.opacity = '0';
        setTimeout(() => {
          box.style.cssText = `position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);width:0;height:0;opacity:0;background:${WIPE_COLOR};border-radius:0;z-index:500;pointer-events:none;`;
        }, 420);
      }, 140);
    }
  };

  requestAnimationFrame(expand);
}
