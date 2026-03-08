'use client';

import { useEffect, useRef, useCallback } from 'react';

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

  tc.getBoundingClientRect();
  const sectionEl = bt.closest('section');
  const sectionR = sectionEl?.getBoundingClientRect();
  const sectionH = sectionR?.height ?? window.innerHeight;
  const sectionW = sectionR?.width ?? window.innerWidth;
  
  // [v25.61] 상호 비례 축소: 화면 높이에 따른 유연한 마진 배분
  // 창 높이가 작아질수록 마진을 극한으로 줄여(최소 20px) 겹침 방지
  const safeMargin = Math.min(80, Math.max(20, sectionH * 0.08));
  const phraseSpace = sectionH * (isMobile ? 0.35 : 0.28); // PC 점유 비율 소폭 하향
  const availH = sectionH - phraseSpace - safeMargin;
  if (availH < 30) return;

  const parentWidth = bt.parentElement?.getBoundingClientRect().width ?? sectionW;
  // [v25.44] 모바일은 이전처럼 최소 여백(16px)만 남기고 꽉 채움. PC는 균형을 위해 여백(96px) 유지.
  const availW = parentWidth - (isMobile ? 16 : 96);
  
  // [v25.44] 모바일은 상한선 없이 가용한 높이를 최대한 활용(이전 로직). PC만 상한선 적용.
  const MAX_FONT_SIZE = 420;
  const fsLimit = isMobile ? Math.min(availH * 1.4, 600) : Math.min(availH * 1.35, MAX_FONT_SIZE); 
  
  const applySize = (size: number): void => {
    nemo.style.fontSize = `${size * (isMobile ? 1 : 0.96)}px`; // 모바일 비례 원복
    on.style.fontSize = `${size * (isMobile ? 1 : 0.9)}px`;   // 모바일 비례 원복
    const triSz = size * 0.08;
    const cirSz = size * 0.12;
    tri.style.borderLeftWidth = `${triSz}px`;
    tri.style.borderRightWidth = `${triSz}px`;
    tri.style.borderBottomWidth = `${triSz * 1.732}px`;
    cir.style.width = `${cirSz}px`;
    cir.style.height = `${cirSz}px`;
    colon.style.gap = `${triSz * 0.4}px`;
    colon.style.margin = `0 ${size * 0.028}px`;
  };

  // [v25.45] 측정 시에는 실제 텍스트 너비가 반영되도록 처리
  bt.style.width = 'max-content'; 
  bt.style.display = 'flex';
  bt.style.overflow = 'hidden';

  let lo = MIN_FONT_SIZE;
  let hi = fsLimit;
  while (hi - lo > 1) {
    const mid = Math.floor((lo + hi) / 2);
    applySize(mid);
    // 실제 텍스트 너비(scrollWidth)가 가용 너비(availW) 내부에 들어오는지 확인
    if (bt.scrollWidth <= availW + (isMobile ? 2 : 0)) {
      lo = mid;
    } else {
      hi = mid;
    }
  }
  
  // 최종 사이즈 결정
  const scale = 1;
  const fs = Math.floor(lo * scale); 
  applySize(fs);
  
  // [v25.45] 최종 결과 적용 후 PC에서만 중앙 정렬을 위해 100% 너비 및 center 적용
  bt.style.width = isMobile ? `${availW}px` : '100%'; 
  bt.style.justifyContent = isMobile ? 'flex-start' : 'center'; 
  bt.style.overflow = 'visible';
  bt.style.height = 'auto';
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
  useEffect(() => {
    isMobileRef.current = isMobile;
  }, [isMobile]);

  const runResize = useCallback((): void => {
    const tc = tcRef.current;
    const bt = btRef.current;
    const nemo = nemoRef.current;
    const on = onRef.current;
    const tri = triRef.current;
    const cir = cirRef.current;
    const colon = colonRef.current;
    if (!tc || !bt || !nemo || !on || !tri || !cir || !colon) return;
    runSizeBigTypo(tc, { bt, nemo, on, tri, cir, colon }, isMobileRef.current);
  }, [tcRef]); // refs are stable, so only tcRef (though it is also stable)

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
  }, [runResize]);

  useEffect(() => {
    requestAnimationFrame(() => requestAnimationFrame(runResize));
  }, [isMobile, runResize]);

  return { btRef, nemoRef, onRef, triRef, cirRef, colonRef, runResize };
}
