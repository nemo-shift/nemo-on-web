/**
 * 히어로 섹션 관련 타입 정의
 */

export type HeroSectionProps = {
  id?: string;
  isOn: boolean;
  onToggle: () => void;
};

export type HeroBigTypoProps = {
  isOn: boolean;
  isMobile?: boolean;
  tcRef: React.RefObject<HTMLDivElement | null>;
  shapesStageRef?: React.RefObject<HTMLDivElement | null>;
  onFlash?: (text: string) => void;
  onExplodeComplete?: () => void;
  isTransitioning?: boolean;
  onScrambleComplete?: () => void;
};
