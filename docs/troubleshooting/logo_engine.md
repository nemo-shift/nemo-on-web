# [Master Playbook] 히어로 로고 반응형 엔진 트러블슈팅 (V11)

본 문서는 히어로 로고의 반응형 유동안 물리 엔진 구축 중 발생한 기술적 난제들을 **[현상 - 진단 - 해결]** 체계로 정리한 실전 공략집입니다. 동일 현상 발생 시 가장 빠른 경로로 조치하기 위한 지침서입니다.

---

## 🛠️ Case 01. 전역 CSS 속성 증발 (Parser Stripping)

### **[현상]**
- `globals.css`에 직접 작성한 CSS 속성(scale, transform 등)이 브라우저에서 무시되거나 빈 블록(`.className { }`)으로 조회됨.

### **[진단 (Audit Tool)]**
- 개발자 도구 콘솔에서 아래 코드로 실제 로드된 스타일 규칙을 확인:
  ```javascript
  [...document.styleSheets].flatMap(s => { try { return [...s.cssRules] } catch(e) { return [] } })
    .filter(r => r.cssText.includes('nemo-logo-engine'))
  ```

### **[원인]**
- **Tailwind v4 Parser 가드**: 괄호 내부의 **공백(Space)**을 문법 오류로 인지하여 속성 전체를 삭제함. (예: `calc(1 + 1)`은 삭제되지만 `calc(1+1)`은 통과)

### **[해결 (Resolution)]**
- **CSS 변수 캡슐화**: 수식을 속성에 직접 쓰지 않고 `--var: calc(...)`에 담아 전달. 테일윈드 파서의 변수 값 불간섭 특성을 이용함.

---

## 🛠️ Case 02. 스케일 고정 및 `none` 현상 (!important 실패)

### **[현상]**
- 미디어 쿼리는 정상 작동하나 `scale` 값이 의도한 수치(예: 10)가 아닌 기본값(3)으로 고정되거나 `none`이 됨.

### **[진단 (Audit Tool)]**
- `getComputedStyle`로 `translate`는 변하는데 `scale`만 멈추었는지 확인:
  ```javascript
  const style = window.getComputedStyle(document.querySelector('.nemo-logo-engine'));
  console.log('Scale:', style.scale, 'Translate:', style.translate);
  ```

### **[원인]**
- **단위 불일치 (Apple vs 10cm)**: `scale` 속성은 **순수 숫자**만 받음. `calc(10 + 0.5vw)`와 같이 '숫자+길이단위'를 더한 값은 물리적으로 성립 불가능하여 브라우저가 폐기함.
- **실패한 시도**: `!important`를 붙여도 "수학적 오류"이기 때문에 해결되지 않음.

### **[해결 (Resolution)]**
- **순수 숫자 엔진**: `vw` 단위를 제거하고 브라우저가 100% 이해하는 **정수(Unitless Number)**로 구간을 분절하여 지정.

---

## 🛠️ Case 03. 테일윈드 v4 내부 시스템 충돌

### **[현상]**
- `transform: scale()`을 직접 선언했으나 `Computed Style`에서 `none`으로 밀려남.

### **[원인]**
- **v4 지배 구조**: Tailwind v4는 `--tw-scale-x` 등 내부 변수로 `transform`을 실시간 합성함. 하위에서 직접 `transform`을 쓰면 이 시스템과 충돌함.

### **[해결 (Resolution)]**
- **개별 속성(Individual Properties) 접근**: `transform` 대신 브라우저 최신 표준인 **`scale`, `translate`** 속성을 직접 사용하고 **`@layer utilities`**에 배치.

---

## 🛠️ Case 04. 좀비 캐시로 인한 코드 미반영 (Zombie CSS)

### **[현상]**
- 파일을 수정하고 저장했음에도 브라우저에는 2~3단계 전의 낡은 CSS 결과물이 계속 나타남.

### **[원인]**
- **Turbopack 캐시 지연**: `next dev --turbo` 환경에서 전역 CSS 가공 규칙이 변경될 때 빌드 캐시가 즉시 갱신되지 않는 현상.

### **[해결 (Resolution)]**
- **하드 클리어(Hard Clear)**: 서버 종료 후 프로젝트 루트의 **`.next`** 폴더를 직접 삭제하고 재시작.

---

## 🏆 Final Master Spec (Best Practice)

향후 유지보수 시 이 구조를 표준으로 삼습니다.

```css
@layer utilities {
  .nemo-logo-engine {
    /* 1. 순수 숫자 데이터 레이어 (Zero-Error) */
    --nemo-scale: 18; 
    --nemo-y: 0px;

    /* 2. v4 표준 물리 레이어 */
    scale: var(--nemo-scale);
    translate: 0 var(--nemo-y);
    
    transform-origin: center;
    will-change: scale, translate;
    transition: scale 0.2s ease, translate 0.2s ease;
  }

  /* 3. 정밀 제어 사다리 (Breakpoints) */
  @media (min-width: 744px)  { --nemo-scale: 20; --nemo-y: -3px; }
  @media (min-width: 992px)  { --nemo-scale: 22; --nemo-y: -6px; }
  @media (min-width: 1440px) { --nemo-scale: 24; --nemo-y: -10px; }
  @media (min-width: 1920px) { --nemo-scale: 28; --nemo-y: -15px; }
}
```

---
**Status**: STABLE (Production Ready)  
**Usage**: 동일 환경에서 반응형 트랜스폼 구현 시 '복사-붙여넣기' 베이직 라인으로 활용 가능.
