import React, { useRef, useState, useEffect } from "react";
import { Box, Typography, useTheme } from "@mui/material";
import useIsInView from "../../../hooks/useIsInView";

/**
 * 타이핑 효과 컴포넌트
 *
 * Props:
 * @param {Array} texts - 타이핑 할 텍스트 배열 [Optional, 기본값: ['Hello Designers', 'You can make it', 'With Cursor AI.']]
 * @param {number} typingSpeed - 타이핑 속도 (ms) [Optional, 기본값: 100]
 * @param {number} deleteSpeed - 삭제 속도 (ms) [Optional, 기본값: 50]
 * @param {string} cursorColor - 커서 색상 [Optional, 기본값: 텍스트 색상과 동일]
 * @param {string} textColor - 텍스트 색상 [Optional, 기본값: 'inherit']
 * @param {object} fontSize - 폰트 사이즈 객체 [Optional, 기본값: {}]
 * @param {string} variant - Typography 변형 [Optional, 기본값: { xs: "h3", sm: "h3", md: "h2", lg: "h1" }]
 * @param {string} fontFamily - 폰트 패밀리 [Optional, 기본값: 'monospace']
 * @param {number} startDelay - 타이핑 시작 전 대기 시간 (ms) [Optional, 기본값: 0]
 * @param {string} cursorType - 커서 타입 ('line', 'circle', 'square') [Optional, 기본값: 'line']
 * @param {object} sx - 추가 스타일 객체 [Optional, 기본값: {}]
 * @param {boolean} autoStart - 자동 시작 여부 (useIsInView 우회) [Optional, 기본값: false]
 * @param {string} dataSection - 섹션 식별자 (디버깅 및 배경 전환 필터링용) [Optional]
 *
 * Example usage:
 * <TypingEffectDemo texts={['Hello', 'World', 'Typing Effect']} typingSpeed={80} variant="h3" cursorType="circle" />
 */
