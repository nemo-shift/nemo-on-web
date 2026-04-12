import { gsap } from 'gsap';
import { 
  COLORS, STAGES, NEMO_RESPONSIVE_LAYOUT 
} from '@/constants/interaction';
import { SharedNemoHandle } from '../SharedNemo';

/**
 * 메시지 섹션 타임라인 빌더 (Rail Skeleton)
 * 네모 박스는 틸 색상 세로형으로 고정, 텍스트가 위를 통과함.
 */
export function buildMessageTimeline(
  tl: gsap.core.Timeline,
  nemo: SharedNemoHandle,
  device: { isMobile: boolean; isTabletPortrait: boolean },
  L: Record<string, number>
) {
  const nemoEl = nemo.nemoEl;
  if (!nemoEl) return;

  const mode: keyof typeof NEMO_RESPONSIVE_LAYOUT.MESSAGE = 
    device.isMobile ? 'MOBILE' : 
    device.isTabletPortrait ? 'TABLET_P' : 'PC';
  
  const layout = NEMO_RESPONSIVE_LAYOUT.MESSAGE[mode];
  
  // 메시지 세로 틸 박스 고정 상태 (이미 builders/pain.ts에서 모칭되어 넘어옴)
  // [V11.55 Normalize] 상수 시스템 기반 레이아웃 주입
  tl.set(nemoEl, {
    width: layout.w,
    height: layout.h,
    left: layout.left,
    top: layout.top,
    xPercent: -50,
    yPercent: -50,
    backgroundColor: COLORS.BRAND,
    borderRadius: 12,
    opacity: 1,
    border: 'none',
  }, L[STAGES.TO_MESSAGE]);

  // TODO: Step 6 작업 시, 텍스트 레이어를 별도로 생성하여 "박스 위를 통과하는" 연출 구현 예정
  // 현재는 뼈대 위치만 점유함
}
