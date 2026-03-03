"use client";

import React, { useRef, useEffect, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib";

// GSAP ScrollTrigger 플러그인 등록
gsap.registerPlugin(ScrollTrigger);

type FreeHorizontalScrollSectionProps = {
  children: React.ReactNode; // 가로로 배치될 패널 요소들 [Required]
  className?: string; // 외부 래퍼 추가 클래스 [Optional]
  isLocked?: boolean; // true이면 ScrollTrigger 비활성화 [Optional, 기본값: false]
};

/**
 * FreeHorizontalScrollSection 컴포넌트
 *
 * 세로 스크롤을 가로 스크롤로 변환하는 GSAP ScrollTrigger 기반 컨테이너.
 * isLocked=true 시 ScrollTrigger를 disable하여 스크롤을 잠근다.
 * gsap.context()를 사용하여 언마운트 시 완전한 클린업 보장.
 *
 * @param {React.ReactNode} children - 가로로 배치될 패널 요소들 [Required]
 * @param {string} className - 외부 래퍼 추가 클래스 [Optional]
 * @param {boolean} isLocked - ScrollTrigger 잠금 여부 [Optional, 기본값: false]
 */
export default function FreeHorizontalScrollSection({
  children,
  className,
  isLocked = false,
}: FreeHorizontalScrollSectionProps): React.ReactElement {
  // 외부 sticky 래퍼 ref
  const sectionRef = useRef<HTMLDivElement>(null);
  // 가로 이동 트랙 ref
  const containerRef = useRef<HTMLDivElement>(null);
  // gsap.context 저장 ref (클린업용)
  const contextRef = useRef<gsap.Context | null>(null);
  // ScrollTrigger 인스턴스 ref (잠금 제어용)
  const triggerRef = useRef<ScrollTrigger | null>(null);

  /**
   * 가장 가까운 스크롤 컨테이너 자동 감지
   */
  const findNearestScrollContainer = useCallback(
    (element: HTMLElement | null) => {
      let current = element?.parentElement ?? null;
      while (current && current !== document.body) {
        const style = window.getComputedStyle(current);
        const hasScroll =
          style.overflow === "auto" ||
          style.overflow === "scroll" ||
          style.overflowY === "auto" ||
          style.overflowY === "scroll";
        if (hasScroll) return current;
        current = current.parentElement;
      }
      return null;
    },
    [],
  );

  useEffect(() => {
    const section = sectionRef.current;
    const container = containerRef.current;

    if (!section || !container) return;
    if (React.Children.count(children) === 0) return;

    if (!section.id) {
      section.id = `free-horizontal-section-${Math.random().toString(36).substring(2, 11)}`;
    }

    contextRef.current = gsap.context(() => {
      const scrollContainer = findNearestScrollContainer(section);

      gsap.set(container, { display: "flex", alignItems: "center" });

      container
        .querySelectorAll<HTMLElement>(".free-horizontal-section-item")
        .forEach((item) => {
          gsap.set(item, {
            flexShrink: 0,
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          });
        });

      gsap.delayedCall(0.1, () => {
        const calculateMaxScroll = (): number => {
          const viewportWidth = scrollContainer
            ? scrollContainer.clientWidth
            : window.innerWidth;
          return Math.max(0, container.scrollWidth - viewportWidth);
        };

        // ScrollTrigger 인스턴스 저장 (외부에서 잠금 제어 가능하게)
        triggerRef.current = ScrollTrigger.create({
          trigger: section,
          scroller: scrollContainer ?? undefined,
          start: "top top",
          end: () => `+=${calculateMaxScroll()}`,
          pin: true,
          anticipatePin: 1,
          scrub: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const currentMaxScroll = calculateMaxScroll();
            gsap.to(container, {
              x: -currentMaxScroll * self.progress,
              ease: "none",
              overwrite: "auto",
              duration: 0,
            });
          },
        });

        // 초기 isLocked 상태 반영
        if (isLocked) triggerRef.current?.disable();
      });
    }, section);

    return () => {
      triggerRef.current = null;
      if (contextRef.current) {
        contextRef.current.revert();
        contextRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [children, findNearestScrollContainer]);

  // isLocked 변경 시 ScrollTrigger enable/disable
  useEffect(() => {
    if (!triggerRef.current) return;
    if (isLocked) {
      triggerRef.current.disable();
    } else {
      triggerRef.current.enable();
    }
  }, [isLocked]);

  return (
    <div
      ref={sectionRef}
      className={cn(
        "relative",
        "h-screen w-full",
        "overflow-hidden",
        className,
      )}
    >
      <div ref={containerRef} className="h-full absolute top-0 left-0 z-[1]">
        {React.Children.map(children, (child, index) => (
          <div
            key={index}
            className="free-horizontal-section-item h-full flex items-center justify-center"
          >
            {child}
          </div>
        ))}
      </div>
    </div>
  );
}
