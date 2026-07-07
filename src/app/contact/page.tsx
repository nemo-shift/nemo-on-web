// [V69.LaunchReady] STEP 4
import { Metadata } from 'next';
import SubPageLayout from '@/components/layout/SubPageLayout';
import ContactContainer from '@/components/sections/contact/ContactContainer';

export const metadata: Metadata = {
  title: '문의하기',
  description: '프로젝트 의뢰, 협업, 웨비나 등 궁금한 사항을 문의해주세요. 네모:ON이 함께 고민합니다.',
  openGraph: { url: '/contact' },
};

/**
 * /contact 페이지
 * 컨택 (대화형 문장 폼)
 */
export default function ContactPage() {
  return (
    <SubPageLayout className="text-text-dark">
      <div className="max-w-4xl mx-auto py-10">
        <ContactContainer />
      </div>
    </SubPageLayout>
  );
}
