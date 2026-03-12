import { notFound } from 'next/navigation';

export default function LabPage() {
  // 배포 환경(production)에서는 페이지를 숨김 처리 (404 위장)
  if (process.env.NODE_ENV === 'production') {
    notFound();
  }

  return (
    <main className="min-h-screen pt-24 pb-12 px-6 flex flex-col items-center justify-center gap-4">
      <h1 className="text-4xl font-suit font-bold uppercase tracking-tighter">
        LAB
      </h1>
      <p className="text-brand font-medium">(비공개 페이지: 개발 환경에서만 보입니다)</p>
    </main>
  );
}
