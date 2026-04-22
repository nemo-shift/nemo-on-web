import { PainSectionHandle } from './pain/PainSection';
import { MessageSectionHandle } from './message/MessageSection';
import { ForWhoSectionHandle } from './forwho/ForWhoSection';

/**
 * 모든 전역 상수를 관제탑으로부터 주입받기 위한 레지스트리 규격 [V11.20 정규화]
 * [V11.Macro_Final] any를 제거하고 중첩 객체 구조를 수용하도록 유동적 레코드 타입 적용
 */
export interface InteractionRegistry {
  constants: Record<string, any> & {
    STAGES: Record<string, string>;
    COLORS: Record<string, any>;
    TIMING_CFG: Record<string, any>;
    HEADER_POS: Record<string, any>;
    SECTION_SCROLL_HEIGHT: Record<string, number>;
    INTERACTION_Z_INDEX: Record<string, number>;
  };
  data: Record<string, any> & {
    JOURNEY_MASTER_CONFIG: Record<string, any>;
    LOGO_JOURNEY_SECTIONS: any[];
    NEMO_JOURNEY_SECTIONS: any[];
  };
}

/**
 * 모든 전역 인터랙션 빌더에서 공유하는 기기 및 상태 옵션 [V11.7 정규화]
 */
export interface GlobalBuilderOptions {
  isMobile: boolean;
  isMobileView: boolean;
  isTabletPortrait: boolean;
  isOn: boolean;
  interactionMode: 'mouse' | 'touch';
  registry: InteractionRegistry; // [V11.20] 빌더 전용 보급로
  // [V43] 리사이즈 복구 시나리오를 위한 실측 영점 좌표
  initialNemoPos?: {
    left: number;
    top: number;
    width: number;
    height: number;
  };
}

/**
 * Home Section 전역 인터랙션 레이어용 Props [V11.55 확장]
 * [!] 주의: 부모(HomeStage)로부터 registry를 받지 않으므로 GlobalBuilderOptions를 상속하되 registry는 제외하거나 별도 정의합니다.
 */
export interface GlobalInteractionStageProps {
  isMobile: boolean;
  isMobileView: boolean;
  isTabletPortrait: boolean;
  isOn: boolean;
  interactionMode: 'mouse' | 'touch';
  isTransitioning: boolean;
  painRef: React.RefObject<PainSectionHandle | null>;
  messageRef: React.RefObject<MessageSectionHandle | null>;
  forwhoRef: React.RefObject<ForWhoSectionHandle | null>;
  sectionsContentRef: React.RefObject<HTMLDivElement | null>;
}
