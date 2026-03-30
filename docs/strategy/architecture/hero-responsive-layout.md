# 히어로 섹션 반응형 레이아웃 — 설계 의도 및 구현 현황

납작한 화면 대응 — 전체 현황 정리

1. 기획 의도
   어떤 해상도에서도 히어로 섹션의 콘텐츠가 겹치거나 잘리지 않아야 한다. 특히 가로는 넓지만 세로가 낮은 화면(예: 1440×700 노트북, 가로 모드 태블릿)에서 로고가 슬로건을 덮거나 토글 버튼이 잘리는 현상을 방지하는 것이 목표다.
   이를 위해 두 개의 축을 분리하여 제어하는 구조를 설계하였다.
   축기준동작가로 (vw)화면 너비화면이 넓어지면 요소가 함께 커진다세로 (vh)화면 높이화면이 낮아지면 세로 기준으로 제동을 건다
   두 축을 동시에 감지하는 min(vw, vh) 수식이 핵심이다. 어느 축이 먼저 임계점에 도달하든 그 기준으로 크기를 제한한다.
   css/_ 적용 예시 _/
   font-size: clamp(최솟값, min(8.35vw, 25vh), 최댓값);

2. 실현된 것
   2-1. 로고 도형 크기 엔진 (globals.css — .nemo-logo-engine)
   scale 기반에서 font-size 기반으로 전환 완료.
   전환 이유: scale 속성은 순수 숫자만 허용하여 min(vw, vh) 단위 혼합 수식을 적용할 수 없었다. font-size로 기준 체급을 정의하고 도형이 em 단위로 연동되는 구조로 변경하였다.

관련 문서: logo_engine.md — Final Spec은 scale 기반이나 V11 이후 font-size 기반으로 변경됨. 해당 문서 상단 업데이트 노트 참조.

현재 브레이크포인트별 수치:
구간브레이크포인트--nemo-size상태Mobile< 744px28px확정Tablet-P744px~35px확정Tablet-M992px~42px확정Desktop-Wide1440px~63px작업 중Desktop-Cap1920px~55px미완 (역전 상태)
2-2. 히어로 뷰 물리적 격리
HeroPCView / HeroTabletView / HeroMobileView 분리 완료. 각 구간이 독립적인 수치를 가지므로 납작한 화면 대응 수치를 구간별로 독립 제어할 수 있는 구조가 확보되었다.
2-3. HeroSloganOff PC 구간 이중 제동 적용
cssfont-size: clamp(1.4rem, min(1.7vw, 3vh), 2.1rem);

```

`min(vw, vh)` 이중 제동 수식 적용 완료.

---

## 3. 미완성 항목

### 3-1. 로고 수치 전 구간 미확정

1440px 구간을 기준으로 먼저 잡았으며 나머지 구간은 작업 중이다. Desktop-Cap(1920px) 수치가 Desktop-Wide(1440px)보다 작은 역전 상태는 작업 미완성으로 인한 것이며, 전 구간 확정 시 해소된다.

검증 순서:
```

PC: 992px → 1280px → 1440px → 1920px
Mobile: 375px → 430px
Tablet-P: 744px → 991px
납작한 화면: 1440×700
3-2. 히어로 레이아웃 수치 — 고정값 유지 중
HeroPCView의 상단 스페이서 및 중앙 영역이 vh 고정값으로 유지되고 있다.
typescriptminHeight: isOn ? '20vh' : '12vh' // 상단 스페이서
minHeight: '60vh' // 중앙 인터랙션 영역
고정값을 유지한 이유: 로고 엔진 교체(scale → font-size) 작업 중 부모 컨테이너까지 유동적이면 디버깅 기준점이 흔들리기 때문에 의도적으로 고정 운동장을 유지하였다. 로고 수치 전 구간 확정 후 clamp() 유동값으로 전환 예정이다.
3-3. HeroOffCta PC 구간 고정값
typescriptfontSize: isMobile ? '2.4rem' : isTablet ? '5.2rem' : '6rem'

```

PC 구간이 단일 고정값이다. 히어로 디테일 수치 작업 시 `clamp()` + `min(vw, vh)` 적용 예정.

---

## 4. 작업 순서
```

[현재] 1. 로고 수치 전 구간 확정
PC: 991px / 1280px / 1440px / 1920px
Mobile: 375px / 430px
Tablet-P: 744px / 991px

       2. 납작한 화면 검증
          1440×700 기준 콘텐츠 겹침 여부 확인

       3. 히어로 레이아웃 유동화
          상단 스페이서 및 중앙 영역 clamp() 전환
          HeroOffCta PC 구간 clamp() + min(vw, vh) 적용

       4. 히어로 → Pain 전환 디테일
