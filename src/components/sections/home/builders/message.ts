import { gsap } from 'gsap';
import { GlobalBuilderOptions } from '../types';
export interface MessageBuilderRefs {
  standardGroups: (HTMLDivElement | null)[];
  invertedGroups: (HTMLDivElement | null)[];
}

/**
 * [V11.60 Builder] 메세지 섹션 입체 통합 시퀀스 빌더
 * 
 * 시퀀스:
 * 1. Rise (Spatial): 래퍼 동시 부상. 네모 박스(Fixed)를 통과하며 공간적 반전 발생 (BEFORE 색상 유지)
 * 2. Reveal (Temporal): 안착 후 스크롤에 따라 BEFORE -> AFTER 색상으로 선명화
 * 3. Exit (Spatial): 래퍼 동시 퇴장. 다시 네모를 통감하며 반전 유지
 */
export function buildMessageTimeline(
  tl: gsap.core.Timeline,
  L: Record<string, number>,
  refs: MessageBuilderRefs,
  options: GlobalBuilderOptions
) {
  const { STAGES } = options.registry.constants;
  const { MESSAGE_COLORS } = options.registry.data;
  
  const startTime = L[STAGES.TO_MESSAGE];
  const endTime   = L[STAGES.MSG_TO_FW];
  const totalDuration = endTime - startTime;
  
  // 3개 그룹이므로 전체 시간을 3등분
  const groupDuration = totalDuration / 3;

  refs.standardGroups.forEach((standardGroup, index) => {
    const invertedGroup = refs.invertedGroups[index];
    if (!standardGroup || !invertedGroup) return;

    const groupStart = startTime + (index * groupDuration);
    const isTouch = options.interactionMode === 'touch';
    
    // 각 그룹 내의 호흡 배분 (총합이 1.0)
    const riseTime   = groupDuration * (isTouch ? 0.20 : 0.30); 
    const revealTime = groupDuration * (isTouch ? 0.60 : 0.60); 
    const exitTime   = groupDuration * (isTouch ? 0.20 : 0.10); 

    // 래퍼 배열 (동시 이동 대상)
    const targets = [standardGroup, invertedGroup];

    // 1. Rise (공간 부상)
    // 두 레이어를 동시에 올림. 고정 마스크가 뷰포트 좌표를 유지하므로 지나가는 동안만 파란색 노출
    tl.fromTo(targets, 
      { y: '120vh', autoAlpha: 1 },
      { y: '0', duration: riseTime, ease: 'power2.out', immediateRender: true },
      groupStart
    );

    // 2. Reveal (시간 선명화)
    // 안착 후, 각 레이어의 글자들이 BEFORE에서 AFTER로 선명해짐
    const standardChars = standardGroup.querySelectorAll('.standard-char');
    const invertedChars = invertedGroup.querySelectorAll('.inverted-char');

    const revealStartTime = groupStart + riseTime + (revealTime * 0.1);

    if (standardChars.length > 0) {
      // 1) 표준 레이어 선명화
      tl.to(standardChars, {
        color: MESSAGE_COLORS.AFTER.STANDARD,
        stagger: (revealTime * 0.8) / standardChars.length,
        duration: revealTime * 0.2,
        ease: 'power1.inOut'
      }, revealStartTime);

      // 2) 반전 레이어 선명화 (동기화)
      tl.to(invertedChars, {
        color: MESSAGE_COLORS.AFTER.INVERTED,
        stagger: (revealTime * 0.8) / standardChars.length, // 기준점을 통일
        duration: revealTime * 0.2,
        ease: 'power1.inOut'
      }, revealStartTime);
    }

    // 3. Sustain (안착 유지)
    tl.to(targets, { y: '0', duration: revealTime * 0.4 }, groupStart + riseTime + (revealTime * 0.6));

    // 4. Exit (공간 퇴장)
    // 페이드 아웃 속도를 늦추고(0.8) 약간의 지연(0.1)을 주어 더 높이 올라간 뒤 사라지게 함
    tl.to(targets, {
      autoAlpha: 0,
      duration: exitTime * 0.65,
      delay: exitTime * 0.1,
      ease: 'power1.inOut'
    }, groupStart + riseTime + revealTime);

    tl.to(targets, {
      y: '-120vh',
      duration: exitTime,
      ease: 'power2.in'
    }, groupStart + riseTime + revealTime);
  });
}
