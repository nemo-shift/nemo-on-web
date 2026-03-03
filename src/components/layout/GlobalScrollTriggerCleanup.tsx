"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * GSAP ScrollTrigger 전역 정리 컴포넌트
 * 라우트 변경 시 ScrollTrigger 인스턴스 및 pin-spacer 등 정리
 *
 * Example usage:
 * <GlobalScrollTriggerCleanup />
 */
export default function GlobalScrollTriggerCleanup(): null {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;

    ScrollTrigger.killAll(true);

    const pinSpacers = document.querySelectorAll(
      ".pin-spacer, .gsap-pin-spacer",
    );
    pinSpacers.forEach((spacer) => spacer.remove());

    const elementsWithGSAPStyles = document.querySelectorAll(
      '[style*="transform"], [style*="pin"], [style*="position: fixed"]',
    );
    elementsWithGSAPStyles.forEach((element) => {
      const el = element as HTMLElement;
      if (el.style.transform?.includes("matrix")) {
        el.style.transform = "";
      }
      if (
        el.style.position === "fixed" &&
        element.classList.contains("pin-spacer")
      ) {
        el.style.position = "";
      }
    });

    ScrollTrigger.refresh();
  }, [pathname]);

  return null;
}
