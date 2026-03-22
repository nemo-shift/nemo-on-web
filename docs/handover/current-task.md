## [최신] 🚀 2026-03-22: 데이터 기반 콘텐츠 주입 및 서브 페이지 확장

V16.10 아키텍처 정비가 완료되었습니다. 이제 기획서(`docs/content`)의 데이터를 코드(`src/data`)로 완전 동기화하고, 실제 화면에 콘텐츠를 주입합니다.

### [/] 1. 데이터 시트 동기화 (Data Sync)
- **Home Completion**: 브랜드 스토리, 브랜드 진단 섹션 데이터 추가.
- **Sub-pages Seed**: About, Offerings, Diagnosis 페이지용 데이터 시트 구축.

### [ ] 2. 섹션별 콘텐츠 '빌딩' (Building via Builders)
- **Story & Diagnosis**: 신규 구축된 데이터를 기반으로 타임라인 시퀀스 조립.
- **Visual Rhythm**: 전이 구간의 이징(Easing) 및 리듬감 튜닝.

### [ ] 3. 사이드바 메뉴 (Side Menu) 구현
- **Push Layout Implementation**: 메뉴 오픈 시 메인 콘텐츠가 좌측으로 밀려나는 애니메이션 구현.

> **작업 시작 프롬프트 (V16.10)**: 
> "V11 프로토콜과 GSAP 단일 엔진 원칙을 절대 사수해라. `.agent/rules`를 최우선으로 참조하고, 홈 스크롤 가드 로직을 존중해라."

---

## 🚀 2026-03-20: 마스터 데이터 시트 기반의 콘텐츠 주입 및 영점 조절

V4.6 데이터 기반 단일 엔진 체계가 구축되었습니다. 이제 복잡한 코드를 건드리지 않고 `journey.ts`와 `interaction.ts`의 수치를 보정합니다.

### [ ] 1. 푸터 리빌 '영점 조절' (Fine-tuning)
- **Scroll Sync**: `interaction.ts` 수치 보정으로 스크롤바와 푸터 노출 시점 일치.
- **Visual Threshold**: CTA 섹션 25vh 유동성 확보 확인.

### [ ] 2. 사이드바 메뉴 (Side Menu) 구현
- **Push Layout**: 메뉴 오픈 시 메인 콘텐츠가 밀려나는 애니메이션.

### [ ] 3. 실 서비스 콘텐츠 주입 및 전이 리듬 튜닝
- 모든 섹션 내 애니메이션은 **GSAP(`useGSAP`)** 단일 엔진 원칙 고수.
