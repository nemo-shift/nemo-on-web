'use client';

import React, { useEffect, useRef, useState } from 'react';
import { homeContent } from '@/data/homeContent';
import { useBigTypoSizing } from '@/hooks';
import { runExplodeFromColon, runFlyToShapes, runImplodeToColon } from '@/lib';
import type { HeroBigTypoProps } from '@/types';

/**
 * HeroBigTypo — 빅 타이포 + 플래시 마우스오버 + flyParticle
 */
export default function HeroBigTypo({
  isOn,
  isMobile = false,
  tcRef,
  shapesStageRef,
  offShapes,
  onFlash,
  onExplodeComplete,
}: HeroBigTypoProps): React.ReactElement {
  const { bigTypo } = homeContent.hero;
  const { btRef, nemoRef, onRef, triRef, cirRef, colonRef } = useBigTypoSizing(tcRef);
  const [coverRevealed, setCoverRevealed] = useState(false);
  const [visible, setVisible] = useState(false);

  const flashMessage = (text: string): void => {
    if (!isOn) return;
    onFlash?.(text);
  };

  const flyToShapes = (): void => {
    const tri = triRef.current;
    const cir = cirRef.current;
    if (!tri || !cir) return;
    runFlyToShapes(
      tri,
      cir,
      shapesStageRef?.current ?? null,
      offShapes.onColonHide,
      offShapes.onTriCirHover
    );
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(true);
      setCoverRevealed(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const prevIsOnRef = useRef<boolean | null>(null);
  useEffect(() => {
    if (prevIsOnRef.current === null) {
      prevIsOnRef.current = isOn;
      return;
    }
    const tri = triRef.current;
    const cir = cirRef.current;
    if (!tri || !cir) return;

    if (isOn) {
      runExplodeFromColon(tri, cir, () => onExplodeComplete?.());
    } else {
      runImplodeToColon(tri, cir);
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
          onMouseLeave={() => !isOn && (offShapes.onColonHide(false), offShapes.onTriCirHover(false))}
          style={{
            display: 'inline-flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: !isOn && offShapes.colonHidden ? 0 : 1,
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
