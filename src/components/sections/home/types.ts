/**
 * Home Section 전용 타입 정의 [Step 4-1]
 */

export interface GlobalInteractionStageProps {
  isMobile: boolean;
  isMidRange: boolean;
  interactionMode: 'mouse' | 'touch';
  isMobileView: boolean;
  isTabletPortrait: boolean; // [v1.6] 태블릿 세로 판단용
  isOn: boolean;
  isTransitioning: boolean;
}

export interface JourneySectionConfig {
  label: string;
  stage: string;
  ease?: string;
}
