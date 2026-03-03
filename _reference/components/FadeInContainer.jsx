import React, { useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import { motion, useAnimation } from "framer-motion";
import { useLocation } from "react-router-dom";

import useIsInView from "../../../hooks/useIsInView";

/**
 * FadeInContainer 컴포넌트 (실제 뷰포트 감지 방식)
 * 가로/세로 모든 축을 고려하여 실제로 뷰포트에 진입 시 페이드인 + 이동 애니메이션 효과를 적용합니다.
 * 라우터 이동 시에도 애니메이션이 올바르게 재실행됩니다.
 *
 * Props:
 * @param {React.ReactNode} children - 애니메이션을 적용할 자식 요소들 [Required]
 * @param {'left' | 'right' | 'top' | 'bottom' | 'none'} direction - 애니메이션 시작 방향 [Optional, 기본값: 'bottom']
 * @param {number} offset - 시작 방향으로부터의 초기 오프셋 거리(px) [Optional, 기본값: 50]
 * @param {number} duration - 애니메이션 지속 시간(초) [Optional, 기본값: 0.5]
 * @param {number} delay - 애니메이션 시작 전 지연 시간(초) [Optional, 기본값: 0] (순차 적용 시 사용)
 * @param {boolean} once - 애니메이션을 한 번만 실행할지 여부 [Optional, 기본값: false]
 * @param {number} amount - 애니메이션 트리거를 위한 요소 노출 비율 (0 ~ 1) [Optional, 기본값: 0.3]
 * @param {object} style - 스타일 객체 [Optional]
 *
 * Example usage (Single element):
 * <FadeInContainer direction="left" duration={0.7}>
 *   <div>Hello!</div>
 * </FadeInContainer>
 *
 * Example usage (Staggered list):
 * {items.map((item, index) => (
 *   <FadeInContainer key={item.id} delay={index * 0.1} direction="top">
 *     <div>{item.text}</div>
 *   </FadeInContainer>
 * ))}
 */
function FadeInContainer({
  children,
  direction = "bottom",
  offset = 50,
  duration = 0.5,
  delay = 0,
  once = true,
  amount = 0.3,
  style,
  ...props
}) {
  // 실제 뷰포트 감지 훅 사용
  const [viewportRef, isInView] = useIsInView({
    threshold: amount,
    triggerOnce: once,
  });

  // 애니메이션 컨트롤러
  const controls = useAnimation();

  // 현재 경로 변경 감지
  const location = useLocation();

  // 초기 상태와 최종 상태 정의
  const initialState = useMemo(
    () => ({
      opacity: 0,
      x: direction === "left" ? -offset : direction === "right" ? offset : 0,
      y: direction === "top" ? -offset : direction === "bottom" ? offset : 0,
    }),
    [direction, offset]
  );

  const finalState = useMemo(
    () => ({
      opacity: 1,
      x: 0,
      y: 0,
    }),
    []
  );

  // 실제 뷰포트 진입 시 애니메이션 실행
  useEffect(() => {
    if (isInView) {
      controls.start(finalState);
    } else if (!once) {
      controls.start(initialState);
    }
  }, [isInView, controls, initialState, finalState, once]);

  // 라우트 변경 시 애니메이션 리셋 및 재실행
  useEffect(() => {
    // 라우트가 변경되면 요소가 이미 뷰포트에 있더라도 애니메이션을 재시작
    if (isInView && !once) {
      // 약간의 지연을 두어 라우트 변경 후 애니메이션이 눈에 띄게 실행되도록 함
      const timer = setTimeout(() => {
        // 애니메이션 리셋 후 재실행
        controls.set(initialState);
        controls.start(finalState);
      }, 10);

      return () => clearTimeout(timer);
    }
  }, [location.pathname, controls, initialState, finalState, isInView, once]);

  return (
    <motion.div
      ref={viewportRef}
      initial={initialState}
      animate={controls}
      transition={{
        duration,
        delay,
        ease: [0.4, 0.0, 0.2, 1], // Material Design 표준 ease out
      }}
      style={{ ...style, width: "100%" }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

FadeInContainer.propTypes = {
  children: PropTypes.node.isRequired,
  direction: PropTypes.oneOf(["left", "right", "top", "bottom", "none"]),
  offset: PropTypes.number,
  duration: PropTypes.number,
  delay: PropTypes.number,
  once: PropTypes.bool,
  amount: PropTypes.number,
  style: PropTypes.object,
  className: PropTypes.string,
};

export default FadeInContainer;
