// [V69.LaunchReady] STEP 4
import { Metadata } from 'next';
import SubPageLayout from '@/components/layout/SubPageLayout';

export const metadata: Metadata = {
  title: 'Studio',
  description: '브랜드 기획부터 앱 개발까지. nemo:on Studio가 당신의 브랜드를 구조화합니다.',
  // TODO: 페이지 활성화 시 추가 → alternates: { canonical: 'https://www.nemoon.co/offerings/studio' },
};

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
