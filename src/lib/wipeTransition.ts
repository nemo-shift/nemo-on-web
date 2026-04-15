import gsap from 'gsap';

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
export function runWipeTransition(box: HTMLDivElement | null, onDone: () => void, color: string = WIPE_COLOR): void {
  if (!box) {
    onDone();
    return;
  }

  // [V11.16 교훈] JOURNEY_LOGO(10001)보다 높아야 하므로 11000으로 명시적 격상. 
  // 단순한 9999는 로고를 이기지 못함 (interaction.ts 참조 필수)
  // [V11.15 Fix] cssText 대신 Object.assign을 사용하여 리액트/GSAP이 보존해야 히는 기존 스타일 충돌 방지
  const maxSize = Math.max(window.innerWidth, window.innerHeight) * 1.6;
  
  Object.assign(box.style, {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '0px',
    height: '0px',
    opacity: '1',
    background: color,
    borderRadius: '0px',
    zIndex: '11000', // 로고(10001)를 확실히 덮는 최상위 수치
    pointerEvents: 'none',
    display: 'block'
  });

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

      // [V11.23] GSAP 시네마틱 페이드아웃
      gsap.to(box, {
        opacity: 0,
        duration: 0.6,
        ease: 'power2.inOut',
        delay: 0.15,
        onComplete: () => {
          Object.assign(box.style, {
            width: '0px',
            height: '0px',
            opacity: '0',
            display: 'none'
          });
        }
      });
    }
  };

  requestAnimationFrame(expand);
}

