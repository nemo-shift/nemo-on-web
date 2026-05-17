import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Box, useMediaQuery } from '@mui/material';
import { motion } from 'framer-motion';
import { useTheme } from '@mui/material/styles';

/**
 * FullPageScroll 컴포넌트
 *
 * 섹션별로 전체 화면 스크롤이 가능한 단일 페이지 애플리케이션을 구현합니다.
 * 마우스 휠, 키보드, 터치 제스처를 통한 네비게이션을 지원합니다.
 * 특정 섹션에서 내부 스크롤을 허용하는 기능을 제공합니다.
 *
 * Props:
 * @param {React.ReactNode} children - 각 섹션에 해당하는 자식 요소들 [Required]
 * @param {number} animationDuration - 섹션 전환 애니메이션 지속 시간(초) [Optional, 기본값: 0.6]
 * @param {string} direction - 스크롤 방향 ('vertical' | 'horizontal') [Optional, 기본값: 'vertical']
 * @param {boolean} isMouseWheelEnabled - 마우스 휠 스크롤 활성화 [Optional, 기본값: true]
 * @param {boolean} isKeyboardEnabled - 키보드 네비게이션 활성화 [Optional, 기본값: true]
 * @param {boolean} isTouchEnabled - 터치/스와이프 네비게이션 활성화 [Optional, 기본값: true]
 * @param {number} touchSensitivity - 터치 감도 (픽셀) [Optional, 기본값: 50]
 * @param {boolean} hasDotsNavigation - 네비게이션 도트 표시 여부 [Optional, 기본값: true]
 * @param {string} dotsPosition - 도트 위치 ('right' | 'left' | 'bottom' | 'top') [Optional, 기본값: 'right']
 * @param {string} dotsColor - 네비게이션 도트 색상 [Optional, 기본값: theme.palette.primary.main]
 * @param {number} initialSectionIndex - 초기 섹션 인덱스 [Optional, 기본값: 0]
 * @param {function} onSectionChange - 섹션 변경 시 호출되는 콜백 함수 [Optional]
 * @param {object} sx - 추가 스타일 객체 [Optional]
 * @param {boolean} isLoopEnabled - 마지막 섹션에서 첫 번째 섹션으로 루프 [Optional, 기본값: false]
 * @param {number[]} scrollLockedSections - 스크롤이 잠긴 섹션 인덱스 배열 [Optional]
 *
 * Example usage:
 * <FullPageScroll
 *   animationDuration={1.0}
 *   direction="vertical"
 *   hasDotsNavigation={true}
 *   dotsColor="#ff6b6b"
 *   initialSectionIndex={0}
 *   scrollLockedSections={[2]} // 인덱스 2 섹션에서 내부 스크롤 허용
 *   onSectionChange={(index) => console.log('Current section:', index)}
 * >
 *   <Section1 />
 *   <Section2 />
 *   <Section3 /> {/* 이 섹션에서 내부 스크롤 가능 *}
 * </FullPageScroll>
 */
