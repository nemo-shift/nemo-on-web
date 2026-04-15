'use client';

import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

function cn(...classes: (string | undefined | null | boolean)[]): string {
  return classes.filter(Boolean).join(' ');
}

export interface RotatingTextRef {
  next: () => void;
  previous: () => void;
  jumpTo: (index: number) => void;
  reset: () => void;
}

export interface RotatingTextProps
  extends Omit<
    React.ComponentPropsWithoutRef<'span'>,
    'children'
  > {
  texts: string[];
  rotationInterval?: number;
  staggerDuration?: number;
  staggerFrom?: 'first' | 'last' | 'center' | 'random' | number;
  loop?: boolean;
  auto?: boolean;
  splitBy?: string;
  onNext?: (index: number) => void;
  mainClassName?: string;
  splitLevelClassName?: string;
  elementLevelClassName?: string;
}

/**
 * RotatingText 컴포넌트 (v2)
 * 
 * 텍스트 배열을 순환하며 애니메이션과 함께 표시합니다.
 * 프로젝트의 디자인 톤에 맞춰 캐릭터 단위의 블러(Blur)와 회전 효과를 강화했습니다.
 */
const RotatingText = forwardRef<RotatingTextRef, RotatingTextProps>(
  (
    {
      texts,
      rotationInterval = 2500,
      staggerDuration = 0.05,
      staggerFrom = 'first',
      loop = true,
      auto = true,
      splitBy = 'characters',
      onNext,
      mainClassName,
      splitLevelClassName,
      elementLevelClassName,
      ...rest
    },
    ref
  ) => {
    const [currentTextIndex, setCurrentTextIndex] = useState<number>(0);

    const splitIntoCharacters = (text: string): string[] => {
      if (typeof Intl !== 'undefined' && Intl.Segmenter) {
        const segmenter = new Intl.Segmenter('ko', { granularity: 'grapheme' });
        return Array.from(segmenter.segment(text), segment => segment.segment);
      }
      return Array.from(text);
    };

    const elements = useMemo(() => {
      const currentText: string = texts[currentTextIndex];
      if (splitBy === 'characters') {
        const words = currentText.split(' ');
        return words.map((word, i) => ({
          characters: splitIntoCharacters(word),
          needsSpace: i !== words.length - 1
        }));
      }
      if (splitBy === 'words') {
        return currentText.split(' ').map((word, i, arr) => ({
          characters: [word],
          needsSpace: i !== arr.length - 1
        }));
      }
      return currentText.split(splitBy).map((part, i, arr) => ({
        characters: [part],
        needsSpace: i !== arr.length - 1
      }));
    }, [texts, currentTextIndex, splitBy]);

    const getStaggerDelay = useCallback(
      (index: number, totalChars: number): number => {
        if (staggerFrom === 'first') return index * staggerDuration;
        if (staggerFrom === 'last') return (totalChars - 1 - index) * staggerDuration;
        if (staggerFrom === 'center') {
          const center = Math.floor(totalChars / 2);
          return Math.abs(center - index) * staggerDuration;
        }
        if (staggerFrom === 'random') {
          return Math.random() * totalChars * staggerDuration;
        }
        return Math.abs((staggerFrom as number) - index) * staggerDuration;
      },
      [staggerFrom, staggerDuration]
    );

    const handleIndexChange = useCallback(
      (newIndex: number) => {
        setCurrentTextIndex(newIndex);
        if (onNext) onNext(newIndex);
      },
      [onNext]
    );

    const next = useCallback(() => {
      const nextIndex = currentTextIndex === texts.length - 1 ? (loop ? 0 : currentTextIndex) : currentTextIndex + 1;
      if (nextIndex !== currentTextIndex) {
        handleIndexChange(nextIndex);
      }
    }, [currentTextIndex, texts.length, loop, handleIndexChange]);

    const previous = useCallback(() => {
      const prevIndex = currentTextIndex === 0 ? (loop ? texts.length - 1 : currentTextIndex) : currentTextIndex - 1;
      if (prevIndex !== currentTextIndex) {
        handleIndexChange(prevIndex);
      }
    }, [currentTextIndex, texts.length, loop, handleIndexChange]);

    const jumpTo = useCallback(
      (index: number) => {
        const validIndex = Math.max(0, Math.min(index, texts.length - 1));
        if (validIndex !== currentTextIndex) {
          handleIndexChange(validIndex);
        }
      },
      [texts.length, currentTextIndex, handleIndexChange]
    );

    const reset = useCallback(() => {
      if (currentTextIndex !== 0) {
        handleIndexChange(0);
      }
    }, [currentTextIndex, handleIndexChange]);

    useImperativeHandle(
      ref,
      () => ({
        next,
        previous,
        jumpTo,
        reset
      }),
      [next, previous, jumpTo, reset]
    );

    const containerRef = React.useRef<HTMLSpanElement>(null);

    useGSAP(() => {
      const chars = containerRef.current?.querySelectorAll('.char-unit');
      if (!chars || chars.length === 0) return;

      // [V16.3] 캐릭터 단위 시네마틱 등장 애니메이션
      gsap.fromTo(chars, 
        { 
          y: '100%', 
          opacity: 0, 
          rotateX: 45, 
          filter: 'blur(10px)' 
        },
        { 
          y: 0, 
          opacity: 1, 
          rotateX: 0, 
          filter: 'blur(0px)',
          duration: 0.8,
          ease: 'power3.out',
          stagger: {
            each: staggerDuration,
            from: staggerFrom === 'first' ? 'start' : (staggerFrom === 'last' ? 'end' : staggerFrom)
          }
        }
      );
    }, { dependencies: [currentTextIndex], scope: containerRef });

    useEffect(() => {
      if (!auto) return;
      const intervalId = setInterval(next, rotationInterval);
      return () => clearInterval(intervalId);
    }, [next, rotationInterval, auto]);

    return (
      <span
        ref={containerRef}
        className={cn('inline-flex flex-wrap whitespace-pre-wrap relative perspective-[500px]', mainClassName)}
        {...rest}
      >
        <span className="sr-only">{texts[currentTextIndex]}</span>
        <span
          key={currentTextIndex}
          className="flex flex-wrap whitespace-pre-wrap relative"
          style={{ transformStyle: 'preserve-3d' }}
          aria-hidden="true"
        >
          {elements.map((wordObj, wordIndex) => (
            <span key={wordIndex} className={cn('inline-flex', splitLevelClassName)}>
              {wordObj.characters.map((char, charIndex) => (
                <span
                  key={charIndex}
                  className={cn('char-unit inline-block', elementLevelClassName)}
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  {char}
                </span>
              ))}
              {wordObj.needsSpace && <span className="whitespace-pre"> </span>}
            </span>
          ))}
        </span>
      </span>
    );
  }
);

RotatingText.displayName = 'RotatingText';
export default RotatingText;
