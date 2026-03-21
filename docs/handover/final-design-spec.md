# 네모:ON 최종 인터랙션 설계서 (V4.5 Data-Driven)

본 문서는 `master-prompt.md`의 기획을 실제 코드로 구현한 **V4.5 Data-Driven Interaction** 아키텍처의 최종 기술 설계도이다.

---

## 🏗️ 1. 아키텍처 원칙 (V4.5 무결성 표준)

### ⏱️ 데이터 기반 구동 (Data-Driven Engine)
- **마스터 여정 시트 (`journey.ts`)**: 모든 섹션의 배경색, 로고 가시성, 네모 상자의 상태(크기, 좌표, 보더 등)를 중앙 데이터 시트에서 관리.
- **전역 상수화 (`interaction.ts`)**: 헤더 위치, 이징(Ease), 섹션별 스크롤 높이 등 모든 정량적 수치를 상수로 관리하여 인라인 수치 배제.
- **상태 루프 애니메이션**: `GlobalInteractionStage.tsx`는 마스터 데이터를 순회하며 타임라인을 자동으로 생성하는 '엔진' 역할만 수행.

### 🛡️ 시스템 무결성 보호 (Strict Integrity)
- **절대 변경 금지 (No-Touch Rules)**:
    1. **#home-stage 핀 구조**: 스크롤 동기화의 근간인 고정 트리거 및 핀 설정 보존.
    2. **타임라인 아키텍처**: 라벨 기반의 가중치 계산 방식 및 마스터 타임라인 생성 구조 보존.
    3. **Double-Lock 안정화**: `requestAnimationFrame`과 `ScrollTrigger.refresh()`를 통한 좌표 무결성 확보 로직 보존.

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

## 🔡 3. 로고 여정 및 네모 모핑 (Logo & Nemo Integration)

- **로고 구현 (DOM + Text)**:
  - 브랜드 폰트의 고유 아이덴티티를 유지하기 위해 **DOM 기반 렌더링**을 사용함.
  - **T-Morphing**: 'RECTANGLE' 내의 'T'는 두 개의 CSS Line으로 구성하여 '+'로의 정밀한 모핑을 구현.
  - **Fixed Proxy 전략**: 고정된 에디토리얼 앵커 위치에서 헤더 자리로 탈출하는 궤적 구현.
- **네모 모핑 (Single Object)**:
  - 히어로 [결] 박스 → 섹션 전체 배경 → 테두리 박스 → 이미지 프레임을 단일 DOM 요소로 구현.

---

## 🔄 4. State Flow (Master Journey Sequence)

| Stage | Nemo Shape | Logo State | Background |
| :--- | :--- | :--- | :--- |
| **HERO** | 초기 56px (투명) | 빅 타이틀 (네모:ON) | **ON:Cream / OFF:Dark** |
| **START_TO_PAIN** | **100vw/100vh (배경화)** | 헤더 안착 (네모) | #0D1A1F (Dark) |
| **TO_PAIN** | 카드 테두리 수축 완료 | 헤더 유지 (네모) | #0D1A1F (Dark) |
| **RESONANCE** | 중앙 채워진 박스 | RECTANGLE 등장 (T) | #0D1A1F (Dark) |
| **TO_MESSAGE** | 틸 세로 박스 | **REC+ANGLE (+)** | **#f7f1e9 (Cream)** |
| **FORWHO** | 가로 이미지 프레임 | **네모:ON 복구** | #f7f1e9 (Cream) |
| **CTA** | 뷰포트 확장 (Dark) | 헤더 유지 | #0D1A1F (Dark) |

---

---

## 📜 5. 운영 및 유지보수 주의사항 (Safety & Maintenance)

본 시스템은 정교한 GSAP 타임라인과 레이어 계층을 기반으로 하므로, 다음 사항을 무단 수정 시 전체 사용자 경험이 파괴될 수 있다.

### ⚠️ **DANGER ZONE (수정 시 극도로 주의)**
1. **z-index 레이어링**: `Header (10000)`, `Content (20)`, `Nemo (11)`, `Footer (-1)`의 계층을 무너뜨리면 푸터 리빌 및 인터랙션 순서가 모두 꼬인다.
2. **섹션 불투명도 유지**: 푸터가 중간 섹션에서 비쳐 보이거나(Ghosts) 원치 않는 타이밍에 노출되는 것을 막기 위해, 모든 섹션의 외곽 래퍼는 반드시 `style={{ backgroundColor: 'var(--bg)' }}`를 유지해야 한다.
3. **ScrollTrigger 종료 지점 (end)**: `GlobalInteractionStage`의 `end` 설정(가중치 연동 수식)을 임의의 상수로 변경 시, 스크롤바 정밀도가 깨지고 '데드 스페이스'가 대량 발생한다.
4. **GSAP 단일 엔진 원칙**: 이미 전체 스크롤이 `ScrollTrigger`에 고정되어 있으므로, 섹션 내부에서 `framer-motion`의 `useScroll` 등을 혼용하는 것을 엄격히 금지한다 (스크롤 저크 및 성능 저하 유발).
5. **데이터 시트 우선 원칙**: 모든 시각적 좌표(`left`, `top`), 크기(`width`, `height`), 색상(`bg`)은 컴포넌트 내부가 아닌 `journey.ts`와 `interaction.ts`에서만 보정한다.

---

## 📜 6. 결정 히스토리 (Decision History)

### **왜 마스터 여정 시트(Master Journey Sheet)인가?**
- **문제점**: 이전의 로직-수치 결합 방식은 미세 수정(색상, 크기) 시마다 복잡한 GSAP 타임라인 코드를 직접 건드려야 했으며, 이는 뼈대 훼손과 버그의 주범이었음.
- **해결책**: 모든 시각적 인자를 `journey.ts`로 수납하고 `GlobalInteractionStage.tsx`는 순수 엔진으로 정제함.
- **기대 효과**: 비개발자나 AI 에이전트도 데이터 시트 수정만으로 안전하고 빠르게 인터랙션을 튜닝할 수 있는 **'가장 안정적인 고도화 환경'** 구축.

---

**"본 문서는 현재 시스템의 최신의 무결성 표준(V4.5)을 반영하고 있으며, 이전의 모든 handover 문서는 본 문서로 대체된다."**
