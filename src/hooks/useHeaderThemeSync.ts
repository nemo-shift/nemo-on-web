import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * 다크 배경 섹션 진입 시 헤더 테마를 'light'로 전환하는 ScrollTrigger를 생성합니다.
 * 섹션을 벗어나면 자동으로 해제됩니다.
 *
 * @param sectionRef - 다크 배경 섹션의 ref
 * @param start - ScrollTrigger start (기본: 'top 60%')
 * @param end - ScrollTrigger end (기본: 'bottom 40%')
 */
export function useHeaderThemeSync(
  sectionRef: React.RefObject<HTMLElement | null>,
  start = 'top 60%',
  end = 'bottom 40%',
) {
  useEffect(() => {
    if (!sectionRef.current) return;

    const trigger = ScrollTrigger.create({
      trigger: sectionRef.current,
      start,
      end,
      onEnter: () => { document.body.dataset.headerTheme = 'light'; },
      onLeave: () => { delete document.body.dataset.headerTheme; },
      onEnterBack: () => { document.body.dataset.headerTheme = 'light'; },
      onLeaveBack: () => { delete document.body.dataset.headerTheme; },
    });

    return () => { trigger.kill(); };
  }, [sectionRef, start, end]);
}
