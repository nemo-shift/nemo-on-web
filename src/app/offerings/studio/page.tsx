import SubPageLayout from '@/components/layout/SubPageLayout';

/**
 * /offerings/studio 페이지
 * 브랜드 + 앱 개발 서비스 상세
 */
export default function StudioPage() {
  return (
    <SubPageLayout className="pt-24 px-6 tablet-p:px-12 text-text-dark">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl tablet-p:text-6xl font-bold mb-8">Studio</h1>
        <p className="text-xl tablet-p:text-2xl leading-relaxed opacity-80">
          당신의 브랜드는 지금, 설명 가능한가요? <br />
          본질을 디자인하고, 디지털 구조로 번역합니다.
        </p>
        <div className="mt-20 py-10 border-t border-black/10">
          <p className="text-sm uppercase tracking-widest opacity-40">Coming Soon</p>
        </div>
      </div>
    </SubPageLayout>
  );
}
