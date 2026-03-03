import React, { useRef, useEffect, useCallback } from 'react';
import { Box, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import { gsap, ScrollTrigger } from '../../../utils/gsapConfig';

// 모션 블러 필터 컴포넌트
const MotionBlurFilter = () => (
  <svg style={{ position: 'absolute', width: 0, height: 0 }}>
    <defs>
      <filter id="free-motion-blur-filter" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="0 0">
          <animate 
            attributeName="stdDeviation" 
            values="0 0; 0 0" 
            dur="0.1s" 
            repeatCount="indefinite" 
            id="free-blur-animation" 
          />
        </feGaussianBlur>
      </filter>
    </defs>
  </svg>
);

/**
 * 자유형 가로 스크롤 컴포넌트 (GSAP 공식 권장사항 적용)
 * gsap.context()를 사용하여 완전한 cleanup 보장
 * 
 * Props:
 * @param {React.ReactNode} children - 가로로 배치될 컨텐츠 요소들 [Required]
 * @param {string} height - 섹션의 높이 [Optional, 기본값: "100vh"]
 * @param {string} backgroundColor - 섹션 배경색 [Optional]
 * @param {string|React.ReactNode} sectionTitle - 섹션 제목 [Optional]
 * @param {number} scrubValue - 스크롤 감도 [Optional, 기본값: 1]
 * @param {boolean} indicators - 개발 모드에서 스크롤 트리거 마커 표시 여부 [Optional, 기본값: false]
 * @param {boolean} preventOverlap - 겹침 방지 [Optional, 기본값: true]
 * @param {number} transitionDuration - 배경 투명도 트랜지션 시간 [Optional, 기본값: 0.5]
 * @param {boolean} enableMotionBlur - 모션 블러 활성화 여부 [Optional, 기본값: true]
 * @param {number} motionBlurIntensity - 모션 블러 강도 배율 [Optional, 기본값: 1.0]
 * @param {string|Element|null} scroller - 스크롤 컨테이너 [Optional, 기본값: "auto"]
 *
 * Example usage:
 * <FreeHorizontalScrollSection
 *   height="100vh"
 *   backgroundColor="#f5f5f5"
 *   sectionTitle="자유형 가로 스크롤"
 *   enableMotionBlur={true}
 * >
 *   <ComponentA />
 *   <ComponentB />
 *   <ComponentC />
 * </FreeHorizontalScrollSection>
 */
function FreeHorizontalScrollSection({ 
  children, 
  height = '100vh', 
  backgroundColor,
  sectionTitle,
  scrubValue = 1,
  indicators = false,
  preventOverlap = true,
  transitionDuration = 0.5,
  enableMotionBlur = true,
  motionBlurIntensity = 1.0,
  scroller = "auto",
}) {
  const sectionRef = useRef(null);
  const containerRef = useRef(null);
  const bgRef = useRef(null);
  const contextRef = useRef(null); // 🔥 GSAP context 저장
  /**
   * 🔥 최적화: resize 관련 ref 제거
   * 
   * resize 이벤트 처리가 전역 핸들러(useGlobalResizeHandler)로 이동했으므로
   * 컴포넌트 내부에서 관리할 필요가 없습니다.
   */
  // const resizeTimerRef = useRef(null); // resize 타이머 참조 저장 (제거됨)
  // const handleResizeRef = useRef(null); // resize 핸들러 참조 저장 (제거됨)

  // 가장 가까운 스크롤 컨테이너 자동 감지 함수
  const findNearestScrollContainer = useCallback((element) => {
    if (scroller === "auto") {
      let current = element?.parentElement;
      while (current && current !== document.body) {
        const style = window.getComputedStyle(current);
        const hasScroll = style.overflow === 'auto' || 
                         style.overflow === 'scroll' || 
                         style.overflowY === 'auto' || 
                         style.overflowY === 'scroll';
        
        if (hasScroll) {
          return current;
        }
        current = current.parentElement;
      }
      return null;
    }
    
    return scroller;
  }, [scroller]);

  // 🔥 GSAP 공식 권장: gsap.context()를 사용한 완전한 cleanup
  useEffect(() => {
    const section = sectionRef.current;
    const container = containerRef.current;
    const bg = bgRef.current;
    
    if (!section || !container || !children?.length || !bg) return;

    // 무작위 ID 생성
    if (!section.id) {
      section.id = `free-horizontal-section-${Math.random().toString(36).substr(2, 9)}`;
    }

    // 🔥 GSAP context 생성 및 모든 애니메이션을 context 내에서 실행
    contextRef.current = gsap.context(() => {
      // 스크롤 컨테이너 감지
      const scrollContainer = findNearestScrollContainer(section);
      
      // 배경 초기 설정
      gsap.set(bg, { opacity: 0 });
      
      // 컨테이너 스타일 설정
      gsap.set(container, { 
        display: 'flex',
        alignItems: 'center'
      });

      // 자식 요소들 스타일 설정
      container.querySelectorAll('.free-horizontal-section-item').forEach((item) => {
        gsap.set(item, {
          flexShrink: 0,
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        });
      });

      // DOM 렌더링 완료 후 ScrollTrigger 생성
      gsap.delayedCall(0.1, () => {
        // maxScroll을 동적으로 계산하는 함수
        const calculateMaxScroll = () => {
          const currentViewportWidth = scrollContainer ? scrollContainer.clientWidth : window.innerWidth;
          const currentContentWidth = container.scrollWidth;
          return Math.max(0, currentContentWidth - currentViewportWidth);
        };
        
        // 로그 빈도 제어를 위한 변수
        let lastLoggedProgress = -1;
        let lastLoggedDirection = null;
        let logThrottle = 0;

        // 🔥 ScrollTrigger를 context 내에서 생성
        const scrollTrigger = ScrollTrigger.create({
          trigger: section,
          scroller: scrollContainer,
          start: 'top top',
          end: () => {
            // 동적으로 maxScroll 계산 (refresh 시에만 호출됨)
            return `+=${calculateMaxScroll()}`;
          },
          pin: true,
          anticipatePin: 1,
          scrub: scrubValue,
          invalidateOnRefresh: true,
          markers: indicators,
          preventOverlap: preventOverlap,
          onUpdate: (self) => {
            const scrollProgress = self.progress;
            
            // 로그를 0.01 단위로만 출력하거나, direction이 변경될 때만
            const shouldLog = 
              Math.abs(scrollProgress - lastLoggedProgress) > 0.01 || 
              self.direction !== lastLoggedDirection ||
              logThrottle++ % 30 === 0; // 30프레임마다 한 번
            
            if (shouldLog) {
              console.log('📌 [ScrollTrigger] Update:', {
                progress: self.progress.toFixed(3),
                direction: self.direction,
                isActive: self.isActive,
                scroll: self.scroll,
                start: self.start,
                end: self.end,
                pin: self.vars.pin,
              });
              lastLoggedProgress = scrollProgress;
              lastLoggedDirection = self.direction;
            }
            
            // 컨테이너 위치 업데이트 (동적으로 계산된 maxScroll 사용)
            const currentMaxScroll = calculateMaxScroll();
            gsap.to(container, {
              x: -currentMaxScroll * scrollProgress,
              ease: 'none',
              overwrite: 'auto',
              duration: 0,
            });

            // 모션 블러 적용
            if (enableMotionBlur) {
              const velocity = self.getVelocity() || 0.001;
              const blurAnimation = document.getElementById('free-blur-animation');
              
              if (blurAnimation) {
                const velocityThreshold = 0.05;
                const maxBlurAmount = 8 * motionBlurIntensity;
                
                if (Math.abs(velocity) > velocityThreshold) {
                  const blurAmount = Math.min(maxBlurAmount, Math.abs(velocity) * 0.05 * motionBlurIntensity);
                  blurAnimation.setAttribute('values', `${blurAmount} 0; ${blurAmount} 0`);
                  
                  container.querySelectorAll('.free-horizontal-section-item img').forEach(img => {
                    img.style.filter = 'url(#free-motion-blur-filter)';
                  });
                } else {
                  blurAnimation.setAttribute('values', '0 0; 0 0');
                  
                  container.querySelectorAll('.free-horizontal-section-item img').forEach(img => {
                    img.style.filter = 'none';
                  });
                }
              }
            }
          },
          onEnter: () => {
            console.log('📌 [ScrollTrigger] Enter - Horizontal Section');
            gsap.to(bg, {
              opacity: 1,
              duration: transitionDuration,
              ease: 'power2.out'
            });
          },
          onLeave: (self) => {
            console.log('📌 [ScrollTrigger] Leave - Horizontal Section:', {
              lenisScroll: window.lenis?.scroll,
              nativeScroll: window.scrollY,
              triggerStart: self.start,
              triggerEnd: self.end,
              progress: self.progress.toFixed(3),
            });
            gsap.to(bg, {
              opacity: 0,
              duration: transitionDuration,
              ease: 'power2.in'
            });
          },
          onEnterBack: () => {
            console.log('📌 [ScrollTrigger] EnterBack - Horizontal Section');
            gsap.to(bg, {
              opacity: 1,
              duration: transitionDuration,
              ease: 'power2.out'
            });
          },
          onLeaveBack: (self) => {
            console.log('📌 [ScrollTrigger] LeaveBack - Horizontal Section:', {
              lenisScroll: window.lenis?.scroll,
              nativeScroll: window.scrollY,
              triggerStart: self.start,
              triggerEnd: self.end,
              progress: self.progress.toFixed(3),
            });
            gsap.to(bg, {
              opacity: 0,
              duration: transitionDuration,
              ease: 'power2.in'
            });
          },
          onRefresh: () => {
            // ScrollTrigger 리프레시 완료
          }
        });

        /**
         * 🔥 최적화: resize 이벤트 리스너 제거
         * 
         * resize 이벤트 처리는 전역 핸들러(useGlobalResizeHandler)에서
         * 중앙 집중식으로 관리하므로 여기서는 제거합니다.
         * 
         * 이렇게 하면:
         * - 여러 컴포넌트에서 중복된 resize 리스너 등록 방지
         * - ScrollTrigger.refresh() 중복 호출 방지
         * - 성능 개선 및 메모리 사용량 감소
         * 
         * 참고: useGlobalResizeHandler가 App.jsx에서 호출되어
         *       모든 resize 이벤트를 중앙에서 처리합니다.
         */
        // resize 이벤트 리스너는 전역 핸들러에 위임됨
        // handleResizeRef.current = () => { ... };
        // window.addEventListener('resize', handleResizeRef.current);
      });

    }, section); // context scope를 section으로 제한

    // 🔥 GSAP 공식 권장: context.revert()로 완전한 정리
    return () => {
      /**
       * 🔥 최적화: resize 이벤트 리스너 정리 코드 제거
       * 
       * resize 이벤트 처리가 전역 핸들러로 이동했으므로
       * 여기서는 정리할 필요가 없습니다.
       */
      // resize 이벤트 리스너는 전역 핸들러에서 관리되므로 정리 불필요
      // if (handleResizeRef.current) {
      //   window.removeEventListener('resize', handleResizeRef.current);
      //   handleResizeRef.current = null;
      // }
      // if (resizeTimerRef.current) {
      //   clearTimeout(resizeTimerRef.current);
      //   resizeTimerRef.current = null;
      // }
      
      // GSAP context 정리
      if (contextRef.current) {
        contextRef.current.revert(); // 모든 GSAP 효과와 DOM 조작 원상복구
        contextRef.current = null;
      }
    };
  }, [children, scrubValue, indicators, preventOverlap, transitionDuration, enableMotionBlur, motionBlurIntensity, findNearestScrollContainer]);

  return (
    <Box
      ref={sectionRef}
      sx={{
        height,
        width: '100%',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* 모션 블러 SVG 필터 */}
      {enableMotionBlur && <MotionBlurFilter />}
      
      {/* 배경 레이어 */}
      <Box
        ref={bgRef}
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor,
          zIndex: 0,
        }}
      />
      
      {/* 섹션 제목 */}
      {sectionTitle && (
        <Box 
          sx={{ 
            position: 'absolute', 
            top: { xs: '80px', md: '120px' },
            left: { xs: '20px', md: '40px' },
            zIndex: 10,
            maxWidth: { xs: 'calc(100% - 40px)', md: 'auto' },
          }}
        >
          {typeof sectionTitle === 'string' ? (
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 'bold',
                fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' },
                lineHeight: { xs: 1.3, md: 1.2 }
              }}
            >
              {sectionTitle}
            </Typography>
          ) : (
            sectionTitle
          )}
        </Box>
      )}
      
      {/* 자유형 가로 스크롤 컨테이너 */}
      <Box
        ref={containerRef}
        sx={{
          height: '100%',
          position: 'absolute',
          top: 0,
          left: 0,
          zIndex: 1,
        }}
      >
        {/* 자식 요소들을 가로로 배열 - 각자의 크기 유지 */}
        {React.Children.map(children, (child, index) => (
          <Box
            key={index}
            className="free-horizontal-section-item"
            sx={{
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {React.cloneElement(child, { imageTransition: true })}
          </Box>
        ))}
      </Box>
    </Box>
  );
}

FreeHorizontalScrollSection.propTypes = {
  children: PropTypes.node.isRequired,
  height: PropTypes.string,
  backgroundColor: PropTypes.string,
  sectionTitle: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  scrubValue: PropTypes.number,
  indicators: PropTypes.bool,
  preventOverlap: PropTypes.bool,
  transitionDuration: PropTypes.number,
  enableMotionBlur: PropTypes.bool,
  motionBlurIntensity: PropTypes.number,
  scroller: PropTypes.oneOfType([PropTypes.string, PropTypes.element, PropTypes.oneOf([null])]),
};

export default FreeHorizontalScrollSection; 