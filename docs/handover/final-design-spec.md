# 네모:ON 최종 인터랙션 설계서 (V4.3 Final Spec)

본 문서는 `master-prompt.md`의 기획을 실제 코드로 구현한 **V4.3 Strict Whole-Pin & Manual Scroll** 아키텍처의 최종 기술 설계도이다. 내일 이후 모든 구현의 **유일한 기술적 기준**이 된다.

---

## 🏗️ 1. 아키텍처 원칙 (V4.3 무결성 표준)

### ⏱️ 전역 동기화 (Strict Whole-Pin & Manual Scroll)
- **전체 핀(Whole-Pin)**: 스크롤 핸드오버의 픽셀 단위 정밀도를 위해 `#home-stage` 전체에 `pin: true`를 적용.
- **Manual Scroll Engine (V4.3 Core)**: 전체 핀 상태에서는 네이티브 스크롤이 발생하지 않으므로, 타임라인 레이블에 맞춰 섹션 콘텐츠 래퍼(`#sections-content-wrapper`)를 **Y축으로 직접 밀어 올림**으로써 물리적 스테이지 전환을 구현함.
- **Double-Lock 보호**:
  1. `requestAnimationFrame` 지연 초기화로 핀 생성 시점 보호.
  2. 스크롤 잠금 해제 0.1초 후 `ScrollTrigger.refresh()` 강제 실행으로 레이아웃 좌표 무결성 확보.

### 📂 컴포넌트 생명주기 (Always-in-DOM)
- **DOM Stability**: 모든 섹션은 초기 로드 시 DOM에 생성됨.
- **Visibility Control**: `isOn` 상태에 따라 `opacity`와 `visibility`로만 노출을 제어하여 ScrollTrigger 좌표계의 정적성을 유지함.

---

## 🏛️ 2. 레이어 시스템 (Z-index)

| 계층 | 대상 | Z-index | 역할 |
| :--- | :--- | :--- | :--- |
| **LV 5** | `JourneyLogo` | **10001** | 브랜드 정체성 (항상 최상위) |
| **LV 4** | 스크롤 힌트 | 1000 | 유저 가이드 |
| **LV 3** | 전역 헤더 | 50 | 햄버거 메뉴 및 내비게이션 |
| **LV 2** | 섹션 콘텐츠 | **20** | 본문 텍스트 (박스보다 위에 위치) |
| **LV 1** | `SharedNemo` | **11** | 모핑 네모 오브젝트 (배경 위, 콘텐츠 아래) |
| **LV 0** | 배경 레이어 | 0 | 인터폴레이션 배경색 |

---

## 🔡 3. 로고 여정 (Logo Journey & Morphing)

- **스펠링 구조**: **`REC` + `T` (모핑 대상) + `ANGLE`**
- **모핑 기획**: `RECTANGLE`의 **'T'**가 **'+'** 기호로 교차 페이드되며 변형됨.
- **상징성**: 전환(T)이 연결과 확장(+)으로 변화하는 브랜드 언어를 시각적으로 구현.

---

## 🔄 4. State Flow (단계별 정의)

| Progress | Section Y-Offset | Background | Nemo & Logo State |
| :--- | :--- | :--- | :--- |
| **HERO** | `0` | #0a0a0a | 빅 타이틀 & 결 박스 |
| **PAIN** | `-100vh` | #0D1A1F (Dark) | 뷰포트 확장 후 카드 수축 |
| **MESSAGE** | `-1100vh` | #0891b2 (Teal) | 세로 틸 박스 & T->+ 모핑 |
| **FORWHO** | `-1900vh` | #faf7f2 (Cream) | 가로 이미지 프레임 |
| **STORY** | `-2900vh` | #faf7f2 (Cream) | 브랜드 스토리 텍스트 |
| **CTA** | `-3000vh` | #0D1A1F (Dark) | 최종 행동 유도 |

---

## 🛠️ 5. 기술 스택 및 라이브러리 연동
- **GSAP + ScrollTrigger**: 애니메이션 및 스크롤 핸들링 핵심 엔진.
- **V4.3 Scroll Engine**: `buildSectionScrollTimeline`을 통한 수동 배경 제어 로직.
- **Matter.js**: `FallingKeywordsStage` 물리 엔진 담당.

---

**"본 문서는 현재 시스템의 최신 무결성 표준(V4.3)을 반영하고 있으며, 이전의 모든 handover 문서는 본 문서로 대체된다."**
