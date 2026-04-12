import { PainSectionHandle } from './pain/PainSection';

/**
 * Home Section 전역 인터랙션 레이어용 Props [V11.55 확장]
 */
export interface GlobalInteractionStageProps {
  isMobile: boolean;
  interactionMode: 'mouse' | 'touch';
  isMobileView: boolean;
  isTabletPortrait: boolean;
  isOn: boolean;
  isTransitioning: boolean;
  painRef: React.RefObject<PainSectionHandle | null>;
}
