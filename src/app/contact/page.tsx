import SubPageLayout from '@/components/layout/SubPageLayout';
import ContactContainer from '@/components/sections/contact/ContactContainer';

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
