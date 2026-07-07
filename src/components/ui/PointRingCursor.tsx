'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { usePathname } from 'next/navigation';
import { useMousePosition } from '@/hooks';
import { useDevice } from '@/context';
import { INTERACTION_Z_INDEX } from '@/constants/interaction';

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
  const { positionRef } = useMousePosition(); // [V76] ref 직접 수신 — mousemove 리렌더 제거
  const { interactionMode } = useDevice();
  const pathname = usePathname();

  useEffect(() => {
    // [V73.CursorResetOnRoute] 클릭한 요소가 라우팅으로 언마운트되면
    // mouseleave가 발생하지 않아 호버 상태가 박제되는 문제 수정.
    setCursorType('default');
  }, [pathname]);
  const sizeRef = useRef(50); // [V76] cursorType 변경 시만 갱신 — RAF 루프 stale closure 방지
  const pointRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number>(0);
  const isHoverRef = useRef(false);

  useEffect(() => {
    isHoverRef.current = isHover;
  }, [isHover]);

  // [V76] cursorType → sizeRef 동기화 (RAF 루프에서 stale closure 없이 읽기 위함)
  useEffect(() => {
    sizeRef.current = cursorType === 'pointer' ? 30 : cursorType === 'contact' ? 80 : 50;
  }, [cursorType]);

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

  // [V76] 인터랙티브 요소 호버 감지 — 이벤트 위임 방식
  // MutationObserver + 개별 리스너 재부착 제거 → document 단일 mouseover로 교체.
  // closest()가 자식 요소(span/i 등) 진입 시에도 부모 타깃을 잡아
  // 커서 깜빡임 없이 동작하며, 동적 DOM 변경에도 영향받지 않음.
  useEffect(() => {
    if (!mounted) return;
    const selectors = 'a, button, [data-cursor="pointer"], .pill, [data-bt], [role="button"], [data-cursor="contact"]';

    const onOver = (e: MouseEvent) => {
      const el = (e.target as HTMLElement | null)?.closest?.(selectors);
      if (!el) { setCursorType('default'); return; }
      setCursorType(el.getAttribute('data-cursor') === 'contact' ? 'contact' : 'pointer');
    };
    const onDocLeave = () => setCursorType('default');

    document.addEventListener('mouseover', onOver, { passive: true });
    document.addEventListener('mouseleave', onDocLeave);

    return () => {
      document.removeEventListener('mouseover', onOver);
      document.removeEventListener('mouseleave', onDocLeave);
    };
  }, [mounted]);

  // point + ring 부드러운 따라오기 (lerp 애니메이션)
  useEffect(() => {
    let px = 0;
    let py = 0;
    let rx = 0;
    let ry = 0;
    const POINT_LERP = 0.5;
    const RING_LERP = 0.35;

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
        const half = sizeRef.current / 2; // [V76] 캐시된 값 사용 — 매 프레임 분기 제거
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
          zIndex: INTERACTION_Z_INDEX.Z_CURSOR_POINT,
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
          width: cursorType === 'contact' ? 80 : (cursorType === 'pointer' ? 30 : 50),
          height: cursorType === 'contact' ? 80 : (cursorType === 'pointer' ? 30 : 50),
          border: cursorType === 'contact' ? 'none' : `1px solid ${squareColor}`,
          backgroundColor: cursorType === 'contact' ? '#ffffff' : 'transparent',
          borderRadius: cursorType === 'pointer' ? '50%' : (cursorType === 'contact' ? '50%' : '4px'),
          pointerEvents: 'none',
          zIndex: INTERACTION_Z_INDEX.Z_CURSOR_RING,
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
