/**
 * 히어로 섹션 관련 타입 정의
 */

export type HeroSectionProps = {
  isOn: boolean;
  onToggle: () => void;
};

/** HeroBigTypo OFF 모드 도형 상태 */
export type HeroBigTypoOffShapes = {
  colonHidden: boolean;
  hovered: boolean;
  onColonHide: (hidden: boolean) => void;
  onTriCirHover: (hovered: boolean) => void;
};

export type HeroBigTypoProps = {
  isOn: boolean;
  isMobile?: boolean;
  tcRef: React.RefObject<HTMLDivElement | null>;
  shapesStageRef?: React.RefObject<HTMLDivElement | null>;
  offShapes: HeroBigTypoOffShapes;
  onFlash?: (text: string) => void;
  onExplodeComplete?: () => void;
};
