import { gsap } from 'gsap';
import { 
  COLORS, STAGES, TIMING_CFG, EASE, NEMO_SIZE 
} from '@/constants/interaction';
import { MESSAGE_GROUPS } from '@/data/home/message';
import { SharedNemoHandle } from '../SharedNemo';

/**
 * 메시지 섹션 타임라인 빌더 (Rail Skeleton)
 * 기워서: 네모 박스는 틸 색상 세로형으로 고정, 텍스트가 위를 통과함.
 */
export function buildMessageTimeline(
  tl: gsap.core.Timeline,
  nemo: SharedNemoHandle,
  L: Record<string, number>
) {
  const content = nemo.contentEl;
  if (!content) return;

  // [V26.90 Rail] 박스 내 텍스트 주입 로직은 삭제 (향후 별도 레이어로 텍스트 연출 예정)
  // 현재는 박스의 상태 유지 및 스테이지 레이아웃만 정의
  
  // 메시지 세로 틸 박스 고정 상태 (이미 builders/pain.ts에서 모핑되어 넘어옴)
  tl.set(nemo.nemoEl, {
    width: NEMO_SIZE.TEAL_BOX_W,
    height: NEMO_SIZE.TEAL_BOX_H,
    backgroundColor: COLORS.BRAND,
    xPercent: -50,
    left: '50%',
    top: '19vh',
    yPercent: 0,
    borderRadius: 0,
    opacity: 1,
    border: 'none',
  }, L[STAGES.TO_MESSAGE]);

  // TODO: Step 6 작업 시, 텍스트 레이어를 별도로 생성하여 "박스 위를 통과하는" 연출 구현 예정
  // 현재는 뼈대 위치만 점유함
}
