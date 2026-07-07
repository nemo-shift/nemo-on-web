// [V69.LaunchReady] STEP 2 — 개인정보처리방침 페이지
// ⚠️ 법률 문서 초안입니다. 배포 전 반드시 내용을 검토하고 승인하십시오.
//    수집 항목, 보유 기간, 위탁사 정보 등을 실제 운영 상황에 맞게 확인하세요.
import { Metadata } from 'next';
import SubPageLayout from '@/components/layout/SubPageLayout';

export const metadata: Metadata = {
  title: '개인정보처리방침 | 네모:ON',
  description: '네모:ON의 개인정보 수집·이용·처리에 관한 방침을 안내합니다.',
};

export default function PrivacyPage() {
  const effectiveDate = '2026년 7월 7일';

  return (
    <SubPageLayout className="text-text-dark">
      <div className="max-w-3xl mx-auto py-10 pb-20 space-y-12">

        {/* 헤더 */}
        <div className="space-y-3 border-b border-text-dark/10 pb-8">
          <p className="font-mono text-xs uppercase tracking-widest text-text-dark/40">Legal</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">개인정보처리방침</h1>
          <p className="text-sm text-text-dark/50">시행일: {effectiveDate}</p>
        </div>

        {/* 본문 */}
        <div className="space-y-10 text-sm sm:text-base font-light leading-relaxed text-text-dark/80">

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-text-dark">1. 개인정보처리자 정보</h2>
            <p>
              네모:ON(이하 &quot;회사&quot;)은 이용자의 개인정보를 중요시하며, 「개인정보 보호법」을 준수합니다.
              본 방침은 회사가 운영하는 웹사이트(<strong>nemo-on.com</strong>)를 통해 수집되는
              개인정보의 처리에 관한 사항을 규정합니다.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-text-dark">2. 수집하는 개인정보 항목</h2>
            <p>회사는 문의 서비스 제공을 위해 아래 항목을 수집합니다.</p>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-text-dark/5">
                    <th className="text-left px-4 py-2 font-semibold border border-text-dark/10 w-1/3">구분</th>
                    <th className="text-left px-4 py-2 font-semibold border border-text-dark/10">수집 항목</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="px-4 py-2 border border-text-dark/10 align-top">필수</td>
                    <td className="px-4 py-2 border border-text-dark/10">이름, 전화번호, 이메일 주소, 문의 내용</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 border border-text-dark/10 align-top">선택</td>
                    <td className="px-4 py-2 border border-text-dark/10">회사명, 참고 URL, 첨부 파일(jpg·png·pdf·zip, 최대 40MB)</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 border border-text-dark/10 align-top">자동 수집</td>
                    <td className="px-4 py-2 border border-text-dark/10">IP 주소(스팸 방지 rate limit 용도, 즉시 폐기)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-text-dark">3. 수집 목적</h2>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>문의·상담 접수 및 응대</li>
              <li>서비스 제안 및 견적 회신</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-text-dark">4. 보유 및 이용 기간</h2>
            <p>
              수집된 개인정보는 상담 완료 후 <strong>1년</strong> 이내에 파기합니다.
              단, 관계 법령에 따라 일정 기간 보존이 필요한 경우 해당 기간 동안 별도 보관합니다.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-text-dark/5">
                    <th className="text-left px-4 py-2 font-semibold border border-text-dark/10">근거 법령</th>
                    <th className="text-left px-4 py-2 font-semibold border border-text-dark/10">보존 기간</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="px-4 py-2 border border-text-dark/10">전자상거래법 — 계약·청약 기록</td>
                    <td className="px-4 py-2 border border-text-dark/10">5년</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 border border-text-dark/10">전자상거래법 — 소비자 불만·분쟁 기록</td>
                    <td className="px-4 py-2 border border-text-dark/10">3년</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-text-dark">5. 개인정보 처리 위탁</h2>
            <p>회사는 원활한 서비스 제공을 위해 아래와 같이 개인정보 처리를 위탁합니다.</p>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-text-dark/5">
                    <th className="text-left px-4 py-2 font-semibold border border-text-dark/10">수탁사</th>
                    <th className="text-left px-4 py-2 font-semibold border border-text-dark/10">위탁 업무</th>
                    <th className="text-left px-4 py-2 font-semibold border border-text-dark/10">보유 기간</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="px-4 py-2 border border-text-dark/10">Resend, Inc.</td>
                    <td className="px-4 py-2 border border-text-dark/10">이메일 발송 서비스</td>
                    <td className="px-4 py-2 border border-text-dark/10">전송 완료 즉시 파기</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-text-dark">6. 정보주체의 권리</h2>
            <p>이용자는 언제든지 아래 권리를 행사할 수 있습니다.</p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>개인정보 열람 요청</li>
              <li>개인정보 정정·삭제 요청</li>
              <li>개인정보 처리 정지 요청</li>
              <li>동의 철회</li>
            </ul>
            <p>
              권리 행사는 아래 개인정보 보호책임자에게 이메일로 요청하시면 지체 없이 조치하겠습니다.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-text-dark">7. 개인정보 보호책임자</h2>
            <div className="bg-text-dark/3 border border-text-dark/10 px-5 py-4 space-y-1">
              <p><span className="font-semibold">책임자:</span> 네모:ON 대표</p>
              <p>
                <span className="font-semibold">이메일:</span>{' '}
                <a href="mailto:turn.nemoon@gmail.com" className="underline hover:text-brand transition-colors">
                  turn.nemoon@gmail.com
                </a>
              </p>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-text-dark">8. 개인정보처리방침 변경</h2>
            <p>
              본 방침은 법령 변경 또는 서비스 정책 변경에 따라 수정될 수 있습니다.
              변경 시 시행일 7일 전부터 웹사이트를 통해 공지합니다.
            </p>
          </section>

        </div>

        {/* 하단 링크 */}
        <div className="pt-8 border-t border-text-dark/10">
          <a href="/contact" className="text-xs font-mono uppercase tracking-widest text-text-dark/40 hover:text-brand transition-colors">
            ← 문의 페이지로 돌아가기
          </a>
        </div>

      </div>
    </SubPageLayout>
  );
}
