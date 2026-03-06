'use client';

import { useEffect, useRef } from 'react';

const MIN_FONT_SIZE = 20;

type BigTypoRefs = {
  bt: HTMLDivElement;
  nemo: HTMLSpanElement;
  on: HTMLSpanElement;
  tri: HTMLSpanElement;
  cir: HTMLSpanElement;
  colon: HTMLSpanElement;
};

/**
 * 빅 타이포 폰트 사이즈를 뷰포트에 맞게 바이너리 서치로 계산
 */
function runSizeBigTypo(tc: HTMLDivElement, refs: BigTypoRefs, isMobile: boolean): void {
  const { bt, nemo, on, tri, cir, colon } = refs;

  const tcR = tc.getBoundingClientRect();
  const sectionEl = bt.closest('section');
  const sectionR = sectionEl?.getBoundingClientRect();
  const sectionH = sectionR?.height ?? window.innerHeight;
  const margin = Math.min(100, Math.max(60, sectionH * 0.08));
  const availH = sectionH - tcR.bottom + (sectionR?.top ?? 0) - margin;
  if (availH < 80) return;

  const parentWidth =
    bt.parentElement?.getBoundingClientRect().width ?? window.innerWidth;
  const availW = parentWidth - 16;
  let fs = Math.min(availH * 1.2, 500);
  const scale = isMobile ? 1 : 0.88;

  const applySize = (size: number): void => {
    // 네모와 ON 모두 전체 비례에 맞게 살짝 축소
    nemo.style.fontSize = `${size * 0.96}px`;
    on.style.fontSize = `${size * 0.9}px`;
    const triSz = size * 0.08;
    const cirSz = size * 0.12;
    tri.style.borderLeftWidth = `${triSz}px`;
    tri.style.borderRightWidth = `${triSz}px`;
    tri.style.borderBottomWidth = `${triSz * 1.7}px`;
    cir.style.width = `${cirSz}px`;
    cir.style.height = `${cirSz}px`;
    // 도형(△, ●) 간격과 네모·ON 사이 여백을 살짝 줄여 균형감 조정
    colon.style.gap = `${triSz * 0.4}px`;
    colon.style.margin = `0 ${size * 0.028}px`;
  };

  bt.style.width = `${availW}px`;
  bt.style.overflow = 'hidden';

  let lo = MIN_FONT_SIZE;
  let hi = fs;
  while (hi - lo > 1) {
    const mid = Math.floor((lo + hi) / 2);
    applySize(mid);
    if (bt.scrollWidth <= availW + 2) {
      lo = mid;
    } else {
      hi = mid;
    }
  }
  fs = Math.floor(lo * scale);
  applySize(fs);
  bt.style.overflow = 'visible';
  bt.style.minHeight = `${Math.min(availH, fs * 2)}px`;
  bt.style.alignItems = 'center';
}

/**
 * 빅 타이포 뷰포트 반응형 사이징 훅
 * tcRef 기준으로 사용 가능 영역 계산 후 binary search로 폰트 크기 결정
 */
export function useBigTypoSizing(
  tcRef: React.RefObject<HTMLDivElement | null>,
  isMobile = false,
): {
  btRef: React.RefObject<HTMLDivElement | null>;
  nemoRef: React.RefObject<HTMLSpanElement | null>;
  onRef: React.RefObject<HTMLSpanElement | null>;
  triRef: React.RefObject<HTMLSpanElement | null>;
  cirRef: React.RefObject<HTMLSpanElement | null>;
  colonRef: React.RefObject<HTMLSpanElement | null>;
  runResize: () => void;
} {
  const btRef = useRef<HTMLDivElement>(null);
  const nemoRef = useRef<HTMLSpanElement>(null);
  const onRef = useRef<HTMLSpanElement>(null);
  const triRef = useRef<HTMLSpanElement>(null);
  const cirRef = useRef<HTMLSpanElement>(null);
  const colonRef = useRef<HTMLSpanElement>(null);
  const isMobileRef = useRef(isMobile);
  isMobileRef.current = isMobile;

  const runResize = (): void => {
    const tc = tcRef.current;
    const bt = btRef.current;
    const nemo = nemoRef.current;
    const on = onRef.current;
    const tri = triRef.current;
    const cir = cirRef.current;
    const colon = colonRef.current;
    if (!tc || !bt || !nemo || !on || !tri || !cir || !colon) return;
    runSizeBigTypo(tc, { bt, nemo, on, tri, cir, colon }, isMobileRef.current);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      requestAnimationFrame(runResize);
    }, 100);

    let debounceTimer: ReturnType<typeof setTimeout>;
    const scheduleResize = (): void => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        requestAnimationFrame(() => requestAnimationFrame(runResize));
      }, 150);
    };

    window.addEventListener('resize', scheduleResize);

    const observer = new ResizeObserver(scheduleResize);
    const parent = btRef.current?.parentElement;
    if (parent) observer.observe(parent);

    return () => {
      observer.disconnect();
      clearTimeout(timer);
      clearTimeout(debounceTimer);
      window.removeEventListener('resize', scheduleResize);
    };
  }, []);

  useEffect(() => {
    requestAnimationFrame(() => requestAnimationFrame(runResize));
  }, [isMobile]);

  return { btRef, nemoRef, onRef, triRef, cirRef, colonRef, runResize };
}
