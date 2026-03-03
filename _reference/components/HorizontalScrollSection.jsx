import React, { useRef, useEffect, useCallback } from 'react';
import { Box, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// GSAP ScrollTrigger 플러그인 등록
gsap.registerPlugin(ScrollTrigger);

// 모션 블러 필터 컴포넌트
const MotionBlurFilter = () => (
  <svg style={{ position: 'absolute', width: 0, height: 0 }}>
    <defs>
      <filter id="motion-blur-filter" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="0 0">
          <animate 
            attributeName="stdDeviation" 
            values="0 0; 0 0" 
            dur="0.1s" 
            repeatCount="indefinite" 
            id="blur-animation" 
          />
        </feGaussianBlur>
      </filter>
    </defs>
  </svg>
);

/**
 * 세로 스크롤 중에 가로 스크롤 하이재킹을 구현하는 컴포넌트
 * children을 가로로 배치하고, 스크롤 시 가로 방향으로 이동하도록 구현
 * Lenis와 GSAP ScrollTrigger를 함께 사용
 */
function HorizontalScrollSection({ 
  children, 
  height = '100vh', 
  backgroundColor,
  sectionTitle,
  scrubValue = 1, // 스크롤 감도 (값이 클수록 스크롤이 더 부드러움)
  gap = 20,        // 각 아이템 사이의 간격
  indicators = false, // 개발 모드에서 스크롤 트리거 마커 표시 여부
  preventOverlap = true, // 겹침 방지 (다른 스크롤 트리거와의 충돌 방지)
  scrollEndOffset = 0, // 스크롤 종료 시 추가 공간 (%)
  itemWidth = '60%', // 아이템 너비 (기본값 60% 화면 너비)
  visibleItems = 1.5, // 한 화면에 보이는 아이템 수 (1.5는 한 개 완전히 보이고 다음 아이템이 절반 보임)
  sidePaddingRatio = 0.05, // 양쪽 여백 비율 (기본값: 화면 너비의 5%)
  transitionDuration = 0.5, // 배경 투명도 트랜지션 시간 (초)
  enableMotionBlur = true, // 모션 블러 활성화 여부
  motionBlurIntensity = 1.0, // 모션 블러 강도 배율
  scroller = "auto", // 스크롤 컨테이너 ("auto": 자동감지, Element: 지정요소, null: window)
}) {
  const sectionRef = useRef(null);
  const containerRef = useRef(null);
  const triggerRef = useRef(null);
  const bgRef = useRef(null);
  const lastScrollPositionRef = useRef(0);
  const scrollVelocityRef = useRef(0);
  const blurAnimationRef = useRef(null);
  const resizeObserverRef = useRef(null);
  // 🔥 현재 크기와 스크롤 상태 추적
  const currentSizeRef = useRef({ width: 0, height: 0 });
  const scrollTriggerRef = useRef(null);

  // 가장 가까운 스크롤 컨테이너 자동 감지 함수
  const findNearestScrollContainer = useCallback((element) => {
    if (scroller === "auto") {
      // 자동 감지: 가장 가까운 스크롤 가능한 부모 요소 찾기
      let current = element?.parentElement;
      while (current && current !== document.body) {
        const style = window.getComputedStyle(current);
        const hasScroll = style.overflow === 'auto' || 
                         style.overflow === 'scroll' || 
                         style.overflowY === 'auto' || 
                         style.overflowY === 'scroll';
        
        if (hasScroll) {
          console.log('🎯 Auto-detected scroll container:', current);
          return current;
        }
        current = current.parentElement;
      }
      console.log('🎯 No scroll container found, using window');
      return null; // window 스크롤 사용
    }
    
    // 명시적으로 지정된 경우
    console.log('🎯 Using specified scroller:', scroller);
    return scroller;
  }, [scroller]);

  // ScrollTrigger 초기화 및 청소
  const initScrollTrigger = useCallback(() => {
    const scrollTriggers = ScrollTrigger.getAll();
    scrollTriggers.forEach(trigger => {
      if (trigger.vars.id === `horizontal-scroll-${sectionRef.current?.id}`) {
        trigger.kill();
      }
    });

    const section = sectionRef.current;
    const container = containerRef.current;
    const bg = bgRef.current;
    
    if (!section || !container || !children?.length || !bg) return;

    // 스크롤 컨테이너 감지
    const scrollContainer = findNearestScrollContainer(section);
    
    console.log('🔄 Initializing HorizontalScrollSection with viewport:', {
      windowWidth: window.innerWidth,
      containerWidth: scrollContainer?.clientWidth || 'N/A',
      screenSize: window.innerWidth < 768 ? 'mobile' : window.innerWidth < 1024 ? 'tablet' : 'desktop'
    });

    // 블러 애니메이션 요소 참조 저장
    blurAnimationRef.current = document.getElementById('blur-animation');

    // 배경 초기 설정 - 투명 상태로 시작
    gsap.set(bg, { opacity: 0 });

    // 총 아이템 수
    const totalItems = React.Children.count(children);
    
    // 뷰포트 너비 계산 (스크롤 컨테이너가 있으면 해당 너비, 없으면 window 너비)
    const viewportWidth = scrollContainer ? scrollContainer.clientWidth : window.innerWidth;
    
    // 반응형 아이템 너비 계산
    let responsiveItemWidth = itemWidth;
    
    // 화면 크기별 아이템 너비 자동 조정
    if (typeof itemWidth === 'string' && itemWidth.includes('%')) {
      // 퍼센트로 지정된 경우 화면 크기에 따라 조정
      const basePercentage = parseFloat(itemWidth);
      if (viewportWidth < 768) { // 모바일
        responsiveItemWidth = Math.min(basePercentage + 20, 95) + '%'; // 모바일에서는 더 넓게
      } else if (viewportWidth < 1024) { // 태블릿
        responsiveItemWidth = Math.min(basePercentage + 10, 80) + '%'; // 태블릿에서는 약간 넓게
      }
    }
    
    // 아이템 너비 계산 (퍼센트 -> 실제 픽셀)
    const itemWidthPixel = typeof responsiveItemWidth === 'string' && responsiveItemWidth.includes('%')
      ? (viewportWidth * parseFloat(responsiveItemWidth) / 100)
      : (typeof responsiveItemWidth === 'number' ? responsiveItemWidth : viewportWidth * 0.6); // 기본값은 60%
    
    // 반응형 간격 조정
    const responsiveGap = viewportWidth < 768 ? Math.max(gap * 0.5, 10) : gap; // 모바일에서는 간격 줄이기
    
    // 반응형 여백 조정
    const responsiveSidePaddingRatio = viewportWidth < 768 ? sidePaddingRatio * 0.5 : sidePaddingRatio; // 모바일에서는 여백 줄이기
    const rightPadding = viewportWidth * responsiveSidePaddingRatio;
    
    // 컨테이너 전체 너비 계산
    // 첫 번째 아이템부터 마지막 아이템까지 + 아이템 간 gap + 오른쪽 여백
    const containerWidth = (totalItems * itemWidthPixel) + ((totalItems - 1) * responsiveGap) + rightPadding;
    
    // 스크롤 종료 위치 계산 (마지막 아이템이 완전히 보이도록)
    // 마지막 아이템이 화면 왼쪽 가장자리에 올 때까지 스크롤
    const maxScroll = containerWidth - itemWidthPixel;
    
    // 컨테이너 너비 설정
    gsap.set(container, { width: containerWidth });

    // 각 자식 요소에 스타일 적용 (너비와 마진만 설정, 다른 스타일 속성은 변경하지 않음)
    container.querySelectorAll('.horizontal-section-item').forEach((item, index) => {
      gsap.set(item, {
        width: itemWidthPixel,
        marginLeft: index === 0 ? 0 : responsiveGap, // 첫 번째 아이템은 왼쪽 가장자리에 붙임
        marginRight: index === totalItems - 1 ? rightPadding : 0, // 마지막 아이템에만 오른쪽 여백
      });
    });

    // ScrollTrigger 설정
    const scrollTrigger = ScrollTrigger.create({
      id: `horizontal-scroll-${section.id}`,
      trigger: section,
      scroller: scrollContainer, // 🎯 자동 감지된 스크롤 컨테이너 사용
      start: 'top top',
      end: () => `+=${maxScroll}`,
      pin: true,
      anticipatePin: 1,
      scrub: scrubValue,
      invalidateOnRefresh: true,
      markers: indicators,
      preventOverlap: preventOverlap,
      onUpdate: (self) => {
        const scrollProgress = self.progress;
        
        // 🔥 스크롤 진행 상태 추적
        lastScrollPositionRef.current = scrollProgress;
        
        // 스크롤 속도 계산 (getVelocity()가 0일 때의 예외 처리)
        const velocity = self.getVelocity() || 0.001;
        scrollVelocityRef.current = Math.abs(velocity) * 0.01; // 절대값을 사용하여 방향 상관없이 속도만 측정
        
        // 모션 블러 적용 (스크롤 속도에 비례)
        if (enableMotionBlur && blurAnimationRef.current) {
          // 속도가 임계값 이상일 때만 블러 효과 적용
          const velocityThreshold = 0.05;
          const maxBlurAmount = 8 * motionBlurIntensity; // 최대 블러 강도 (조절 가능)
          
          if (Math.abs(velocity) > velocityThreshold) {
            // 횡축 방향 블러 (x)만 적용
            const blurAmount = Math.min(maxBlurAmount, Math.abs(velocity) * 0.05 * motionBlurIntensity);
            
            // 애니메이션 요소 업데이트
            blurAnimationRef.current.setAttribute('values', `${blurAmount} 0; ${blurAmount} 0`);
            
            // 모든 이미지에 필터 적용
            container.querySelectorAll('.horizontal-section-item img').forEach(img => {
              img.style.filter = 'url(#motion-blur-filter)';
            });
          } else {
            // 속도가 낮을 때는 블러 제거
            blurAnimationRef.current.setAttribute('values', '0 0; 0 0');
            
            // 모든 이미지에서 필터 제거
            container.querySelectorAll('.horizontal-section-item img').forEach(img => {
              img.style.filter = 'none';
            });
          }
        }
        
        // 컨테이너 위치 업데이트
        gsap.to(container, {
          x: -maxScroll * scrollProgress,
          ease: 'none',
          overwrite: 'auto',
          duration: 0,
        });
      },
      onEnter: () => {
        // 섹션이 화면에 진입하면 배경 표시 (0 -> 1)
        gsap.to(bg, {
          opacity: 1,
          duration: transitionDuration,
          ease: 'power2.out'
        });
        
        // 이미지 페이드인 효과 적용 - 속도 향상
        const imageElements = section.querySelectorAll('.clothing-item-image');
        if (imageElements.length > 0) {
          gsap.to(imageElements, {
            opacity: 1,
            duration: 0.6, // 1.2초에서 0.6초로 단축
            stagger: 0.05, // 0.1초에서 0.05초로 단축
            ease: 'power1.out' // ease-out으로 변경하여 빠르게 시작하고 부드럽게 끝나도록
          });
        }
      },
      onLeave: () => {
        // 섹션이 화면을 벗어나면 배경 숨김 (1 -> 0)
        gsap.to(bg, {
          opacity: 0,
          duration: transitionDuration,
          ease: 'power2.in'
        });
      },
      onEnterBack: () => {
        // 뒤로 스크롤하여 섹션에 재진입할 때 배경 표시 (0 -> 1)
        gsap.to(bg, {
          opacity: 1,
          duration: transitionDuration,
          ease: 'power2.out'
        });
        
        // 이미지 페이드인 효과 적용 - 속도 향상
        const imageElements = section.querySelectorAll('.clothing-item-image');
        if (imageElements.length > 0) {
          gsap.to(imageElements, {
            opacity: 1,
            duration: 0.6, // 1.2초에서 0.6초로 단축
            stagger: 0.05, // 0.1초에서 0.05초로 단축
            ease: 'power1.out' // ease-out으로 변경하여 빠르게 시작하고 부드럽게 끝나도록
          });
        }
      },
      onLeaveBack: () => {
        // 뒤로 스크롤하여 섹션을 벗어날 때 배경 숨김 (1 -> 0)
        gsap.to(bg, {
          opacity: 0,
          duration: transitionDuration,
          ease: 'power2.in'
        });
      },
      onRefresh: () => {
        // ScrollTrigger 초기화 시 로그
        console.log('HorizontalScrollSection refreshed', {
          totalItems,
          itemWidthPixel,
          rightPadding,
          gap: responsiveGap,
          containerWidth,
          maxScroll,
          height: section.offsetHeight,
          viewportWidth,
          screenType: viewportWidth < 768 ? 'mobile' : viewportWidth < 1024 ? 'tablet' : 'desktop',
          scrollContainer: scrollContainer ? scrollContainer.className || 'detected-container' : 'window'
        });
      }
    });

    // 🔥 ScrollTrigger 참조 저장
    scrollTriggerRef.current = scrollTrigger;

    // 🔥 개선된 ResizeObserver - 컴포넌트 자체의 크기 변화 감지
    if (resizeObserverRef.current) {
      resizeObserverRef.current.disconnect();
    }
    
    resizeObserverRef.current = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        const currentSize = currentSizeRef.current;
        
        // 🔥 의미 있는 변화만 감지 (20px 이상 차이)
        const widthDiff = Math.abs(width - currentSize.width);
        const heightDiff = Math.abs(height - currentSize.height);
        
        if (widthDiff > 20 || heightDiff > 20) {
          console.log('🔄 Significant container resize detected:', {
            oldSize: currentSize,
            newSize: { width, height },
            widthDiff,
            heightDiff
          });
          
          // 🔥 현재 크기 업데이트
          currentSizeRef.current = { width, height };
          
          // 🔥 스크롤 진행 중인지 확인
          const isScrolling = Math.abs(scrollVelocityRef.current) > 0.01;
          
          if (!isScrolling) {
            // 스크롤 중이 아닐 때만 재초기화
            clearTimeout(window.horizontalScrollComponentResizeTimer);
            window.horizontalScrollComponentResizeTimer = setTimeout(() => {
              console.log('🔄 Reinitializing ScrollTrigger after resize');
              
              // ScrollTrigger 제거 및 재생성
              scrollTrigger.kill();
              initScrollTrigger();
              
            }, 250); // 🔥 250ms로 디바운싱 시간 증가
          } else {
            console.log('🔄 Resize detected but skipping due to active scrolling');
          }
        }
      }
    });
    
    // 초기 크기 저장
    if (section) {
      const { width, height } = section.getBoundingClientRect();
      currentSizeRef.current = { width, height };
      resizeObserverRef.current.observe(section);
    }

    // 🔥 window resize 이벤트 리스너 추가 (AppShell 사이드바 토글 대응)
    const handleWindowResize = () => {
      console.log('🔄 Window resize event detected');
      
      clearTimeout(window.horizontalScrollWindowResizeTimer);
      window.horizontalScrollWindowResizeTimer = setTimeout(() => {
        console.log('🔄 Reinitializing ScrollTrigger after window resize');
        
        // ScrollTrigger 제거 및 재생성
        if (scrollTriggerRef.current) {
          scrollTriggerRef.current.kill();
        }
        initScrollTrigger();
        
      }, 100); // 빠른 반응을 위해 100ms
    };
    
    window.addEventListener('resize', handleWindowResize);

    return () => {
      scrollTrigger.kill();
      scrollTriggerRef.current = null;
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
      window.removeEventListener('resize', handleWindowResize);
      clearTimeout(window.horizontalScrollComponentResizeTimer);
      clearTimeout(window.horizontalScrollWindowResizeTimer);
    };
  }, [children, gap, scrubValue, indicators, preventOverlap, scrollEndOffset, itemWidth, visibleItems, sidePaddingRatio, transitionDuration, enableMotionBlur, motionBlurIntensity, findNearestScrollContainer]);

  useEffect(() => {
    // 무작위 ID를 생성하여 섹션에 할당
    if (sectionRef.current && !sectionRef.current.id) {
      sectionRef.current.id = `horizontal-section-${Math.random().toString(36).substr(2, 9)}`;
    }
    
    // DOM이 업데이트된 후 ScrollTrigger 초기화를 위해 지연 실행
    const timer = setTimeout(() => {
      initScrollTrigger();
    }, 0);

    return () => {
      clearTimeout(timer);
      // 컴포넌트 언마운트 시 ScrollTrigger 정리
      const scrollTriggers = ScrollTrigger.getAll();
      scrollTriggers.forEach(trigger => {
        if (trigger.vars.id === `horizontal-scroll-${sectionRef.current?.id}`) {
          trigger.kill();
        }
      });
    };
  }, [initScrollTrigger]);

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
      {/* 모션 블러 SVG 필터 추가 */}
      {enableMotionBlur && <MotionBlurFilter />}
      
      {/* 배경 레이어 - 투명도 트랜지션을 위한 별도 요소 */}
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
      
      {/* 섹션 제목이 있으면 표시 */}
      {sectionTitle && (
        <Box 
          sx={{ 
            position: 'absolute', 
            top: { xs: '80px', md: '120px' }, // 모바일에서는 위치 조정
            left: { xs: '20px', md: '40px' }, // 모바일에서는 여백 줄이기
            zIndex: 10,
            maxWidth: { xs: 'calc(100% - 40px)', md: 'auto' }, // 모바일에서 오버플로우 방지
          }}
        >
          {typeof sectionTitle === 'string' ? (
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 'bold',
                fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' }, // 반응형 폰트 크기
                lineHeight: { xs: 1.3, md: 1.2 } // 모바일에서 줄간격 조정
              }}
            >
              {sectionTitle}
            </Typography>
          ) : (
            sectionTitle
          )}
        </Box>
      )}
      
      {/* 스크롤 트리거 포인트 */}
      <Box ref={triggerRef} sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '1px' }} />
      
      {/* 가로 스크롤 컨테이너 */}
      <Box
        ref={containerRef}
        sx={{
          display: 'flex',
          alignItems: 'center',
          height: '100%',
          position: 'absolute',
          top: 0,
          left: 0,
          zIndex: 1,
        }}
      >
        {/* 자식 요소들을 가로로 배열 */}
        {React.Children.map(children, (child, index) => (
          <Box
            key={index}
            className="horizontal-section-item"
            sx={(theme) => ({
              height: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: {
                xs: `0 ${Math.max(gap * 0.5, 5)}px`, // 모바일에서는 패딩 줄이기
                md: `0 ${gap}px`
              },
              // 반응형 폰트 크기 (하위 텍스트 요소에 적용)
              '& .MuiTypography-root': {
                fontSize: {
                  xs: theme.typography.body2.fontSize,
                  sm: theme.typography.body1.fontSize,
                  md: theme.typography.h6.fontSize
                }
              }
            })}
          >
            {React.cloneElement(child, { imageTransition: true })}
          </Box>
        ))}
      </Box>
    </Box>
  );
}

HorizontalScrollSection.propTypes = {
  children: PropTypes.node.isRequired,
  height: PropTypes.string,
  backgroundColor: PropTypes.string,
  sectionTitle: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  scrubValue: PropTypes.number,
  gap: PropTypes.number,
  indicators: PropTypes.bool,
  preventOverlap: PropTypes.bool,
  scrollEndOffset: PropTypes.number,
  itemWidth: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  visibleItems: PropTypes.number,
  sidePaddingRatio: PropTypes.number,
  transitionDuration: PropTypes.number,
  enableMotionBlur: PropTypes.bool,
  motionBlurIntensity: PropTypes.number,
  scroller: PropTypes.oneOfType([PropTypes.string, PropTypes.element, PropTypes.oneOf([null])]),
};

export default HorizontalScrollSection; 