'use client';

import React, { useEffect, useRef, useState } from 'react';
import { homeContent } from '@/data/homeContent';

type HeroBigTypoProps = {
  isOn: boolean;
  isMobile?: boolean;
  tcRef: React.RefObject<HTMLDivElement | null>;
  shapesStageRef?: React.RefObject<HTMLDivElement | null>;
  shapesOffColonHidden?: boolean;
  shapesOffHovered?: boolean;
  onFlash?: (text: string) => void;
  onColonHideInOff?: (hidden: boolean) => void;
  onTriCirHover?: (hovered: boolean) => void;
  onExplodeComplete?: () => void;
};

// easeOutBack / easeInBack
const easeOutBack = (t: number): number => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};
const easeInBack = (t: number): number => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return c3 * t * t * t - c1 * t * t;
};

/**
 * HeroBigTypo — 빅 타이포 + 플래시 마우스오버 + flyParticle
 */
export default function HeroBigTypo({ isOn, isMobile = false, tcRef, shapesStageRef, shapesOffColonHidden = false, shapesOffHovered = false, onFlash, onColonHideInOff, onTriCirHover, onExplodeComplete }: HeroBigTypoProps): React.ReactElement {
  const { bigTypo } = homeContent.hero;
  const btRef = useRef<HTMLDivElement>(null);
  const nemoRef = useRef<HTMLSpanElement>(null);
  const onRef = useRef<HTMLSpanElement>(null);
  const triRef = useRef<HTMLSpanElement>(null);
  const cirRef = useRef<HTMLSpanElement>(null);
  const colonRef = useRef<HTMLSpanElement>(null);
  const [coverRevealed, setCoverRevealed] = useState(false);
  const [visible, setVisible] = useState(false);

  const MIN_FONT_SIZE = 20;

  const sizeBigTypo = () => {
    const bt = btRef.current;
    const tc = tcRef.current;
    if (!bt || !tc) return;

    const tcR = tc.getBoundingClientRect();
    const sectionEl = bt.closest('section');
    const sectionR = sectionEl?.getBoundingClientRect();
    const sectionH = sectionR?.height ?? window.innerHeight;
    const margin = Math.min(100, Math.max(60, sectionH * 0.08));
    const availH = sectionH - tcR.bottom + (sectionR?.top ?? 0) - margin;
    if (availH < 80) return;

    const parentWidth = bt.parentElement?.getBoundingClientRect().width ?? window.innerWidth;
    const availW = parentWidth - 16;
    let fs = Math.min(availH * 1.2, 500);

    const nemoEl = nemoRef.current;
    const onEl = onRef.current;
    const triEl = triRef.current;
    const cirEl = cirRef.current;
    const colonEl = colonRef.current;
    if (!nemoEl || !onEl || !triEl || !cirEl || !colonEl) return;

    const applySize = (size: number) => {
      nemoEl.style.fontSize = `${size * 0.82}px`;
      onEl.style.fontSize = `${size}px`;
      const triSz = size * 0.08;
      const cirSz = size * 0.12;
      triEl.style.borderLeftWidth = `${triSz}px`;
      triEl.style.borderRightWidth = `${triSz}px`;
      triEl.style.borderBottomWidth = `${triSz * 1.7}px`;
      cirEl.style.width = `${cirSz}px`;
      cirEl.style.height = `${cirSz}px`;
      colonEl.style.gap = `${triSz * 0.5}px`;
      colonEl.style.margin = `0 ${size * 0.04}px`;
    };

    // scrollWidth가 overflow:visible에서 항상 offsetWidth를 반환하는 문제를 막기 위해
    // binary search 전에 width를 availW로 고정해 overflow 여부를 정확히 측정
    bt.style.width = `${availW}px`;
    bt.style.overflow = 'hidden';

    // binary search: ~9회 만에 수렴
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
    fs = lo;
    applySize(fs);
    bt.style.overflow = 'visible';
    bt.style.minHeight = `${Math.min(availH, fs * 2)}px`;
    bt.style.alignItems = 'center';
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      requestAnimationFrame(() => sizeBigTypo());
      setVisible(true);
      setCoverRevealed(true);
    }, 100);

    const handleResize = () => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => sizeBigTypo());
      });
    };
    window.addEventListener('resize', handleResize);

    const observer = new ResizeObserver(() => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => sizeBigTypo());
      });
    });
    const parent = btRef.current?.parentElement;
    if (parent) observer.observe(parent);

    return () => {
      observer.disconnect();
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const flashMessage = (text: string) => {
    if (!isOn) return;
    onFlash?.(text);
  };

  // flyParticle: ON 시 explodeFromColon(라이트), OFF 시 implodeToColon(다크)
  const triColorLight = '#0891b2';
  const cirColorLight = '#0e7490';
  const triColorDark = '#e8d5b0';
  const cirColorDark = '#c4a882';

  const flyParticle = (
    isTri: boolean,
    fx: number,
    fy: number,
    tx: number,
    ty: number,
    delay: number,
    duration: number,
    easeFn: (t: number) => number,
    useDarkColors: boolean
  ) => {
    const isPc = typeof window !== 'undefined' && window.innerWidth >= 768;
    const triSize = isPc ? 26 : 16;
    const triH = isPc ? 42 : 26;
    const cirSize = isPc ? 32 : 22;

    const triColor = useDarkColors ? triColorDark : triColorLight;
    const cirColor = useDarkColors ? cirColorDark : cirColorLight;
    const div = document.createElement('div');
    div.style.cssText = `
      position:fixed; top:0; left:0; z-index:400;
      transform:translate(${fx}px,${fy}px);
      pointer-events:none;
    `;
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
      const run = () => {
        const elapsed = performance.now() - start;
        const t = Math.min(elapsed / duration, 1);
        const e = easeFn(t);
        const x = fx + (tx - fx) * e;
        const y = fy + (ty - fy) * e;
        div.style.transform = `translate(${x}px,${y}px)`;
        if (t < 1) {
          requestAnimationFrame(run);
        } else {
          div.remove();
        }
      };
      requestAnimationFrame(run);
    }, delay);
  };

  const explodeFromColon = () => {
    const tri = triRef.current;
    const cir = cirRef.current;
    if (!tri || !cir) return;
    const tr = tri.getBoundingClientRect();
    const cr = cir.getBoundingClientRect();
    const tx = window.innerWidth * 0.7;
    const ty = window.innerHeight * 0.45;
    flyParticle(true, tr.left + tr.width / 2, tr.top + tr.height / 2, tx, ty, 0, 600, easeOutBack, false);
    flyParticle(false, cr.left + cr.width / 2, cr.top + cr.height / 2, tx + 80, ty, 80, 550, easeOutBack, false);
    setTimeout(() => onExplodeComplete?.(), 620);
  };

  // OFF 모드: 메인타이틀 △○ 호버 시 파티클이 도형모음으로 날아가며 페이드인
  const flyToShapes = () => {
    const tri = triRef.current;
    const cir = cirRef.current;
    const stageEl = shapesStageRef?.current;
    if (!tri || !cir) return;

    onColonHideInOff?.(true);
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
    setTimeout(() => onTriCirHover?.(true), 320);
  };

  const implodeToColon = () => {
    const tri = triRef.current;
    const cir = cirRef.current;
    if (!tri || !cir) return;
    const tr = tri.getBoundingClientRect();
    const cr = cir.getBoundingClientRect();
    const tx = window.innerWidth * 0.7;
    const ty = window.innerHeight * 0.45;
    flyParticle(true, tx, ty, tr.left + tr.width / 2, tr.top + tr.height / 2, 0, 500, easeInBack, true);
    flyParticle(false, tx + 80, ty, cr.left + cr.width / 2, cr.top + cr.height / 2, 50, 480, easeInBack, true);
  };

  const prevIsOnRef = useRef<boolean | null>(null);
  useEffect(() => {
    if (prevIsOnRef.current === null) {
      prevIsOnRef.current = isOn;
      return;
    }
    if (isOn) {
      explodeFromColon();
    } else {
      implodeToColon();
    }
    prevIsOnRef.current = isOn;
  }, [isOn]);

  return (
    <>
      <style>{`
        .bt-on-mode .bt-hover-nemo:hover { transform: scale(1.06); }
        .bt-on-mode .bt-hover-tri:hover { transform: scale(1.2); filter: brightness(1.15); }
        .bt-on-mode .bt-hover-cir:hover { transform: scale(1.25); background: var(--accent) !important; }
        .bt-on-mode .bt-hover-on:hover { transform: scale(1.06); }
        .bt-on-mode .bt-hover-on:hover > span { filter: brightness(1.15); }
        .bt-hover-nemo, .bt-hover-tri, .bt-hover-cir, .bt-hover-on {
          display: inline-block;
          transition: transform 0.35s ease, filter 0.35s ease, background 0.35s ease;
        }
      `}</style>
      <div
        ref={btRef}
        className={isOn ? 'bt-on-mode' : undefined}
        style={{
          position: 'relative',
          zIndex: 20,
          marginTop: 'auto',
          paddingTop: 'clamp(16px, 2.5vh, 36px)',
          display: 'flex',
          alignItems: 'center',
          overflow: 'visible',
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(50px)',
          transition: 'opacity 1s ease, transform 1.2s cubic-bezier(0.16,1,0.3,1)',
        }}
      >
        <span
          ref={nemoRef}
          className="bt-hover-nemo"
          data-bt="nemo"
          onMouseEnter={() => flashMessage('당신의 결로')}
          style={{
            fontFamily: 'var(--font-bebas)',
            color: isOn ? 'var(--fg)' : 'rgba(240,235,227,.18)',
            lineHeight: 0.88,
            whiteSpace: 'nowrap',
            transition: 'color .7s ease',
            cursor: isOn ? 'pointer' : 'default',
          }}
        >
          {bigTypo.nemo}
        </span>

        <span
          ref={colonRef}
          onMouseEnter={() => !isOn && !isMobile && flyToShapes()}
          onClick={() => !isOn && isMobile && flyToShapes()}
          onMouseLeave={() => !isOn && (onColonHideInOff?.(false), onTriCirHover?.(false))}
          style={{
            display: 'inline-flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: !isOn && shapesOffColonHidden ? 0 : 1,
            transition: 'opacity 0.2s ease',
          }}
        >
          <span
            ref={triRef}
            className="bt-hover-tri"
            data-bt="tri"
            onMouseEnter={() => flashMessage('구조를 더해')}
            onClick={() => !isOn && isMobile && flyToShapes()}
            style={{
              display: 'block',
              width: 0,
              height: 0,
              borderLeft: '8px solid transparent',
              borderRight: '8px solid transparent',
              borderBottom: '14px solid var(--accent)',
              transition: 'border-bottom-color .7s',
              cursor: isOn ? 'pointer' : 'default',
            }}
          />
          <span
            ref={cirRef}
            className="bt-hover-cir"
            data-bt="cir"
            onMouseEnter={() => flashMessage('감성위에')}
            onClick={() => !isOn && isMobile && flyToShapes()}
            style={{
              display: 'block',
              borderRadius: '50%',
              background: 'var(--sub)',
              width: '12px',
              height: '12px',
              transition: 'background .7s',
              cursor: isOn ? 'pointer' : 'default',
            }}
          />
        </span>

        <span
          ref={onRef}
          className="bt-hover-on"
          data-bt="on-on"
          onMouseEnter={() => flashMessage('함께')}
          style={{
            fontFamily: 'var(--font-bebas)',
            lineHeight: 0.88,
            whiteSpace: 'nowrap',
            position: 'relative',
            cursor: isOn ? 'pointer' : 'default',
          }}
        >
          <span
            style={{
              color: 'rgba(240,235,227,.45)',
              opacity: isOn ? 0 : 1,
              transition: 'opacity .8s ease',
            }}
          >
            {bigTypo.off}
          </span>
          <span
            style={{
              color: 'var(--accent)',
              position: 'absolute',
              left: 0,
              top: 0,
              opacity: isOn ? 1 : 0,
              transition: 'opacity .8s ease',
            }}
          >
            {bigTypo.on}
          </span>
        </span>

        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'var(--bg)',
            transformOrigin: 'left',
            transform: coverRevealed ? 'scaleX(0)' : 'scaleX(1)',
            opacity: coverRevealed ? 0 : 1,
            transition: 'transform 1s cubic-bezier(0.77,0,.18,1), opacity 0.5s ease, background .7s',
            zIndex: 2,
            pointerEvents: 'none',
          }}
        />
      </div>
    </>
  );
}
