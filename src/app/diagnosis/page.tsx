import SubPageLayout from "@/components/layout/SubPageLayout";
import DiagnosisContainer from "@/components/sections/diagnosis/DiagnosisContainer";

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
    </SubPageLayout>
  );
}