function FullPageScroll({
  children,
  animationDuration = 0.6,
  direction = 'vertical',
  isMouseWheelEnabled = true,
  isKeyboardEnabled = true,
  isTouchEnabled = true,
  touchSensitivity = 50,
  hasDotsNavigation = true,
  dotsPosition = 'right',
  dotsColor,
  initialSectionIndex = 0,
  onSectionChange,
  sx = {},
  isLoopEnabled = false,
  scrollLockedSections = [],
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [currentSection, setCurrentSection] = useState(initialSectionIndex);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isScrollLocked, setIsScrollLocked] = useState(false);
  const containerRef = useRef(null);
  const touchStartRef = useRef({ x: 0, y: 0 });
  const currentSectionRef = useRef(currentSection);
  const isAnimatingRef = useRef(isAnimating);
  const processingScrollRef = useRef(false);
  
  // 경계 도달 후 추가 스크롤 카운트 (PC와 동일한 로직)
  const boundaryScrollCountRef = useRef(0);
  const boundaryDirectionRef = useRef(null);
  const BOUNDARY_THRESHOLD = 2; // 경계에서 2번 스크롤해야 다음 섹션으로

  // state 값 변경될 때마다 ref 업데이트
  useEffect(() => {
    currentSectionRef.current = currentSection;
  }, [currentSection]);

  useEffect(() => {
    isAnimatingRef.current = isAnimating;
  }, [isAnimating]);

  // Suspense 내부의 실제 컴포넌트를 추출하는 헬퍼 함수
  const getRealComponent = (child) => {
    if (React.isValidElement(child)) {
      // Suspense로 감싸진 경우 내부의 실제 컴포넌트 추출
      if (child.props && 'fallback' in child.props) {
        const realChild = React.Children.toArray(child.props.children)[0];
        return realChild || child;
      }
    }
    return child;
  };
  
  // 자식 요소들을 배열로 변환
  const sections = React.Children.toArray(children);
  const totalSections = sections.length;

  // 현재 섹션이 잠긴 섹션인지 확인
  const isCurrentSectionLocked = useMemo(() => {
    return scrollLockedSections.includes(currentSection);
  }, [scrollLockedSections, currentSection]);

  /**
   * 도트 네비게이션을 통한 직접 섹션 이동
   */
  const goToSection = useCallback(
    (sectionIndex) => {
      if (isAnimatingRef.current) return;

      let targetIndex = sectionIndex;

      if (isLoopEnabled) {
        if (targetIndex < 0) {
          targetIndex = totalSections - 1;
        } else if (targetIndex >= totalSections) {
          targetIndex = 0;
        }
      } else {
        targetIndex = Math.max(0, Math.min(targetIndex, totalSections - 1));
      }

      if (targetIndex !== currentSection) {
        isAnimatingRef.current = true;
        setIsAnimating(true);
        setCurrentSection(targetIndex);

        if (onSectionChange) {
          onSectionChange(targetIndex);
        }

        setTimeout(() => {
          currentSectionRef.current = targetIndex;
          isAnimatingRef.current = false;
          setIsAnimating(false);
        }, animationDuration * 1000);
      }
    },
    [totalSections, isLoopEnabled, onSectionChange, animationDuration, currentSection]
  );

  /**
   * 다음 섹션으로 이동
   */
  const goToNextSection = useCallback(() => {
    if (isAnimatingRef.current) return;

    let targetIndex = currentSectionRef.current + 1;

    if (isLoopEnabled) {
      if (targetIndex >= totalSections) {
        targetIndex = 0;
      }
    } else {
      if (targetIndex >= totalSections) {
        return;
      }
    }

    isAnimatingRef.current = true;
    setIsAnimating(true);
    setCurrentSection(targetIndex);
    setIsScrollLocked(false);

    if (onSectionChange) {
      onSectionChange(targetIndex);
    }

    setTimeout(() => {
      currentSectionRef.current = targetIndex;
      isAnimatingRef.current = false;
      setIsAnimating(false);
    }, animationDuration * 1000);
  }, [totalSections, isLoopEnabled, onSectionChange, animationDuration]);

  /**
   * 이전 섹션으로 이동
   */
  const goToPrevSection = useCallback(() => {
    if (isAnimatingRef.current) return;

    let targetIndex = currentSectionRef.current - 1;

    if (isLoopEnabled) {
      if (targetIndex < 0) {
        targetIndex = totalSections - 1;
      }
    } else {
      if (targetIndex < 0) {
        return;
      }
    }

    isAnimatingRef.current = true;
    setIsAnimating(true);
    setCurrentSection(targetIndex);
    setIsScrollLocked(false);

    if (onSectionChange) {
      onSectionChange(targetIndex);
    }

    setTimeout(() => {
      currentSectionRef.current = targetIndex;
      isAnimatingRef.current = false;
      setIsAnimating(false);
    }, animationDuration * 1000);
  }, [totalSections, isLoopEnabled, onSectionChange, animationDuration]);

  /**
   * 마우스 휠 이벤트 핸들러
   */
  const handleWheel = useCallback(
    (event) => {
      if (!isMouseWheelEnabled) return;

      // 모달이 열려있으면 휠 이벤트 무시 (배경 스크롤 방지)
      if (document.body.classList.contains('modal-open')) {
        return;
      }

      // 현재 섹션이 잠긴 섹션이면 이벤트를 전달하지 않음
      if (isCurrentSectionLocked && isScrollLocked) {
        return;
      }

      if (isAnimatingRef.current) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      const delta = direction === 'vertical' ? event.deltaY : event.deltaX;

      if (Math.abs(delta) < 10) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      const scrollDirection = delta > 0 ? 1 : -1;
      const currentSec = currentSection;
      let targetIndex = currentSec + scrollDirection;

      if (isLoopEnabled) {
        if (targetIndex < 0) {
          targetIndex = totalSections - 1;
        } else if (targetIndex >= totalSections) {
          targetIndex = 0;
        }
      } else {
        if (targetIndex < 0 || targetIndex >= totalSections) {
          return;
        }
      }

      if (targetIndex === currentSec) {
        return;
      }

      isAnimatingRef.current = true;
      setIsAnimating(true);
      setCurrentSection(targetIndex);

      // 새 섹션이 잠긴 섹션이면 스크롤 잠금
      if (scrollLockedSections.includes(targetIndex)) {
        setIsScrollLocked(true);
      }

      if (onSectionChange) {
        onSectionChange(targetIndex);
      }

      setTimeout(() => {
        currentSectionRef.current = targetIndex;
        isAnimatingRef.current = false;
        setIsAnimating(false);
      }, animationDuration * 1000);
    },
    [
      isMouseWheelEnabled,
      direction,
      totalSections,
      isLoopEnabled,
      onSectionChange,
      animationDuration,
      currentSection,
      isCurrentSectionLocked,
      isScrollLocked,
      scrollLockedSections,
    ]
  );

  /**
   * 키보드 이벤트 핸들러
   */
  const handleKeyDown = useCallback(
    (event) => {
      if (!isKeyboardEnabled) return;

      // 잠긴 섹션에서는 키보드 네비게이션 비활성화
      if (isCurrentSectionLocked && isScrollLocked) {
        return;
      }

      if (processingScrollRef.current || isAnimatingRef.current) return;

      const { key } = event;
      let targetIndex = currentSectionRef.current;
      let shouldMove = false;

      if (direction === 'vertical') {
        if (key === 'ArrowDown' || key === 'PageDown' || key === ' ') {
          targetIndex = currentSection + 1;
          shouldMove = true;
        } else if (key === 'ArrowUp' || key === 'PageUp') {
          targetIndex = currentSection - 1;
          shouldMove = true;
        }
      } else {
        if (key === 'ArrowRight' || key === 'PageDown') {
          targetIndex = currentSection + 1;
          shouldMove = true;
        } else if (key === 'ArrowLeft' || key === 'PageUp') {
          targetIndex = currentSection - 1;
          shouldMove = true;
        }
      }

      if (key === 'Home') {
        targetIndex = 0;
        shouldMove = true;
      } else if (key === 'End') {
        targetIndex = totalSections - 1;
        shouldMove = true;
      }

      if (shouldMove) {
        event.preventDefault();

        if (isLoopEnabled) {
          if (targetIndex < 0) {
            targetIndex = totalSections - 1;
          } else if (targetIndex >= totalSections) {
            targetIndex = 0;
          }
        } else {
          targetIndex = Math.max(0, Math.min(targetIndex, totalSections - 1));
        }

        if (targetIndex !== currentSection) {
          isAnimatingRef.current = true;
          processingScrollRef.current = true;
          setIsAnimating(true);
          setCurrentSection(targetIndex);

          if (scrollLockedSections.includes(targetIndex)) {
            setIsScrollLocked(true);
          }

          if (onSectionChange) {
            onSectionChange(targetIndex);
          }

          setTimeout(() => {
            currentSectionRef.current = targetIndex;
            isAnimatingRef.current = false;
            setIsAnimating(false);
            processingScrollRef.current = false;
          }, animationDuration * 1000);
        }
      }
    },
    [
      isKeyboardEnabled,
      direction,
      totalSections,
      isLoopEnabled,
      onSectionChange,
      animationDuration,
      currentSection,
      isCurrentSectionLocked,
      isScrollLocked,
      scrollLockedSections,
    ]
  );

  /**
   * 터치 시작 위치 기록
   */
  const handleTouchStart = useCallback(
    (event) => {
      if (!isTouchEnabled) return;

      const touch = event.touches[0];
      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
      };
      
    },
    [isTouchEnabled, isMobile, isCurrentSectionLocked, isScrollLocked]
  );

  /**
   * 터치 종료 이벤트 - 스와이프 거리 계산 및 섹션 이동
   */
  const handleTouchEnd = useCallback(
    (event) => {
      if (!isTouchEnabled) return;

      if (processingScrollRef.current || isAnimatingRef.current) return;

      const touch = event.changedTouches[0];
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = touch.clientY - touchStartRef.current.y;

      const threshold = touchSensitivity;
      let targetIndex = currentSectionRef.current;
      let shouldMove = false;

      // 모바일에서 잠긴 섹션일 때는 갤러리 컨테이너의 경계를 확인
      if (isMobile && isCurrentSectionLocked && isScrollLocked) {
        // 갤러리 컨테이너 찾기 (data-lenis-prevent 속성을 가진 요소)
        const galleryContainer = event.target.closest('[data-lenis-prevent="true"]');
        
        if (galleryContainer) {
          // 현재 보이는 이미지 인덱스로 경계 확인 (scroll-snap 고려)
          const scrollLeft = galleryContainer.scrollLeft;
          const scrollWidth = galleryContainer.scrollWidth;
          const clientWidth = galleryContainer.clientWidth;
          const maxScroll = scrollWidth - clientWidth;
          
          // 각 아이템의 실제 위치를 확인하여 정확한 인덱스 계산
          let currentIdx = 0;
          const children = Array.from(galleryContainer.children);
          if (children.length > 0) {
            // 각 아이템의 offsetLeft를 확인하여 현재 보이는 아이템 찾기
            for (let i = 0; i < children.length; i++) {
              const item = children[i];
              const itemLeft = item.offsetLeft;
              const itemRight = itemLeft + item.offsetWidth;
              // 스크롤 위치가 아이템의 중앙 근처에 있으면 해당 인덱스
              if (scrollLeft >= itemLeft - clientWidth / 2 && scrollLeft < itemRight - clientWidth / 2) {
                currentIdx = i;
                break;
              }
            }
            // 마지막 아이템 체크
            if (scrollLeft >= maxScroll - 10) {
              currentIdx = children.length - 1;
            }
          }
          
          const totalItems = children.length || 0;
          const isAtStart = currentIdx === 0 || scrollLeft <= 5;
          const isAtEnd = currentIdx >= totalItems - 1 || scrollLeft >= maxScroll - 10;
          
          // 경계에 도달했을 때는 가로 스크롤 비율 체크 제거 (PC와 동일)
          if ((isAtStart || isAtEnd)) {
            // 경계에서는 세로 스크롤의 절대값만 확인
            const boundaryThreshold = 20; // 경계에서는 더 낮은 threshold
            
            if (Math.abs(deltaY) > boundaryThreshold) {
              // 모바일에서는 1번만 스와이프하면 바로 섹션 이동 (PC는 2번 필요)
              // 맨 앞에서 위로 스크롤 → 이전 섹션
              if (isAtStart && deltaY > 0 && direction === 'vertical') {
                targetIndex = currentSection - 1;
                shouldMove = true;
              }
              // 맨 뒤에서 아래로 스크롤 → 다음 섹션
              else if (isAtEnd && deltaY < 0 && direction === 'vertical') {
                targetIndex = currentSection + 1;
                shouldMove = true;
              } else {
                // 경계이지만 잘못된 방향
                return;
              }
            } else {
              // 경계이지만 세로 스크롤 거리 부족
              boundaryScrollCountRef.current = 0;
              boundaryDirectionRef.current = null;
              return;
            }
          } else {
            // 경계가 아니면 갤러리에서 처리
            boundaryScrollCountRef.current = 0;
            boundaryDirectionRef.current = null;
            return;
          }
        } else {
          // 갤러리 컨테이너를 찾을 수 없으면 기존 로직
          if (Math.abs(deltaX) > Math.abs(deltaY)) {
            return;
          }
          
          if (direction === 'vertical' && Math.abs(deltaY) > threshold) {
            if (deltaY < 0) {
              targetIndex = currentSection + 1;
            } else {
              targetIndex = currentSection - 1;
            }
            shouldMove = true;
          }
        }
      }
      // PC에서 잠긴 섹션일 때는 기존 동작 유지
      else if (!isMobile && isCurrentSectionLocked && isScrollLocked) {
        return; // PC에서는 기존 동작
      }
      // 일반 섹션에서는 기존 로직 유지
      else {
        if (direction === 'vertical') {
          if (Math.abs(deltaY) > threshold) {
            if (deltaY < 0) {
              targetIndex = currentSection + 1;
            } else {
              targetIndex = currentSection - 1;
            }
            shouldMove = true;
          }
        } else {
          if (Math.abs(deltaX) > threshold) {
            if (deltaX < 0) {
              targetIndex = currentSection + 1;
            } else {
              targetIndex = currentSection - 1;
            }
            shouldMove = true;
          }
        }
      }

      if (shouldMove) {
        if (isLoopEnabled) {
          if (targetIndex < 0) {
            targetIndex = totalSections - 1;
          } else if (targetIndex >= totalSections) {
            targetIndex = 0;
          }
        } else {
          targetIndex = Math.max(0, Math.min(targetIndex, totalSections - 1));
        }

        if (targetIndex !== currentSection) {
          isAnimatingRef.current = true;
          processingScrollRef.current = true;
          setIsAnimating(true);
          setCurrentSection(targetIndex);

          if (scrollLockedSections.includes(targetIndex)) {
            setIsScrollLocked(true);
          }

          if (onSectionChange) {
            onSectionChange(targetIndex);
          }

          setTimeout(() => {
            currentSectionRef.current = targetIndex;
            isAnimatingRef.current = false;
            setIsAnimating(false);
            processingScrollRef.current = false;
          }, animationDuration * 1000);
        }
      }
    },
    [
      isTouchEnabled,
      isMobile,
      direction,
      touchSensitivity,
      totalSections,
      isLoopEnabled,
      onSectionChange,
      animationDuration,
      currentSection,
      isCurrentSectionLocked,
      isScrollLocked,
      scrollLockedSections,
    ]
  );

  // 기본 스크롤 차단
  useEffect(() => {
    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
    };
  }, []);

  // 이벤트 리스너 등록
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleGlobalWheel = (e) => {
      // 모달이 열려있으면 휠 이벤트 무시 (배경 스크롤 방지)
      if (document.body.classList.contains('modal-open')) {
        return;
      }

      // 잠긴 섹션이면 이벤트를 차단하지 않음
      if (isCurrentSectionLocked && isScrollLocked) {
        return;
      }

      if (isMouseWheelEnabled && container.contains(e.target)) {
        e.preventDefault();
        e.stopPropagation();
      }
    };


    if (isMouseWheelEnabled) {
      container.addEventListener('wheel', handleWheel, {
        passive: false,
        capture: false, // capture를 false로 변경하여 자식 이벤트 먼저 처리
      });
      document.addEventListener('wheel', handleGlobalWheel, { passive: false });
    }

    if (isKeyboardEnabled) {
      window.addEventListener('keydown', handleKeyDown);
    }

    if (isTouchEnabled) {
      container.addEventListener('touchstart', handleTouchStart, {
        passive: true,
      });
      container.addEventListener('touchend', handleTouchEnd, { passive: true });
    }

    return () => {
      if (isMouseWheelEnabled) {
        container.removeEventListener('wheel', handleWheel, { capture: false });
        document.removeEventListener('wheel', handleGlobalWheel);
      }
      if (isKeyboardEnabled) {
        window.removeEventListener('keydown', handleKeyDown);
      }
      if (isTouchEnabled) {
        container.removeEventListener('touchstart', handleTouchStart);
        container.removeEventListener('touchend', handleTouchEnd);
      }
    };
  }, [
    isMouseWheelEnabled,
    isKeyboardEnabled,
    isTouchEnabled,
    handleWheel,
    handleKeyDown,
    handleTouchStart,
    handleTouchEnd,
    isCurrentSectionLocked,
    isScrollLocked,
  ]);

  // 애니메이션 변형
  const getTransformValue = () => {
    if (direction === 'vertical') {
      return `translateY(-${currentSection * 100}%)`;
    } else {
      return `translateX(-${currentSection * 100}%)`;
    }
  };

  // 도트 네비게이션 위치 스타일
  const getDotsPositionStyle = () => {
    const baseStyle = {
      position: 'fixed',
      zIndex: 1000,
      display: 'flex',
      gap: 1,
    };

    // 모바일에서는 우측 하단에 가로로 배치 (카피라이트 위)
    if (isMobile) {
      return {
        ...baseStyle,
        flexDirection: 'row',
        right: 20,
        bottom: 46, // 카피라이트(24) + 여유 공간(36) = 60
      };
    }

    // 데스크탑에서는 기존 로직 유지
    switch (dotsPosition) {
      case 'right':
        return {
          ...baseStyle,
          flexDirection: 'column',
          right: 20,
          top: '50%',
          transform: 'translateY(-50%)',
        };
      case 'left':
        return {
          ...baseStyle,
          flexDirection: 'column',
          left: 20,
          top: '50%',
          transform: 'translateY(-50%)',
        };
      case 'bottom':
        return {
          ...baseStyle,
          flexDirection: 'row',
          bottom: 20,
          left: '50%',
          transform: 'translateX(-50%)',
        };
      case 'top':
        return {
          ...baseStyle,
          flexDirection: 'row',
          top: 20,
          left: '50%',
          transform: 'translateX(-50%)',
        };
      default:
        return baseStyle;
    }
  };

  // 컨테이너 포커스 관리
  useEffect(() => {
    const container = containerRef.current;
    if (container && isKeyboardEnabled) {
      container.focus();
    }
  }, [isKeyboardEnabled]);

  // 자식에게 네비게이션 함수 전달
  // eslint-disable-next-line react-hooks/refs
  const childrenWithProps = React.Children.map(sections, (child, index) => {
    if (React.isValidElement(child)) {
      // Suspense로 감싸진 경우 내부 컴포넌트에 props 전달
      if (child.props && 'fallback' in child.props) {
        const realChild = getRealComponent(child);
        if (React.isValidElement(realChild)) {
          const childWithProps = React.cloneElement(realChild, {
            onScrollBoundary: (direction) => {
              if (direction === 'end') {
                goToNextSection();
              } else if (direction === 'start') {
                goToPrevSection();
              }
            },
            isActive: index === currentSection,
          });
          // Suspense 구조 유지하면서 내부 컴포넌트만 교체
          return React.cloneElement(child, {
            children: childWithProps,
          });
        }
      } else {
        // Suspense가 아닌 경우 직접 props 전달
        return React.cloneElement(child, {
          onScrollBoundary: (direction) => {
            if (direction === 'end') {
              goToNextSection();
            } else if (direction === 'start') {
              goToPrevSection();
            }
          },
          isActive: index === currentSection,
        });
      }
    }
    return child;
  });

  return (
    <Box
      ref={ containerRef }
      sx={ {
        height: '100%',
        width: '100%',
        overflow: 'hidden',
        position: 'relative',
        outline: 'none',
        userSelect: 'none',
        // 모바일에서 잠긴 섹션일 때 pan-y와 pan-x 모두 허용
        touchAction: isMobile && isCurrentSectionLocked ? 'pan-y pan-x' : 'none',
        ...sx,
      } }
      tabIndex={ 0 }
      data-lenis-prevent="true"
    >
      {/* 섹션 컨테이너 */}
      <Box
        component={ motion.div }
        animate={ {
          transform: getTransformValue(),
        } }
        transition={ {
          duration: animationDuration,
          ease: [0.25, 0.46, 0.45, 0.94],
        } }
        sx={ {
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: direction === 'vertical' ? 'column' : 'row',
        } }
      >
        {childrenWithProps.map((section, index) => {
          const isGallerySection = scrollLockedSections.includes(index);
          return (
            <Box
              key={ index }
              sx={ {
                height: '100%',
                width: '100%',
                flexShrink: 0,
                position: 'relative',
              } }
            >
              {section}
            </Box>
          );
        })}
      </Box>

      {/* 네비게이션 도트 */}
      {hasDotsNavigation && (
        <Box sx={ getDotsPositionStyle() }>
          {sections.map((_, index) => (
            <Box
              key={ index }
              onClick={ () => goToSection(index) }
              sx={ {
                width: 12,
                height: 12,
                borderRadius: '50%',
                backgroundColor:
                  currentSection === index
                    ? dotsColor || theme.palette.primary.main
                    : theme.palette.action.disabled,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor:
                    currentSection === index
                      ? theme.palette.primary.dark
                      : theme.palette.action.hover,
                  transform: 'scale(1.2)',
                },
              } }
            />
          ))}
        </Box>
      )}
    </Box>
  );
}

FullPageScroll.propTypes = {
  children: PropTypes.node.isRequired,
  animationDuration: PropTypes.number,
  direction: PropTypes.oneOf(['vertical', 'horizontal']),
  isMouseWheelEnabled: PropTypes.bool,
  isKeyboardEnabled: PropTypes.bool,
  isTouchEnabled: PropTypes.bool,
  touchSensitivity: PropTypes.number,
  hasDotsNavigation: PropTypes.bool,
  dotsPosition: PropTypes.oneOf(['right', 'left', 'bottom', 'top']),
  dotsColor: PropTypes.string,
  initialSectionIndex: PropTypes.number,
  onSectionChange: PropTypes.func,
  sx: PropTypes.object,
  isLoopEnabled: PropTypes.bool,
  scrollLockedSections: PropTypes.arrayOf(PropTypes.number),
};

export default FullPageScroll;
