import React, { useState, useRef, useEffect, useCallback } from "react";
import { Typography, Box } from "@mui/material";
import PropTypes from "prop-types";

/**
 * 스크롤에 따라 축소되는 스티키 섹션 컴포넌트
 *
 * Props:
 * @param {number} targetScale - 최종 축소 비율 [Optional, 기본값: 0.8]
 * @param {string} backgroundColor - 배경 색상 [Optional, 기본값: '#0000ff']
 * @param {string} image - 배경 이미지 URL [Optional]
 * @param {React.ReactNode} backgroundComponent - 배경으로 사용될 컴포넌트 [Optional]
 * @param {React.ReactNode} children - 섹션 내부에 표시될 컨텐츠 [Optional]
 * @param {React.ReactNode} msg - 섹션에 표시할 메시지 (상단에 위치) [Optional]
 * @param {React.ReactNode} content - 섹션 아래에 표시될 컨텐츠 [Optional]
 * @param {boolean} useFadeEffect - 페이드 인 효과 사용 여부 [Optional, 기본값: false]
 * @param {number} targetOpacity - 최종 투명도 [Optional, 기본값: 0.3]
 *
 * Example usage:
 * // 기본 사용법
 * <StickySection targetScale={0.7} backgroundColor="#f5f5f5">
 *   <Typography variant="h2">스크롤 내리면 섹션이 축소됩니다</Typography>
 * </StickySection>
 *
 * // 배경 이미지 사용
 * <StickySection
 *   targetScale={0.7}
 *   image="path/to/image.jpg"
 *   msg={<Typography variant="h2">메인 메시지</Typography>}
 *   content={<Box>추가 콘텐츠</Box>}
 *   useFadeEffect={true}
 * />
 *
 * // 배경 컴포넌트 사용
 * <StickySection
 *   targetScale={0.7}
 *   backgroundComponent={<GridBG rows={15} cols={20} />}
 * >
 *   <Typography variant="h2">배경 컴포넌트 예제</Typography>
 * </StickySection>
 */
