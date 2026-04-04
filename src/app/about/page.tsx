import SubPageLayout from '@/components/layout/SubPageLayout';

/**
 * /about 페이지
 * 네모:ON + 상태 + 브랜드 철학
 */
export default function AboutPage() {
  return (
    <SubPageLayout className="pt-24 px-6 tablet-p:px-12 text-text-dark">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl tablet-p:text-6xl font-bold mb-8">About 네모:ON</h1>
        <p className="text-xl tablet-p:text-2xl leading-relaxed opacity-80">
          불안한 안녕, 기준은 언제나 당신. <br />
          네모:ON은 상태를 켜서, 구조가 작동하게 만드는 브랜드입니다.
        </p>
        <div className="mt-20 py-10 border-t border-black/10">
          <p className="text-sm uppercase tracking-widest opacity-40">Coming Soon</p>
        </div>
      </div>
    </SubPageLayout>
  );
}
