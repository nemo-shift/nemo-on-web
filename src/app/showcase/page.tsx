// [V69.LaunchReady] STEP 4
import { Metadata } from 'next';
import SubPageLayout from '@/components/layout/SubPageLayout';

export const metadata: Metadata = {
  title: '쇼케이스',
  description: 'nemo:on이 만들어온 브랜드와 프로젝트들을 소개합니다.',
  openGraph: { url: '/showcase' },
};

export default function ShowcasePage() {
  return (
    <SubPageLayout className="pt-24 pb-12 px-6 flex items-center justify-center">
      <h1 className="text-4xl font-suit font-bold uppercase tracking-tighter">
        SHOWCASE
      </h1>
    </SubPageLayout>
  );
}
