import { PainSectionHandle } from './pain/PainSection';
import { MessageSectionHandle } from './message/MessageSection';

/**
 * 모든 전역 인터랙션 빌더에서 공유하는 기기 및 상태 옵션 [V11.7 정규화]
 */
export interface GlobalBuilderOptions {
  isMobile: boolean;
  isMobileView: boolean;
  isTabletPortrait: boolean;
  isOn: boolean;
  interactionMode: 'mouse' | 'touch';
}

/**
 * Home Section 전역 인터랙션 레이어용 Props [V11.55 확장]
 */
export interface GlobalInteractionStageProps extends GlobalBuilderOptions {
  isTransitioning: boolean;
  painRef: React.RefObject<PainSectionHandle | null>;
  messageRef: React.RefObject<MessageSectionHandle | null>;
}
