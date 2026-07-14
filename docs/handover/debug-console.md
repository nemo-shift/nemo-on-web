# DebugConsole — 모바일 실기기 디버깅 가이드

## 언제 쓰나

PC에서 `chrome://inspect` 원격 디버깅을 사용할 수 없을 때 (카카오톡 인앱, 특정 앱 내 WebView, 회사 정책으로 USB 디버깅 불가 등) 실기기 화면에서 직접 콘솔 로그를 확인해야 하는 상황.

---

## chrome://inspect 대신 쓸 수 있는 대안들

| 방법 | 조건 | 특징 |
|------|------|------|
| **DebugConsole (이 컴포넌트)** | 없음 | 화면에 오버레이로 콘솔 표시, 복사 가능 |
| `chrome://inspect` | Android + USB 디버깅 허용 | 가장 강력, 네트워크/퍼포먼스 탭 포함 |
| Safari 개발자 도구 | iOS + Mac + 설정 허용 | iOS WebView 디버깅 가능 |
| [Eruda](https://github.com/liriliri/eruda) | CDN 한 줄 | 더 풍부한 기능 (네트워크, DOM 탭 등) |
| [vConsole](https://github.com/Tencent/vConsole) | CDN 한 줄 | 텐센트 오픈소스, WeChat 계열에서 많이 씀 |

> Eruda/vConsole은 더 많은 기능이 필요할 때 고려. DebugConsole은 의존성 없이 프로젝트 내부에서 바로 쓸 수 있는 경량 버전.

---

## 파일 위치

```
src/components/ui/DebugConsole.tsx
```

---

## 활성화 방법 (nemo:on 프로젝트 기준)

**1. HomeStage.tsx에 import/마운트**

```tsx
// src/components/sections/home/HomeStage.tsx
import DebugConsole from "@/components/ui/DebugConsole";

// JSX 최상단에 추가
<div className="relative w-full overflow-x-hidden">
  <DebugConsole />
  ...
</div>
```

**2. 배포 후 실기기에서 확인**
- 홈페이지 우하단 파란 **"콘솔 (N)"** 버튼 클릭 → 오버레이 열림
- **전체 복사** 버튼 → 클립보드에 전체 로그 복사 → 카카오톡/메모장에 붙여넣기

**3. 진단 완료 후 비활성화**

```tsx
// import 줄과 <DebugConsole /> 한 줄만 제거하면 됨
```

---

## 기능

- `console.log` / `console.warn` / `console.error` 전부 인터셉트
- 로그 색상 구분: 일반(흰색) / WARN(노란색) / ERR(빨간색)
- **전체 복사** — 클립보드 API 미지원 시 `execCommand` 폴백 자동 적용
- **지우기** — 누적 로그 초기화
- 새 로그 추가 시 자동 스크롤
- 컴포넌트 언마운트 시 `console` 원복 (cleanup 보장)

---

## 다른 프로젝트에서 재사용

의존성이 없어 (Tailwind 미사용, 인라인 스타일) **Next.js + React 프로젝트라면 파일 하나만 복사해서 바로 사용 가능**.

```
복사할 파일: src/components/ui/DebugConsole.tsx
```

원하는 페이지/레이아웃 컴포넌트에 import 후 JSX에 `<DebugConsole />`만 추가하면 끝.

---

## 주의사항

- 배포 환경에서도 버튼이 보임 — **진단 완료 후 반드시 제거**
- `console` 전역 패치 방식이므로 동일 페이지에 두 개 마운트하면 중복 인터셉트 발생 → 항상 하나만 마운트
- 로그가 매우 많이 쌓이면 성능 저하 가능 — 장시간 방치 금지
