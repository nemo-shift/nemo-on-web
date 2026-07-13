# Footer Reveal 가시성 문제

> **발생 시점**: 2026-07 (About 페이지 리디자인 과정)
> **상태**: 원인 파악 + 대응 방법 정리 완료. 근본 원인은 미확정.

---

## 증상

서브페이지(About, Offerings 등)에서 스크롤 최하단까지 내려도 **고정 Footer가 보이지 않거나**, 보이더라도 **중간 스크롤 위치에서 Footer가 비쳐 보이는** 두 가지 상반된 문제가 교대로 발생.

---

## 아키텍처 배경

```
<main>              ← 일반 플로우
  <div id="about-stage" class="relative z-[1]">   ← 스태킹 컨텍스트
    <div class="bg-[#f7f1e9]">                     ← 콘텐츠 wrapper (안전 배경)
      <AboutHero />
      <div id="about-sections-wrapper" style="z-index: Z_CONTENT">
        <Philosophy />  ← z-10, 핀
        <FoundersNote /> ← z-15, 자유스크롤
        <Meaning />      ← z-20, 핀
        <Principles />   ← z-25, 자유스크롤
        <Promise />      ← z-30, 핀, pinSpacing: true
      </div>
    </div>
  </div>
</main>

<FooterRevealSpacer />  ← main 밖, pointer-events-none
<footer class="fixed bottom-0 z-0" />  ← 고정 위치
```

- Footer는 `fixed bottom-0 z-0`으로 화면 하단 고정
- 서브페이지 Stage는 `z-[1]`로 Footer 위를 덮음
- 스크롤이 콘텐츠 끝을 지나면 Stage가 위로 빠져나가며 Footer가 드러남 (Reveal 패턴)
- `FooterRevealSpacer`가 Footer 높이만큼 여백을 확보하여 스크롤 가능 범위 보장

---

## 문제 1: Footer가 아예 안 보임

### 원인

콘텐츠 wrapper의 **불투명 배경색**(`bg-[#f7f1e9]`)이 `z-[1]` 스태킹 컨텍스트 안에서 Footer(`z-0`)를 완전히 가림. 핀 고정 섹션의 `pinSpacing`이 만드는 pin-spacer 높이와 결합하여, 스크롤 최하단에서도 wrapper 배경이 Footer를 덮는 상태.

### 시도한 접근

| 접근 | 결과 |
|------|------|
| Promise `pinSpacing: false` | 효과 없음. pin duration = offsetHeight일 때 pin-spacer 높이 동일 |
| wrapper `bg-[#f7f1e9]` 제거 | Footer 보임. 그러나 **문제 2** 발생 |
| 스크롤 승수 조정 | 합산값 ~9.1 이상에서 Footer 거의 안 보임 (임계점 존재 추정) |

### 현재 대응

- wrapper `bg-[#f7f1e9]` **유지** (문제 2 방지가 우선)
- 스크롤 승수를 적정 범위 내로 유지 (현재: PHILOSOPHY=4.5, MEANING=4.6, PROMISE=1.8)
- Footer 가시성은 승수 총합으로 간접 제어

---

## 문제 2: 스크롤 중간에 Footer가 비쳐 보임

### 원인

wrapper 배경을 제거하면, **섹션 사이 미세한 틈**(핀 전환 시점, 자유스크롤 섹션 사이 1px 서브픽셀 갭)에서 고정 Footer가 스크롤 중간에 비침.

### 현재 대응

- wrapper에 `bg-[#f7f1e9]` (크림 배경) 유지 → 틈에서 비치는 것을 차단
- 이 배경은 각 섹션 사이의 "안전장치" 역할
- **절대 제거 금지** — 제거하면 Footer 비침 재발

---

## 스크롤 승수와 Footer 가시성 관계

```
총 핀 스크롤 거리 = Σ(승수 × 100vh)
Footer 가시 조건 = 총 페이지 높이 > 총 핀 스크롤 거리 + Footer 높이
```

- 승수를 높이면 핀 구간이 길어져 콘텐츠 읽기 시간은 확보되나, Footer 노출 여유가 줄어듦
- 합산 ~9.1 이상에서 Footer가 거의 보이지 않는 임계점 관찰됨 (정확한 공식 미확정)
- `FooterRevealSpacer`가 Footer 높이만큼 보정하지만, 핀 섹션의 `pinSpacing`과 상호작용하여 완벽하지 않을 수 있음

---

## 디버깅 체크리스트

Footer가 안 보일 때 확인할 순서:

1. **wrapper 배경 확인**: `bg-[#f7f1e9]` 존재 여부 (있어야 함)
2. **스크롤 승수 확인**: `sub-interaction.ts`에서 합산값 ~9.0 이하인지
3. **`FooterRevealSpacer` 렌더 확인**: 서브페이지에서 null 반환하지 않는지
4. **콘솔에서 높이 비교**:
   ```js
   console.log('scrollHeight:', document.body.scrollHeight);
   console.log('innerHeight:', window.innerHeight);
   console.log('maxScroll:', document.body.scrollHeight - window.innerHeight);
   // maxScroll 위치에서 Footer가 보여야 함
   ```
5. **`window.scrollTo(0, document.body.scrollHeight)`로 강제 이동** → Footer 보이는지 확인

---

## 핵심 원칙

> **wrapper 배경(`bg-[#f7f1e9]`)은 유지하되, 스크롤 승수는 적정 범위 내로 관리한다.**
> 두 문제는 상충 관계이므로 균형점을 찾는 것이 핵심.

---

## 관련 파일

| 파일 | 역할 |
|------|------|
| `src/components/sections/about/AboutStage.tsx` | wrapper 배경, z-[1] 스태킹 |
| `src/components/sections/offerings/OfferingsStage.tsx` | 동일 패턴 |
| `src/constants/sub-interaction.ts` | 스크롤 승수 값 |
| `src/components/layout/Footer.tsx` | fixed z-0, 높이 측정 |
| `src/components/layout/FooterRevealSpacer.tsx` | 스크롤 여백 보정 |
