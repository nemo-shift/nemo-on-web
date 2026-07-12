// [V69.LaunchReady] STEP 1 — 문의 폼 API Route (Option A: Resend)
import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

// Resend 인스턴스는 핸들러 내부에서 생성 — 빌드 타임 모듈 평가 시 API 키 미존재로 인한 오류 방지
const RECEIVER_EMAIL = process.env.CONTACT_RECEIVER_EMAIL ?? 'turn.nemoon@gmail.com';

// Rate limiting: IP당 분당 3회
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'pdf', 'zip'];
const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB (Vercel 서버리스 요청 본문 한계 4.5MB 대응)
const MAX_CONTENT_LENGTH = 5000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  if (entry.count >= 3) return false;
  entry.count++;
  return true;
}

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'
  );
}

const INQUIRY_TYPE_LABELS: Record<string, string> = {
  project: '프로젝트 의뢰',
  webinar: '웨비나 관련 문의',
  collaboration: '채용 / 협업 문의',
  etc: '기타 문의',
};

export async function POST(req: NextRequest) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  // Rate limit
  const ip = getClientIp(req);
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: '잠시 후 다시 시도해주세요. (1분에 최대 3회)' },
      { status: 429 }
    );
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: '요청 형식이 올바르지 않습니다.' }, { status: 400 });
  }

  // Honeypot 검사 — 봇이 채우면 조용히 200 반환
  const honeypot = formData.get('_hp');
  if (honeypot && String(honeypot).trim() !== '') {
    return NextResponse.json({ ok: true });
  }

  // 필드 추출
  const name = String(formData.get('name') ?? '').trim();
  const company = String(formData.get('company') ?? '').trim();
  const inquiryType = String(formData.get('inquiryType') ?? '').trim();
  const content = String(formData.get('content') ?? '').trim();
  const referenceUrl = String(formData.get('referenceUrl') ?? '').trim();
  const phone = String(formData.get('phone') ?? '').trim();
  const email = String(formData.get('email') ?? '').trim();
  const file = formData.get('file') as File | null;

  // 서버 측 유효성 검사
  const errors: string[] = [];

  if (!name) errors.push('이름이 누락되었습니다.');
  if (!content) errors.push('문의 내용이 누락되었습니다.');
  if (!phone || !/^\d{2,3}-\d{3,4}-\d{4}$/.test(phone)) errors.push('전화번호 형식이 올바르지 않습니다.');
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('이메일 형식이 올바르지 않습니다.');
  if (!['project', 'webinar', 'collaboration', 'etc'].includes(inquiryType)) errors.push('문의 유형이 올바르지 않습니다.');
  if (content.length > MAX_CONTENT_LENGTH) errors.push(`문의 내용은 ${MAX_CONTENT_LENGTH}자 이내로 입력해주세요.`);

  if (file && file.size > 0) {
    const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
    if (!ALLOWED_EXTENSIONS.includes(ext)) errors.push('허용되지 않는 파일 형식입니다. (jpg/png/pdf/zip)');
    if (file.size > MAX_FILE_SIZE) errors.push('파일 크기는 최대 4MB까지 허용됩니다. 큰 파일은 참고 URL란에 링크로 공유해주세요.');
  }

  if (errors.length > 0) {
    return NextResponse.json({ error: errors.join(' / ') }, { status: 400 });
  }

  // 이메일 본문 구성
  const inquiryLabel = INQUIRY_TYPE_LABELS[inquiryType] ?? inquiryType;
  const htmlBody = `
    <h2 style="color:#E8734A;margin-bottom:24px;">nemo:on 새 문의가 도착했습니다</h2>
    <table style="border-collapse:collapse;width:100%;font-size:14px;">
      <tr><td style="padding:8px 12px;background:#f5f5f5;font-weight:bold;width:120px;">이름</td><td style="padding:8px 12px;">${name}</td></tr>
      <tr><td style="padding:8px 12px;background:#f5f5f5;font-weight:bold;">회사명</td><td style="padding:8px 12px;">${company || '—'}</td></tr>
      <tr><td style="padding:8px 12px;background:#f5f5f5;font-weight:bold;">문의 유형</td><td style="padding:8px 12px;">${inquiryLabel}</td></tr>
      <tr><td style="padding:8px 12px;background:#f5f5f5;font-weight:bold;">전화번호</td><td style="padding:8px 12px;">${phone}</td></tr>
      <tr><td style="padding:8px 12px;background:#f5f5f5;font-weight:bold;">이메일</td><td style="padding:8px 12px;">${email}</td></tr>
      <tr><td style="padding:8px 12px;background:#f5f5f5;font-weight:bold;">참고사이트</td><td style="padding:8px 12px;">${referenceUrl || '—'}</td></tr>
      <tr><td style="padding:8px 12px;background:#f5f5f5;font-weight:bold;vertical-align:top;">문의 내용</td><td style="padding:8px 12px;white-space:pre-wrap;">${content}</td></tr>
      <tr><td style="padding:8px 12px;background:#f5f5f5;font-weight:bold;">첨부파일</td><td style="padding:8px 12px;">${file && file.size > 0 ? file.name : '없음'}</td></tr>
    </table>
  `;

  // 첨부파일 처리
  type ResendAttachment = { filename: string; content: Buffer };
  const attachments: ResendAttachment[] = [];
  if (file && file.size > 0) {
    const arrayBuffer = await file.arrayBuffer();
    attachments.push({
      filename: file.name,
      content: Buffer.from(arrayBuffer),
    });
  }

  try {
    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: RECEIVER_EMAIL,
      replyTo: email,
      subject: `[nemo:on 문의] ${inquiryLabel} — ${name}`,
      html: htmlBody,
      attachments,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[contact/route] Resend error:', err);
    return NextResponse.json(
      { error: '이메일 전송에 실패했습니다. 잠시 후 다시 시도해주세요.' },
      { status: 500 }
    );
  }
}
