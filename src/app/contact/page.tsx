import SubPageLayout from '@/components/layout/SubPageLayout';

/**
 * /contact 페이지
 * 컨택
 */
export default function ContactPage() {
  return (
    <SubPageLayout className="pt-24 px-6 md:px-12 text-text-dark">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-bold mb-8">Get in Touch</h1>
        <p className="text-xl md:text-2xl leading-relaxed opacity-80">
          브랜드를 켤 준비가 되셨나요? <br />
          당신의 결을 들려주세요.
        </p>
        <div className="mt-20 py-10 border-t border-black/10">
          <p className="text-sm uppercase tracking-widest opacity-40">Coming Soon</p>
        </div>
      </div>
    </SubPageLayout>
  );
}
