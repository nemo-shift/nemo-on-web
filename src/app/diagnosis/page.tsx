// [V69.LaunchReady] STEP 4
import { Metadata } from 'next';
import SubPageLayout from "@/components/layout/SubPageLayout";
import DiagnosisContainer from "@/components/sections/diagnosis/DiagnosisContainer";

export const metadata: Metadata = {
  title: '브랜드 진단',
  description: '나의 브랜드는 지금 어떤 상태인가요? 간단한 진단으로 확인해보세요.',
  alternates: { canonical: 'https://www.nemoon.co/diagnosis' },
};

/**
 * /diagnosis 페이지
 * 브랜드 진단
 */
export default function DiagnosisPage() {
  return (
    <SubPageLayout className="text-text-dark">
      <div className="max-w-4xl mx-auto py-10">
        <DiagnosisContainer />
      </div>
      {/* 콘텐츠 끝과 Footer reveal 사이 여유 공간 */}
      <div className="h-[30vh] tablet-p:h-[30vh] tablet:h-[50vh]" />
    </SubPageLayout>
  );
}