function TypingEffect({
  texts = ["Hello Designers", "You can make it", "With Cursor AI."],
  typingSpeed = 100,
  deleteSpeed = 50,
  cursorColor = "#fff",
  textColor = "inherit",
  fontSize,
  variant = { xs: "h3", sm: "h3", md: "h2", lg: "h1" },
  textAlign = "left",
  fontFamily,
  fontWeight = "bold",
  sx = {},
  startDelay = 0,
  cursorType = "line",
  cursorBlinkDuration = 1,
  autoStart = false,
  dataSection = null,
}) {
  const textRef = useRef(null);
  const [containerRef, isInView] = useIsInView();
  const [currentText, setCurrentText] = useState("");
  const [textIndex, setTextIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [charIndex, setCharIndex] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const theme = useTheme();

  // texts 배열의 유효성을 확인하고 필요하면 기본값으로 설정
  const safeTexts =
    Array.isArray(texts) && texts.length > 0 ? texts : ["Hello Designer"];

  // 애니메이션 단계 전환 딜레이 값
  const delayAfterTyping = 1000; // 타이핑 완료 후 삭제 시작 전까지 대기 시간
  const delayBeforeTyping = 500; // 텍스트 삭제 완료 후 다음 텍스트 타이핑 시작 전 대기 시간

  // 화면에 보일 때 애니메이션 시작 (autoStart가 true면 바로 시작)
  useEffect(() => {
    if (autoStart && !hasStarted) {
      const startTimeout = setTimeout(() => {
        setIsTyping(true);
        setHasStarted(true);
      }, startDelay);

      return () => clearTimeout(startTimeout);
    } else if (!autoStart && isInView && !hasStarted) {
      const startTimeout = setTimeout(() => {
        setIsTyping(true);
        setHasStarted(true);
      }, startDelay);

      return () => clearTimeout(startTimeout);
    }
  }, [isInView, hasStarted, startDelay, autoStart]);

  // 타이핑 애니메이션 효과 구현
  useEffect(() => {
    // 애니메이션이 시작되지 않았거나 (autoStart가 false일 때) 화면에 보이지 않으면 실행하지 않음
    if ((!autoStart && !isInView) || !hasStarted) return;

    // 현재 출력할 전체 텍스트
    const currentFullText = safeTexts[textIndex] || "";

    // 현재 텍스트가 마지막 텍스트인지 확인
    const isLastText = textIndex === safeTexts.length - 1;

    // 1. 타이핑 진행 중 (글자를 하나씩 추가)
    if (isTyping && charIndex < currentFullText.length) {
      const typingTimeout = setTimeout(() => {
        setCurrentText((prev) => prev + currentFullText.charAt(charIndex));
        setCharIndex(charIndex + 1);
      }, typingSpeed);
      return () => clearTimeout(typingTimeout);
    }

    // 2. 타이핑 완료, 잠시 대기 후 다음 단계
    else if (isTyping && charIndex >= currentFullText.length) {
      const pauseTimeout = setTimeout(() => {
        // 마지막 텍스트는 삭제하지 않고 타이핑 상태 종료
        if (isLastText) {
          return; // 애니메이션 종료 (커서만 계속 깜빡임)
        }
        // 다음 단계: 텍스트 삭제 시작
        setIsTyping(false);
      }, delayAfterTyping);
      return () => clearTimeout(pauseTimeout);
    }

    // 3. 삭제 진행 중 (글자를 하나씩 제거)
    else if (!isTyping && charIndex > 0) {
      const deletingTimeout = setTimeout(() => {
        setCurrentText((prev) => prev.slice(0, -1));
        setCharIndex(charIndex - 1);
      }, deleteSpeed);
      return () => clearTimeout(deletingTimeout);
    }

    // 4. 삭제 완료, 다음 텍스트로 이동
    else if (!isTyping && charIndex === 0) {
      // 마지막 텍스트면 더 이상 진행하지 않음 (이미 위에서 처리되었지만 혹시 모를 경우를 위한 안전장치)
      if (isLastText) return;

      const nextTextTimeout = setTimeout(() => {
        // 다음 텍스트로 이동
        setTextIndex(textIndex + 1);
        setIsTyping(true);
      }, delayBeforeTyping);
      return () => clearTimeout(nextTextTimeout);
    }
  }, [
    textIndex,
    charIndex,
    isTyping,
    safeTexts,
    typingSpeed,
    deleteSpeed,
    isInView,
    hasStarted,
  ]);

  // 커서 타입별 스타일 설정
  const getCursorStyle = () => {
    // 기본 스타일
    const baseStyle = {
      backgroundColor: cursorColor || textColor,
      animation: `blink ${cursorBlinkDuration}s ease-in-out infinite`,
    };

    switch (cursorType) {
      case "circle":
        return {
          ...baseStyle,
          width: fontSize ? `${fontSize * 0.2}px` : "0.2em",
          height: fontSize ? `${fontSize * 0.2}px` : "0.2em",
          borderRadius: "50%",
          display: "inline-block",
          position: "relative",
          verticalAlign: "text-bottom",
        };
      case "square":
        return {
          ...baseStyle,
          width: fontSize ? `${fontSize * 0.25}px` : "0.25em",
          height: fontSize ? `${fontSize * 0.25}px` : "0.25em",
          display: "inline-block",
          position: "relative",
          verticalAlign: "text-bottom",
        };
      case "line":
      default:
        return {
          ...baseStyle,
          width: fontSize ? `${fontSize * 0.08}px` : "0.08em",
          height: "1em", // 폰트 사이즈와 동일한 높이
          display: "inline-block",
          verticalAlign: "middle",
          marginBottom: "0.1em", // 약간의 위치 조정으로 중앙에 더 가깝게 정렬
        };
    }
  };

  // 줄바꿈이 있는 텍스트를 처리하기 위한 방법
  const formattedText = () => {
    // 텍스트가 없는 경우에도 커서는 표시
    if (!currentText) {
      return (
        <Box
          component="span"
          sx={{
            ...getCursorStyle(),
            display: "inline-block",
            position: "relative",
            verticalAlign: cursorType === "line" ? "middle" : "text-bottom",
            marginLeft: "0.1em",
            ...(cursorType === "line"
              ? {
                  marginBottom: "0.1em",
                }
              : cursorType === "circle" || cursorType === "square"
              ? {
                  bottom: fontSize ? `${fontSize * 0.2}px` : "0.2em",
                }
              : {}),
            // 깜빡임 애니메이션 적용
            "@keyframes blink": {
              "0%": { opacity: 1 },
              "50%": { opacity: 0 },
              "100%": { opacity: 1 },
            },
          }}
        />
      );
    }

    const lines = currentText.split("\n");

    return (
      <>
        {lines.map((line, i) => (
          <React.Fragment key={i}>
            {line}
            {i === lines.length - 1 ? (
              <Box
                component="span"
                sx={{
                  ...getCursorStyle(),
                  display: "inline-block",
                  position: "relative",
                  verticalAlign:
                    cursorType === "line" ? "middle" : "text-bottom",
                  marginLeft: "0.1em",
                  ...(cursorType === "line"
                    ? {
                        marginBottom: "0.1em",
                      }
                    : cursorType === "circle" || cursorType === "square"
                    ? {
                        bottom: fontSize ? `${fontSize * 0.2}px` : "0.2em",
                      }
                    : {}),
                  // 깜빡임 애니메이션 적용
                  "@keyframes blink": {
                    "0%": { opacity: 1 },
                    "50%": { opacity: 0 },
                    "100%": { opacity: 1 },
                  },
                }}
              />
            ) : (
              <br />
            )}
          </React.Fragment>
        ))}
      </>
    );
  };

  return (
    <Box
      ref={containerRef}
      data-section={dataSection || undefined}
      sx={{
        py: 4,
        ...sx,
        // 전역 애니메이션 키프레임 정의
        "@keyframes blink": {
          "0%": { opacity: 1 },
          "50%": { opacity: 0 },
          "100%": { opacity: 1 },
        },
      }}
    >
      <Typography
        ref={textRef}
        variant={typeof variant === "string" ? variant : undefined}
        color={textColor}
        sx={{
          fontWeight: fontWeight,
          fontFamily: fontFamily,
          letterSpacing: "0rem",
          minHeight: "1.2em",
          textAlign: textAlign,
          whiteSpace: "pre-wrap",
          display: "block",
          width: "100%",
          ...(typeof variant === "object" &&
            Object.keys(variant).reduce((acc, breakpoint) => {
              acc[theme.breakpoints.up(breakpoint)] = {
                ...theme.typography[variant[breakpoint]],
              };
              return acc;
            }, {})),
          ...sx,
        }}
      >
        {formattedText()}
      </Typography>
    </Box>
  );
}

export default TypingEffect;
