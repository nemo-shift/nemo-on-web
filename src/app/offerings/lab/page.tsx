import SubPageLayout from '@/components/layout/SubPageLayout';

/**
 * /offerings/lab 페이지
 * 자체 실험 레이블
 */
export default function LabPage() {
  return (
    <SubPageLayout className="pt-24 px-6 md:px-12 text-text-dark">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-bold mb-8">Lab.</h1>
        <p className="text-xl md:text-2xl leading-relaxed opacity-80">
          브랜드를 작동하게 만드는 실험실입니다. <br />
          네모:ON의 가능성을 직접 증명하고 확장합니다.
        </p>
        <div className="mt-20 py-10 border-t border-black/10">
          <p className="text-sm uppercase tracking-widest opacity-40">Coming Soon</p>
        </div>
      </div>
    </SubPageLayout>
  );
}
