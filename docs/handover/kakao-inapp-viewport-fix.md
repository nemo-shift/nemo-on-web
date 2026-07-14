# 카카오톡 인앱 브라우저 뷰포트 버그 진단 및 수정 이력

## 배경

V67.ViewportFix에서 홈 스크롤 기하학을 `vh` → `svh`로 전환한 뒤,
카카오톡 인앱 브라우저에서 콘텐츠가 안 보이는 문제가 발생했다.

초기 원인은 카카오 WebView가 `svh`/`lvh` 단위를 아예 모르는 것으로 파악,
V68에서 CSS `@supports not (height: 100svh)` 폴백으로 1차 대응했다.
→ `docs/troubleshooting/claude-code-prompt-svh-legacy-webview-fallback.md` 참고

그러나 이후 실기기 진단 로그로 **추가 원인**이 확인됐다.

---

## 실기기 진단으로 확인된 추가 원인

카카오 WebView는 `svh`를 지원하긴 하지만 **스펙과 다르게 동작**한다.

- 일반 모바일 브라우저(Safari/Chrome): `svh` = 고정값 (컨트롤 바 상태 무관)
- 카카오 인앱 WebView: `svh` = `lvh`처럼 동작 — 컨트롤 바가 접히거나 펼쳐질 때마다 실시간으로 변함

결과: GSAP ScrollTrigger는 빌드 시점의 `svh` 픽셀값으로 좌표를 고정하는데,
스크롤 도중 컨트롤 바가 움직이면 실제 뷰포트와 ScrollTrigger 내부 좌표가 어긋나
콘텐츠가 보이지 않게 된다.

### 진단 방법

실기기에서 `chrome://inspect` 사용 불가 환경이었으므로 두 단계로 로그를 찍었다.

**1단계** — 로드 시점 스냅샷 (GlobalInteractionStage.tsx 내 runMeasurementAndBuild):
- UA 문자열, CSS dvh/svh/lvh 지원 여부
- `fonts.ready` 소요 시간 (3초 타임아웃)
- `getStableVH()` / `getStableLVH()` 실측값
- 섹션별 offsetHeight, finalY

**2단계** — visualViewport 변화 실시간 추적 (별도 useEffect):
- `visualViewport.resize` 이벤트마다 `getStableVH()` / `getStableLVH()` 재측정
- 임계값 없이 전량 기록, 타임스탬프 포함
- 확인 결과: 컨트롤 바 토글 시 svh 값이 실시간으로 변하는 것 확정

로그 확인 도구: `DebugConsole.tsx` (화면 내 콘솔 오버레이, 전체 복사 기능)
→ `docs/handover/debug-console.md` 참고

---

## 수정 내용

**파일**: `src/components/sections/home/GlobalInteractionStage.tsx`

### 핵심 변경

기존 visualViewport 리사이즈 핸들러는 터치 기기 전체를 차단하고 있었다:
```ts
if (interactionMode === 'touch') return;
```

카카오 인앱만 예외적으로 허용하도록 조건 수정:
```ts
if (interactionMode === 'touch' && !isKakaoRef.current) return;
```

`isKakaoRef`는 마운트 시 한 번만 UA를 확인해서 저장:
```ts
const isKakaoRef = useRef(false);
useEffect(() => {
  isKakaoRef.current = navigator.userAgent.includes('KAKAOTALK');
}, []);
```

### 유지된 기존 로직

- 디바운스 300ms — 실기기 로그 기준 컨트롤 바 1회 토글이 300ms 이내에 끝남
- 임계값 50px — 컨트롤 바 높이 변화가 이 범위 내에 있음
- `progress <= 0.9` 가드 — 타임라인 끝(푸터 근처)에서 refresh 시 점프 방지

### 일반 모바일 영향 없음

`isKakaoRef.current`가 false인 일반 Safari/Chrome 터치 기기는
기존과 완전히 동일하게 핸들러가 즉시 종료된다.

---

## 다른 인앱 브라우저에서 같은 문제 발생 시

Instagram, 네이버, 라인 등 다른 인앱 브라우저에서 동일 증상이 나타날 경우:

1. **DebugConsole 활성화** (`docs/handover/debug-console.md` 참고)
2. **진단 로그 추가** — 위 1단계/2단계 방식 그대로 재사용
3. **UA 감지 조건 확장**:
```ts
// GlobalInteractionStage.tsx — isKakaoRef 초기화 부분
isKakaoRef.current = (
  navigator.userAgent.includes('KAKAOTALK') ||
  navigator.userAgent.includes('Instagram') ||
  navigator.userAgent.includes('NAVER')
  // 필요한 인앱 UA 추가
);
```
4. `isKakaoRef` → `isProblematicInAppRef` 등으로 이름 변경 권장

> **주의**: 인앱 UA 문자열은 앱 업데이트로 변경될 수 있으므로, 실기기 로그로 먼저 UA를 확인하고 추가할 것.

---

## 관련 파일 및 문서

| 항목 | 경로 |
|------|------|
| 수정 파일 | `src/components/sections/home/GlobalInteractionStage.tsx` |
| CSS 폴백 (V68) | `src/app/globals.css` — `[V68.LegacyWebViewFallback]` 블록 |
| 카카오 배너 | `src/components/layout/KakaoTalkBanner.tsx` |
| svh 폴백 배경 | `docs/troubleshooting/claude-code-prompt-svh-legacy-webview-fallback.md` |
| vh→svh 전환 배경 | `docs/troubleshooting/claude-code-prompt-mobile-viewport-fix.md` |
| 디버그 콘솔 사용법 | `docs/handover/debug-console.md` |
