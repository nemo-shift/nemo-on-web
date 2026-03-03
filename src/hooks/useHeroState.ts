import { useState } from 'react';

type HeroState = {
  isOn: boolean;          // 현재 ON/OFF 상태
  toggle: () => void;     // 상태 토글 함수
  isScrollable: boolean;  // 가로스크롤 허용 여부 (ON 후 프레이즈 완료 시 true)
};

/**
 * useHeroState 훅
 *
 * HeroSection의 ON/OFF 상태와 스크롤 잠금 상태를 관리.
 * - isOn: 초기값 false (OFF 상태)
 * - isScrollable: ON 전환 후 약 2400ms 뒤 true로 변경
 * - OFF 전환 시 isScrollable 즉시 false로 리셋
 */
export default function useHeroState(): HeroState {
  const [isOn, setIsOn] = useState(false);
  const [isScrollable, setIsScrollable] = useState(false);

  const toggle = () => {
    setIsOn((prev) => {
      const next = !prev;

      if (next) {
        // ON 전환 — 프레이즈 마지막 줄 등장 완료 시점(2400ms) 후 스크롤 허용
        setTimeout(() => {
          setIsScrollable(true);
        }, 2400);
      } else {
        // OFF 전환 — 스크롤 즉시 잠금
        setIsScrollable(false);
      }

      return next;
    });
  };

  return { isOn, toggle, isScrollable };
}
