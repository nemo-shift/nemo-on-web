'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useMousePosition } from '@/hooks';
import { useDevice } from '@/context';

type PointRingCursorProps = {
  isOn: boolean; // ON 상태 여부 — 색상 전환에 사용 [Required]
};

/**
 * PointRingCursor 컴포넌트
 *
 * 마우스 커서를 숨기고 커스텀 point + ring 커서를 렌더링한다.
 * - 태블릿/모바일(Touch Mode)에서는 숨기고 PC(Mouse Mode)에서만 표시
 * - OFF: point #e8d5b0, ring rgba(196,168,130,.3)
 * - ON: point rgba(8,145,178,.7), ring rgba(8,145,178,.35)
 * - 인터랙티브 요소 hover 시 링이 네모(50×50, border-radius 4px)로 변환
 *
 * @param {boolean} isOn - ON/OFF 상태 [Required]
 *
 * Example usage:
 * <PointRingCursor isOn={isOn} />
 */
export default function PointRingCursor({ isOn }: PointRingCursorProps): React.ReactElement | null {
  const [mounted, setMounted] = useState(false);
  const [cursorType, setCursorType] = useState<'default' | 'pointer' | 'contact'>('default');
  const isHover = cursorType !== 'default';
  const { position } = useMousePosition();
  const { interactionMode } = useDevice();
  const positionRef = useRef(position);
  const pointRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number>(0);
  const isHoverRef = useRef(false);

  useEffect(() => {
    positionRef.current = position;
  }, [position]);

  useEffect(() => {
    isHoverRef.current = isHover;
  }, [isHover]);

  const showCursor = interactionMode === 'mouse';

  // 클라이언트 마운트 후에만 커서 렌더 (하이드레이션 불일치 방지)
  useEffect(() => {
    requestAnimationFrame(() => setMounted(true));
  }, []);

  // 기본 커서 숨기기 — html에 클래스 부여 (인라인 cursor:pointer 등 덮어쓰기)
  useEffect(() => {
    if (!mounted || !showCursor) return;
    document.documentElement.classList.add('custom-cursor-active');
    return () => {
      document.documentElement.classList.remove('custom-cursor-active');
    };
  }, [mounted, showCursor]);

  // 인터랙티브 요소 호버 시 링 → 네모 변환
  useEffect(() => {
    if (!mounted) return;
    const selectors = 'a, button, [data-cursor="pointer"], .pill, [data-bt], [role="button"], [data-cursor="contact"]';

    const onEnter = (e: Event) => {
      const target = e.currentTarget as HTMLElement;
      const type = target.getAttribute('data-cursor');
      if (type === 'contact') {
        setCursorType('contact');
      } else {
        setCursorType('pointer');
      }
    };
    const onLeave = () => setCursorType('default');

    // 현재 리스너가 등록된 요소 목록 추적 (중복 등록 방지)
    const trackedElements = new Set<Element>();

    const detachAll = () => {
      trackedElements.forEach((el) => {
        el.removeEventListener('mouseenter', onEnter);
        el.removeEventListener('mouseleave', onLeave);
      });
      trackedElements.clear();
    };

    const attach = () => {
      // 기존 리스너를 모두 제거한 뒤 다시 등록 (누적 방지)
      detachAll();
      document.querySelectorAll(selectors).forEach((el) => {
        el.addEventListener('mouseenter', onEnter);
        el.addEventListener('mouseleave', onLeave);
        trackedElements.add(el);
      });
    };

    attach();
    const observer = new MutationObserver(attach);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      detachAll();
    };
  }, [mounted]);

  // point + ring 부드러운 따라오기 (lerp 애니메이션)
  useEffect(() => {
    let px = 0;
    let py = 0;
    let rx = 0;
    let ry = 0;
    const POINT_LERP = 0.3;
    const RING_LERP = 0.15;

    const animate = () => {
      const { x, y } = positionRef.current;
      px += (x - px) * POINT_LERP;
      py += (y - py) * POINT_LERP;
      rx += (x - rx) * RING_LERP;
      ry += (y - ry) * RING_LERP;

      if (pointRef.current) {
        pointRef.current.style.transform = `translate3d(${px - 4}px, ${py - 4}px, 0)`;
      }
      if (ringRef.current) {
        let size = 30;
        if (cursorType === 'pointer') size = 50;
        if (cursorType === 'contact') size = 80; // contact는 좀 더 크게
        const half = size / 2;
        ringRef.current.style.transform = `translate3d(${rx - half}px, ${ry - half}px, 0)`;
      }
      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  // ON/OFF 상태에 따른 색상
  const pointColor = isOn ? 'rgba(8,145,178,.7)' : '#e8d5b0';
  const ringColor = isOn ? 'rgba(8,145,178,.35)' : 'rgba(196,168,130,.3)';
  const squareColor = '#E8734A'; // 네모(호버) 색상

  // document.body에 포탈 — Lenis 등 transform 부모 밖에서 position:fixed가 뷰포트 기준으로 동작
  const cursorContent = (
    <>
      {/* 중심 점 — 8×8, transform으로 마우스 위치에 중심 맞춤 */}
      <div
        ref={pointRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: 8,
          height: 8,
          backgroundColor: pointColor,
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 99999,
          willChange: 'transform',
          transition: 'background-color 0.5s ease',
        }}
      />
      {/* 바깥 링 — 기본 원(30×30), 호버 시 네모(50×50) 또는 커스텀 원 */}
      <div
        ref={ringRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: cursorType === 'contact' ? 80 : (cursorType === 'pointer' ? 50 : 30),
          height: cursorType === 'contact' ? 80 : (cursorType === 'pointer' ? 50 : 30),
          border: cursorType === 'contact' ? 'none' : `1px solid ${isHover ? squareColor : ringColor}`,
          backgroundColor: cursorType === 'contact' ? '#ffffff' : 'transparent',
          borderRadius: cursorType === 'pointer' ? '4px' : '50%',
          pointerEvents: 'none',
          zIndex: 99998,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          willChange: 'transform',
          transition: 'width .25s, height .25s, border-radius .25s, border-color .6s, background-color .3s ease',
          overflow: 'hidden'
        }}
      >
        {cursorType === 'contact' && (
          <span className="text-[#0d1a1f] text-[12px] font-bold uppercase tracking-widest animate-in fade-in zoom-in duration-300">
            Contact
          </span>
        )}
      </div>
    </>
  );

  if (!mounted || typeof document === 'undefined' || !showCursor) return null;
  return createPortal(cursorContent, document.body);
}
