import React, { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ABOUT_MEANING_DATA } from "@/data/about";
import { ABOUT_STAGE_STYLES } from "../AboutStage.styles";
import { ABOUT_SCROLL_MULTIPLIERS } from "@/constants/sub-interaction";
import { renderParagraph } from "@/lib/renderParagraph";

gsap.registerPlugin(ScrollTrigger);

export default function AboutMeaning() {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLSpanElement>(null);
  const borderRef = useRef<HTMLDivElement>(null);
  const phase1Ref = useRef<HTMLDivElement>(null);
  const phase2Ref = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);

  // [Zero-Gap Sync] 스크롤 여유 및 관성 방어를 위한 가중치 배율 (상수 파일 sub-interaction.ts 연동)
  const scrollMultiplier = ABOUT_SCROLL_MULTIPLIERS.MEANING;

  useGSAP(
    () => {
      if (
        !containerRef.current ||
        !titleRef.current ||
        !borderRef.current ||
        !phase1Ref.current ||
        !phase2Ref.current ||
        !labelRef.current
      )
        return;

      // 본문 콘텐츠 및 메타 라벨 초기 은폐 (오직 거대 타이틀 + 네모 테두리만 선명하게 보이도록 방어)
      gsap.set(phase1Ref.current, { opacity: 0, y: 30, x: 0 });
      gsap.set(phase2Ref.current, { opacity: 0, y: 0, x: -40 });
      gsap.set(labelRef.current, { opacity: 0, y: 20 });
      gsap.set(".meaning-triad-chip", { opacity: 0, y: 12 });
      gsap.set(borderRef.current, { opacity: 0, scale: 0.92 }); // 네모 테두리 초기 은폐

      const tl = gsap.timeline({
        scrollTrigger: {
          id: "about-meaning-trigger",
          refreshPriority: 3, // 🔗 [체인 링크] 철학이 먼저 계산된 뒤 계산되도록 우선순위 배정
          trigger: containerRef.current,
          start: "top top",
          // [Zero-Gap Sync] 섹션의 물리적 높이 동안 완벽하게 핀 고정 유지 (Promise가 100% 덮을 때까지)
          end: () => `+=${containerRef.current!.offsetHeight}`,
          scrub: true,
          pin: true,
          pinSpacing: false, // 다음 섹션 카드가 위로 덮어씌울 수 있도록 spacing 비활성화
        },
      });

      // 0. 네모 테두리: 타이틀과 함께 등장 (scale-up + fade-in)
      tl.to(
        borderRef.current,
        {
          opacity: 1,
          scale: 1,
          duration: 0.15,
          ease: "power2.out",
        },
        0,
      );

      // 1. 거대 타이틀 + 네모 테두리: 0%에서 20% 지점까지 함께 흐려짐
      tl.to(
        titleRef.current,
        {
          color: "#ffffff",
          opacity: 0.3,
          duration: 0.2,
          ease: "none",
        },
        0,
      );

      tl.to(
        borderRef.current,
        {
          borderColor: "rgba(255, 255, 255, 0.35)",
          duration: 0.2,
          ease: "none",
        },
        0,
      );

      // 2. Phase 1 콘텐츠 및 메타 라벨 동시 등장: 20% 지점까지 빠르게 등장 완료 (지속시간 0.1)
      tl.to(
        phase1Ref.current,
        {
          opacity: 1,
          y: 0,
          duration: 0.1,
          ease: "power2.out",
        },
        0.1,
      );

      tl.to(
        labelRef.current,
        {
          opacity: 1,
          y: 0,
          duration: 0.1,
          ease: "power2.out",
        },
        0.1,
      ); // 라벨도 10% 지점 싱크!

      // 3. [Phase 1 정독 구간] 20%부터 42% 지점까지 완전 고정 유지 (지속시간 0.22)
      tl.to({}, { duration: 0.22 }, 0.2);

      // 4. [가로 순차 스왑 모션] 42%~49% 1번 퇴장 ➔ 49%~53% 비움 ➔ 53%~60% 2번 안착 (x축 시차 겹침 방어)
      tl.to(
        phase1Ref.current,
        {
          opacity: 0,
          x: -40,
          duration: 0.07,
          ease: "power2.in",
        },
        0.42,
      );

      tl.to(
        phase2Ref.current,
        {
          opacity: 1,
          x: 0,
          duration: 0.07,
          ease: "power2.out",
        },
        0.53,
      ); // 1번이 사라진 후 빈 공간 대기하다가 58% 지점부터 2번이 진입 시작

      // Triad 칩 개별 stagger (phase2 블록 진입 직후)
      tl.to(
        ".meaning-triad-chip",
        {
          opacity: 1,
          y: 0,
          duration: 0.06,
          stagger: 0.05,
          ease: "power2.out",
        },
        0.56,
      );

      // 5. [Phase 2 정독 구간 극대화] 60%부터 98% 지점까지 스크롤 내리는 내내 완전 고정 (지속시간 0.38)
      tl.to({}, { duration: 0.38 }, 0.6); // 30% 휠 거리에 달하는 넓은 정독 존 확보!

      // 6. [오버레이 지연 마감 대기] 98%부터 100% 지점까지 비로소 다음 카드를 위해 대기 (지속시간 0.02)
      tl.to({}, { duration: 0.02 }, 0.98);

      // [Perfect Stacking Sync] 모든 섹션이 성공적으로 조율된 후 좌표계를 1회 정밀 측정합니다.
      requestAnimationFrame(() => {
        ScrollTrigger.refresh();
      });
    },
    { scope: containerRef },
  );

  return (
    <section
      ref={containerRef}
      id="about-meaning"
      className="relative w-full bg-[#f7f1e9] z-20 overflow-hidden"
      style={{ height: `${scrollMultiplier * 100}vh` }}
    >
      {/* 100vh 풀스크린 뷰포트 영역 (pin 대상) */}
      <div className="w-full h-screen flex flex-col items-center justify-center relative">
        {/* 큰 네모 테두리 — 콘텐츠를 감싸는 프레임 */}
        <div
          ref={borderRef}
          className="absolute inset-x-8 top-[30%] bottom-12 tablet-p:inset-x-16 tablet-p:top-[38%] tablet-p:bottom-16 tablet:inset-x-24 tablet:bottom-20 desktop-wide:bottom-24 border-[3px] border-[#0d1a1f] z-[1] pointer-events-none"
        />

        {/* 거대 배경 타이틀 (선명한 검은색에서 시작) */}
        <span
          ref={titleRef}
          className={`absolute font-dm font-black uppercase text-[#0d1a1f] select-none leading-[0.9] z-0 text-left tablet-p:text-center tablet:text-left top-[58%] tablet-p:top-[50%] left-[12px] tablet-p:left-[80px] ${ABOUT_STAGE_STYLES.meaning.bgTitle.size} ${ABOUT_STAGE_STYLES.meaning.bgTitle.tracking}`}
          style={{
            transform: "rotate(-90deg) translateX(-50%)",
            transformOrigin: "top left",
          }}
        >
          The
          <br />
          Architecture
          <br />
          of Name
        </span>

        {/* 전면 본문 콘텐츠 레이어 */}
        <div
          className={`relative z-10 ml-12 mr-auto tablet-p:mx-auto px-6 text-center text-[#0d1a1f] ${ABOUT_STAGE_STYLES.meaning.content.maxWidth} ${ABOUT_STAGE_STYLES.meaning.content.yOffset}`}
        >
          {/* 메타 라벨 (상시 고정 및 정밀 세로 정렬선 확보) */}
          <div
            ref={labelRef}
            className={`relative mx-auto flex flex-col text-left mb-6 tablet:mb-8 ${ABOUT_STAGE_STYLES.meaning.content.maxWidth} ${ABOUT_STAGE_STYLES.meaning.content.labelPaddingLeft}`}
          >
            <span className="text-xs tablet:text-sm font-semibold tracking-[0.2em] uppercase text-cyan-600">
              03 / REC+ANGLE
            </span>
          </div>

          {/* [grid 듀얼 레이어] 래퍼 높이 = max(phase1, phase2) 자동 결정 */}
          <div className="grid w-full justify-items-center">
            {/* Phase 1 Box */}
            <div
              ref={phase1Ref}
              style={{ gridArea: "1/1" }}
              className={`flex flex-col text-left ${ABOUT_STAGE_STYLES.meaning.content.maxWidth} ${ABOUT_STAGE_STYLES.meaning.content.paddingLeft} ${ABOUT_STAGE_STYLES.meaning.content.gap}`}
            >
              {ABOUT_MEANING_DATA.phase1.map((p, idx) => (
                <p
                  key={idx}
                  className={`font-suit font-light whitespace-pre-line text-[#0d1a1f]/90 ${ABOUT_STAGE_STYLES.meaning.content.fontSize} ${ABOUT_STAGE_STYLES.meaning.content.leading}`}
                >
                  {renderParagraph(p)}
                </p>
              ))}
            </div>

            {/* Phase 2 Box */}
            <div
              ref={phase2Ref}
              style={{ gridArea: "1/1" }}
              className={`flex flex-col text-left ${ABOUT_STAGE_STYLES.meaning.content.maxWidth} ${ABOUT_STAGE_STYLES.meaning.content.paddingLeft} ${ABOUT_STAGE_STYLES.meaning.content.gap}`}
            >
              <p
                className={`font-suit font-normal whitespace-pre-line text-[#0d1a1f] ${ABOUT_STAGE_STYLES.meaning.content.fontSize} ${ABOUT_STAGE_STYLES.meaning.content.leading}`}
              >
                {ABOUT_MEANING_DATA.phase2Intro}
              </p>

              {/* REC / Angle / + 삼분할 — 가로 카드형 (모바일은 세로 스택) */}
              <div className="flex flex-col tablet:flex-row gap-4 tablet:gap-6 my-2">
                {ABOUT_MEANING_DATA.phase2Triad.map((item, idx) => (
                  <div
                    key={idx}
                    className="meaning-triad-chip flex flex-col gap-1 border-l-2 border-cyan-500/40 pl-4 tablet:pl-0 tablet:border-l-0 tablet:border-t-2 tablet:pt-3"
                  >
                    <span className="font-suit font-bold text-[#0d1a1f] text-2xl tablet:text-3xl">
                      {item.label}
                    </span>
                    <span className="font-suit font-light text-[#0d1a1f]/70 text-sm tablet:text-base">
                      {item.desc}
                    </span>
                  </div>
                ))}
              </div>

              {ABOUT_MEANING_DATA.phase2Outro.map((p, idx) => (
                <p
                  key={idx}
                  className={`font-suit font-normal whitespace-pre-line text-[#0d1a1f] ${ABOUT_STAGE_STYLES.meaning.content.fontSize} ${ABOUT_STAGE_STYLES.meaning.content.leading}`}
                >
                  {renderParagraph(p)}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