function StickySection({
  targetScale = 0.8,
  backgroundColor = "#0000ff",
  image,
  backgroundComponent,
  children,
  msg,
  content,
  useFadeEffect = false,
  targetOpacity = 0.5,
}) {
  // 상태 관리
  const [scaleValue, setScaleValue] = useState(1.0);
  const [opacity, setOpacity] = useState(useFadeEffect ? 0 : 1);
  const [fadeOutOpacity, setFadeOutOpacity] = useState(1);
  const sectionRef = useRef(null);
  const containerRef = useRef(null);

  // 가장 가까운 스크롤 컨테이너를 찾는 함수 (StickyContainer와 동일)
  const findScrollContainer = useCallback((element) => {
    while (element && element !== document.body) {
      const style = window.getComputedStyle(element);
      if (
        style.overflow === "auto" ||
        style.overflow === "scroll" ||
        style.overflowY === "auto" ||
        style.overflowY === "scroll"
      ) {
        return element;
      }
      element = element.parentElement;
    }
    return null; // viewport 사용
  }, []);

  // 스크롤 이벤트 핸들러 - 수정된 버전
  const handleScroll = useCallback(
    (scrollContainer) => {
      if (!sectionRef.current || !containerRef.current) {
        return;
      }

      const containerRect = containerRef.current.getBoundingClientRect();

      // 스크롤 컨테이너에 따라 높이 계산 분기
      let containerHeight;
      let containerTop = 0;

      if (scrollContainer === null) {
        // viewport 사용
        containerHeight = window.innerHeight;
        containerTop = 0;
      } else {
        // 특정 스크롤 컨테이너 사용
        const scrollContainerRect = scrollContainer.getBoundingClientRect();
        containerHeight = scrollContainer.clientHeight;
        containerTop = scrollContainerRect.top;
      }

      // 애니메이션 범위 설정 - targetScale 도달을 100vh로 고정
      const animationStartPoint = containerTop;
      const animationEndPoint = containerTop - window.innerHeight; // 100vh에서 축소 완료

      // progress 계산
      let currentProgress = 0;

      if (
        containerRect.top <= animationStartPoint &&
        containerRect.top >= animationEndPoint
      ) {
        // 애니메이션 구간 내에 있을 때
        currentProgress =
          (animationStartPoint - containerRect.top) /
          (animationStartPoint - animationEndPoint);
        currentProgress = Math.max(0, Math.min(1, currentProgress));

        // 페이드 효과 사용 시 완전 불투명하게
        if (useFadeEffect) {
          setOpacity(1);
        }

        // 스케일 축소에 따라 페이드 아웃
        const opacityRange = 1 - targetOpacity;
        setFadeOutOpacity(1 - currentProgress * opacityRange);
      } else if (containerRect.top > animationStartPoint) {
        // 시작점보다 아래에 있으면
        currentProgress = 0;
        setFadeOutOpacity(1); // 완전 불투명

        // 페이드 효과 사용 시
        if (useFadeEffect) {
          // 뷰포트에 진입하기 시작한 시점부터 스티키 지점까지 페이드인
          const fadeInStart = containerTop + containerHeight; // 컨테이너 하단

          if (containerRect.top < fadeInStart) {
            // fadeInProgress는 0(시작)부터 1(완료)까지 변화
            const fadeInProgress =
              1 -
              Math.max(
                0,
                Math.min(
                  1,
                  (containerRect.top - containerTop) / containerHeight
                )
              );
            setOpacity(fadeInProgress);
          } else {
            // 아직 컨테이너에 진입하지 않음
            setOpacity(0);
          }
        }
      } else if (containerRect.top < animationEndPoint) {
        // 종료점보다 위에 있으면
        currentProgress = 1;
        setFadeOutOpacity(targetOpacity); // 최대 축소 시 목표 투명도

        // 페이드 효과 사용 시 계속 불투명 유지
        if (useFadeEffect) {
          setOpacity(1);
        }
      }

      // 1.0에서 targetScale까지 범위로 스케일 계산
      const scaleRange = 1.0 - targetScale;
      setScaleValue(1 - currentProgress * scaleRange);
    },
    [targetScale, useFadeEffect, targetOpacity]
  );

  // 이벤트 리스너 등록/해제 - 수정된 버전
  useEffect(() => {
    if (!containerRef.current) return;

    // 스크롤 컨테이너 찾기
    const scrollContainer = findScrollContainer(
      containerRef.current.parentElement
    );

    // 스크롤 핸들러 래퍼
    const scrollHandler = () => handleScroll(scrollContainer);

    // 초기 계산
    scrollHandler();

    // 이벤트 리스너 등록
    if (scrollContainer === null) {
      // viewport 스크롤 감지
      window.addEventListener("scroll", scrollHandler, { passive: true });
      return () => window.removeEventListener("scroll", scrollHandler);
    } else {
      // 특정 컨테이너 스크롤 감지
      scrollContainer.addEventListener("scroll", scrollHandler, {
        passive: true,
      });
      return () => scrollContainer.removeEventListener("scroll", scrollHandler);
    }
  }, [handleScroll, findScrollContainer]);

  // 배경 렌더링 결정
  const renderBackground = () => {
    if (backgroundComponent) {
      return backgroundComponent;
    }

    return null;
  };

  // 계산된 최종 opacity
  const finalOpacity = opacity * fadeOutOpacity;

  // content와 축소된 이미지 간의 거리 계산
  const imageEmptySpace = 100 * (1 - targetScale); // 축소로 인해 생긴 빈 공간 (vh)
  const contentMarginTop = -imageEmptySpace/2; // content를 위로 당겨올릴 음수 margin

  // 통합된 렌더링 로직
  return (
    <Box
      ref={containerRef}
      sx={{
        position: "relative",
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      {/* 스티키 영역만을 위한 컨테이너 */}
      <Box
        sx={{
          position: "relative",
          width: "100%",
          minHeight: "210vh", // 고정 높이
          boxSizing: "border-box",
        }}
      >
        {/* 스티키 영역 (배경) */}
        <Box
          ref={sectionRef}
          sx={{
            position: "sticky",
            top: 0,
            height: "100vh",
            width: "100%",
            zIndex: 0,
          }}
        >
          {/* 스케일링되는 배경 컨텐츠 박스 */}
          <Box
            sx={{
              width: "100%",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              ...(backgroundComponent
                ? {} // backgroundComponent가 제공되면 이 Box는 컨테이너 역할
                : image
                ? {
                    backgroundImage: `url(${image})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }
                : { backgroundColor: backgroundColor }),
              transformOrigin: "center center",
              transform: `scale(${scaleValue})`,
              overflow: "hidden",
              position: "relative",
              opacity: finalOpacity,
              transition: "transform 0.3s ease-out, opacity 0.3s ease-out",
              willChange: "transform, opacity",
            }}
          >
            {backgroundComponent && renderBackground()}
          </Box>
        </Box>

        {/* 메인 메시지/컨텐츠 영역 (스티키 배경 위에 오버레이) */}
        <Box
          sx={{
            position: "relative",
            width: "100%",
            height: "100vh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            marginTop: "-100vh",
            zIndex: 9,
          }}
        >
          {msg || children}
        </Box>

        {/* 추가 스크롤 공간 - 축소 완료 후 여백 */}
        <Box
          sx={{
            height: "100vh", // 고정 여백
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {/* 축소 완료 후 스티키 해제를 위한 여백 공간 */}
        </Box>
      </Box>

      {/* Content 전용 컨테이너 - 자연스럽게 등장 */}
      {content && (
        <Box
          sx={{
            marginTop: `${contentMarginTop}vh`,
            position: "relative",
            zIndex: 10, // 스티키보다 위에
            width: "100%",
          }}
        >
          {content}
        </Box>
      )}
    </Box>
  );
}

StickySection.propTypes = {
  targetScale: PropTypes.number,
  backgroundColor: PropTypes.string,
  image: PropTypes.string,
  backgroundComponent: PropTypes.node,
  children: PropTypes.node,
  msg: PropTypes.node,
  content: PropTypes.node,
  useFadeEffect: PropTypes.bool,
  targetOpacity: PropTypes.number,
};

export default StickySection;
