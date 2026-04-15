/**
 * [Data] 브랜드 진단 섹션 콘텐츠 및 로직 데이터
 * docs/content/1.Home.md 내용을 데이터화
 */

export const DIAGNOSIS_SECTION_CONTENT = {
  intro: [
    '> 브랜드 켜는 중...',
    '> 브랜드 켜는 중......',
    '> 브랜드 진단을 시작하시겠습니까?'
  ],
  options: {
    yes: {
      label: 'YES',
      logs: [
        '> initializing brand_diagnosis...',
        '> loading user_profile...',
        '> connecting to NEMO:ON...',
        '> ████████████████ 100%',
        '> COMPLETE ✓'
      ],
      targetPath: '/diagnosis'
    },
    no: {
      label: 'NO',
      logs: [
        '> ████████████████ 40%',
        '> ERROR 404: brand_clarity not found',
        '> 브랜드 진단이 필요합니다.',
        '> redirecting...'
      ],
      targetPath: '/diagnosis'
    }
  }
};
