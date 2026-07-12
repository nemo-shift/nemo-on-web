// [V69.LaunchReady] STEP 4
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import SubPageLayout from '@/components/layout/SubPageLayout';

export const metadata: Metadata = {
  title: '스토리',
  description: 'nemo:on의 브랜드 여정과 이야기를 담았습니다.',
  openGraph: { url: '/story' },
};

export default function StoryPage() {
  // production 환경에서는 페이지를 숨김 처리 (404 반환)
  if (process.env.NODE_ENV === 'production') {
    notFound();
  }

  return (
    <SubPageLayout className="min-h-screen pt-24 pb-12 px-6 flex flex-col items-center justify-center gap-4">
      <h1 className="text-4xl font-suit font-bold uppercase tracking-tighter">
        STORY
      </h1>
      <p className="text-brand font-medium">(준비 중인 페이지: 개발 환경에서만 보입니다)</p>
    </SubPageLayout>
  );
}
