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
  // 諛고룷 ?섍꼍(production)?먯꽌???섏씠吏瑜??④? 泥섎━ (404 ?꾩옣)
  if (process.env.NODE_ENV === 'production') {
    notFound();
  }

  return (
    <SubPageLayout className="min-h-screen pt-24 pb-12 px-6 flex flex-col items-center justify-center gap-4">
      <h1 className="text-4xl font-suit font-bold uppercase tracking-tighter">
        STORY
      </h1>
      <p className="text-brand font-medium">(鍮꾧났媛??섏씠吏: 媛쒕컻 ?섍꼍?먯꽌留?蹂댁엯?덈떎)</p>
    </SubPageLayout>
  );
}
