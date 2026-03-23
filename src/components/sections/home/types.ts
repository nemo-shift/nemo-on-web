/**
 * Home Section 전용 타입 정의 [Step 4-1]
 */

export interface GlobalInteractionStageProps {
  isMobile: boolean;
  isTablet: boolean;
  isOn: boolean;
  isTransitioning: boolean;
}

export interface JourneySectionConfig {
  label: string;
  stage: string;
  ease?: string;
}
