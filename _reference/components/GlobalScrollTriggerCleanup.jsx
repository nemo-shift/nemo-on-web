import React from 'react';

import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * GSAP ScrollTrigger 전역 정리 컴포넌트
 * 
 * 라우터 이동 시 GSAP ScrollTrigger와 관련된 모든 요소들을 정리합니다.
 * - ScrollTrigger 인스턴스 제거
 * - pin-spacer 요소 제거  
 * - GSAP 관련 인라인 스타일 정리
 * - ScrollTrigger 재초기화
 * 
 * 🔥 GSAP 공식 권장사항에 따른 cleanup 로직입니다.
 * 
 * Example usage:
 * <GlobalScrollTriggerCleanup />
 */
function GlobalScrollTriggerCleanup() {
  const location = useLocation();

  React.useEffect(() => {
    console.log('🧹 [Global] Route change detected - performing complete GSAP cleanup');
    
    // 1. 모든 ScrollTrigger 제거
    ScrollTrigger.killAll(true);
    
    // 2. pin-spacer 요소들 수동 제거 (DOM에 남아있을 수 있음)
    const pinSpacers = document.querySelectorAll('.pin-spacer, .gsap-pin-spacer');
    pinSpacers.forEach(spacer => {
      console.log('🧹 [Global] Removing pin-spacer:', spacer);
      spacer.remove();
    });
    
    // 3. GSAP 관련 인라인 스타일 정리
    const elementsWithGSAPStyles = document.querySelectorAll('[style*="transform"], [style*="pin"], [style*="position: fixed"]');
    elementsWithGSAPStyles.forEach(element => {
      // GSAP에 의해 추가된 것으로 보이는 스타일만 제거
      if (element.style.transform && element.style.transform.includes('matrix')) {
        element.style.transform = '';
      }
      if (element.style.position === 'fixed' && element.classList.contains('pin-spacer')) {
        element.style.position = '';
      }
    });
    
    // 4. ScrollTrigger 재초기화 (다음 페이지에서 사용할 수 있도록)
    ScrollTrigger.refresh();
    
    console.log('✅ [Global] GSAP cleanup completed');
  }, [location.pathname]);

  return null;
}

export default GlobalScrollTriggerCleanup; 