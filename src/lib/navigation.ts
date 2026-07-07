/**
 * [V74.ScrollGuidance/STEP7] 명시적 페이지 이동 플래그 유틸리티.
 * SideMenu, CTASection 등 router.push를 직접 호출하는 모든 지점에서 공용으로 사용한다.
 * LenisScrollRestoration이 이 플래그를 감지해 이전 스크롤 위치 복원 대신 최상단 이동을 수행한다.
 */
export function markPushNav(): void {
  try { sessionStorage.setItem('PUSH_NAV', '1'); } catch { /* ignore */ }
}
