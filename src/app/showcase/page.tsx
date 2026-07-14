// [V69.LaunchReady] STEP 4
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import SubPageLayout from '@/components/layout/SubPageLayout';

export const metadata: Metadata = {
  title: '쇼케이스',
  description: 'nemo:on이 만들어온 브랜드와 프로젝트들을 소개합니다.',
  // TODO: 페이지 활성화 시 추가 → alternates: { canonical: 'https://www.nemoon.co/showcase' },
};

export default function ShowcasePage() {
  if (process.env.NODE_ENV === 'production') {
    notFound();
  }

  return (
    <SubPageLayout className="pt-24 pb-12 px-6 flex items-center justify-center">
      <h1 className="text-4xl font-suit font-bold uppercase tracking-tighter">
        SHOWCASE
      </h1>
    </SubPageLayout>
  );
}
