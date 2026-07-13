// [V69.LaunchReady] STEP 1 — fetch('/api/contact') 연동, honeypot, 로딩/에러 상태 추가
'use client';

import React, { useState, useRef } from 'react';

export interface ContactFormData {
  company: string;
  name: string;
  inquiryType: InquiryType;
  content: string;
  referenceUrl: string;
  file: File | null;
  phone: string;
  email: string;
  agreePrivacy: boolean;
}

interface ContactFormProps {
  onSubmitSuccess: (data: ContactFormData) => void;
}

type InquiryType = 'project' | 'webinar' | 'collaboration' | 'etc';

type SubmitStatus = 'idle' | 'loading' | 'error';

export default function ContactForm({ onSubmitSuccess }: ContactFormProps) {
  const [form, setForm] = useState<ContactFormData>({
    company: '',
    name: '',
    inquiryType: 'project',
    content: '',
    referenceUrl: '',
    file: null,
    phone: '',
    email: '',
    agreePrivacy: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>('idle');
  const [serverError, setServerError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const formatPhoneNumber = (digits: string): string => {
    if (digits.startsWith('02')) {
      // 서울 지역번호: 02-XXXX-XXXX 또는 02-XXX-XXXX
      if (digits.length <= 2) return digits;
      if (digits.length <= 5) return `${digits.slice(0, 2)}-${digits.slice(2)}`;
      if (digits.length <= 9) return `${digits.slice(0, 2)}-${digits.slice(2, 5)}-${digits.slice(5)}`;
      return `${digits.slice(0, 2)}-${digits.slice(2, 6)}-${digits.slice(6, 10)}`;
    } else {
      // 일반 번호: 010/031/etc — XXX-XXXX-XXXX
      if (digits.length <= 3) return digits;
      if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
      if (digits.length <= 10) return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
      return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}`;
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 11);
    const formatted = formatPhoneNumber(digits);
    setForm((prev) => ({ ...prev, phone: formatted }));
    if (errors.phone) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.phone;
        return next;
      });
    }
  };

  const handleTypeChange = (type: InquiryType) => {
    setForm((prev) => ({ ...prev, inquiryType: type }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    if (selectedFile) {
      if (selectedFile.size > 4 * 1024 * 1024) {
        alert('파일 용량은 최대 4MB까지 첨부할 수 있습니다.\n큰 파일은 Google Drive나 WeTransfer 링크를 참고 URL에 붙여넣어 주세요.');
        return;
      }
      setForm((prev) => ({ ...prev, file: selectedFile }));
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveFile = () => {
    setForm((prev) => ({ ...prev, file: null }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!form.name.trim()) {
      newErrors.name = '이름을 입력해주세요.';
    }
    if (!form.content.trim()) {
      newErrors.content = '문의 내용을 입력해주세요.';
    }
    if (!form.phone.trim()) {
      newErrors.phone = '전화번호를 입력해주세요.';
    } else if (form.phone.replace(/\D/g, '').length < 9) {
      newErrors.phone = '전화번호를 끝까지 입력해주세요.';
    }
    if (!form.email.trim()) {
      newErrors.email = '이메일 주소를 입력해주세요.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = '올바른 이메일 형식으로 입력해주세요.';
    }
    if (!form.agreePrivacy) {
      newErrors.agreePrivacy = '개인정보처리방침에 동의해야 문의를 제출할 수 있습니다.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitStatus('loading');
    setServerError('');

    const payload = new FormData();
    payload.append('name', form.name);
    payload.append('company', form.company);
    payload.append('inquiryType', form.inquiryType);
    payload.append('content', form.content);
    payload.append('referenceUrl', form.referenceUrl);
    payload.append('phone', form.phone);
    payload.append('email', form.email);
    // Honeypot — 사람은 비워둠
    payload.append('_hp', '');
    if (form.file) {
      payload.append('file', form.file);
    }

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        body: payload,
      });

      if (res.ok) {
        setSubmitStatus('idle');
        onSubmitSuccess(form);
      } else {
        const json = await res.json().catch(() => ({}));
        setServerError(
          json.error ?? '전송에 실패했습니다. 잠시 후 다시 시도해주세요.'
        );
        setSubmitStatus('error');
      }
    } catch {
      setServerError('네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      setSubmitStatus('error');
    }
  };

  const inquiryTypeLabels: Record<InquiryType, string> = {
    project: '프로젝트 의뢰',
    webinar: '웨비나 관련 문의',
    collaboration: '채용 / 협업 문의',
    etc: '기타 문의',
  };

  const isLoading = submitStatus === 'loading';

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto py-8 sm:py-12 px-4 flex flex-col justify-between min-h-[580px] text-text-dark font-sans leading-relaxed">
      <div className="space-y-12">
        {/* 문장 1: 인사 및 자기소개 */}
        <div className="text-xl sm:text-2xl font-light tracking-tight text-left">
          <span className="block mb-2 text-text-dark/40 font-mono text-xs uppercase tracking-widest">01 / Introduction</span>
          안녕하세요. <br className="sm:hidden" /> 저는{' '}
          <input
            type="text"
            name="company"
            value={form.company}
            onChange={handleInputChange}
            placeholder="회사명을 입력해주세요. (선택)"
            disabled={isLoading}
            className="inline-block text-left bg-transparent border-b border-text-dark/15 focus:border-brand focus:outline-none transition-colors px-2 py-0.5 max-w-[220px] text-base sm:text-lg font-medium text-brand placeholder-text-dark/25 disabled:opacity-50"
          />{' '}
          의{' '}
          <div className="inline-block relative">
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleInputChange}
              placeholder="이름을 입력해주세요."
              disabled={isLoading}
              className={`inline-block text-left bg-transparent border-b ${
                errors.name ? 'border-red-500' : 'border-text-dark/15'
              } focus:border-brand focus:outline-none transition-colors px-2 py-0.5 max-w-[180px] text-base sm:text-lg font-medium text-brand placeholder-text-dark/25 disabled:opacity-50`}
            />
            {errors.name && <span className="absolute left-0 -bottom-5 text-[10px] text-red-500 font-normal whitespace-nowrap">{errors.name}</span>}
          </div>{' '}
          입니다.
        </div>

        {/* 문장 2: 문의 목적 (Segmented Tabs) */}
        <div className="text-left">
          <span className="block mb-4 text-text-dark/40 font-mono text-xs uppercase tracking-widest">02 / Purpose of Inquiry</span>
          <div className="flex flex-wrap gap-2.5 mb-4">
            {(Object.keys(inquiryTypeLabels) as InquiryType[]).map((type) => {
              const isSelected = form.inquiryType === type;
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleTypeChange(type)}
                  disabled={isLoading}
                  className={`px-4 py-2 border border-text-dark/10 text-xs sm:text-sm tracking-tight transition-all duration-300 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 ${
                    isSelected
                      ? 'bg-text-dark text-white font-bold border-text-dark'
                      : 'bg-transparent text-text-dark/60 hover:text-text-dark hover:border-text-dark/30'
                  }`}
                >
                  {inquiryTypeLabels[type]}
                </button>
              );
            })}
          </div>
          <span className="text-xl sm:text-2xl font-light tracking-tight">를 하고 싶습니다.</span>
        </div>

        {/* 웨비나 선택 시 조건부 안내 */}
        {form.inquiryType === 'webinar' && (
          <div className="text-left border-l-2 border-brand/30 pl-5 py-1 space-y-1.5">
            <p className="text-sm text-text-dark/70 leading-relaxed">
              웨비나에 대한 자세한 내용은{' '}
              <a
                href="https://define.nemoon.co/webinar"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-brand underline underline-offset-2 hover:text-brand/80 transition-colors"
              >
                DE:FINE
              </a>
              에서 확인하실 수 있습니다.
            </p>
            <p className="text-sm text-text-dark/50 leading-relaxed">
              신청·일정 문의는 아래에 남겨주세요.
            </p>
          </div>
        )}

        {/* 문장 3: 문의 내용 및 참고사이트 */}
        <div className="text-left space-y-6">
          <div>
            <span className="block mb-3 text-text-dark/40 font-mono text-xs uppercase tracking-widest">03 / Message Details</span>
            <p className="text-base font-light opacity-80 mb-2">문의 내용은 아래와 같습니다.</p>
            <div className="relative">
              <textarea
                name="content"
                value={form.content}
                onChange={handleInputChange}
                placeholder="내용을 입력해주세요."
                rows={5}
                disabled={isLoading}
                className={`w-full bg-transparent border ${
                  errors.content ? 'border-red-500' : 'border-text-dark/15'
                } focus:border-brand focus:outline-none transition-colors p-4 text-sm font-light placeholder-text-dark/25 resize-none leading-relaxed disabled:opacity-50`}
              />
              {errors.content && <span className="absolute left-0 -bottom-5 text-[10px] text-red-500 font-normal">{errors.content}</span>}
            </div>
          </div>

          <div>
            <input
              type="text"
              name="referenceUrl"
              value={form.referenceUrl}
              onChange={handleInputChange}
              placeholder="참고사이트 주소를 입력해주세요. (선택)"
              disabled={isLoading}
              className="w-full bg-transparent border-b border-text-dark/15 focus:border-brand focus:outline-none transition-colors py-2 text-sm font-light placeholder-text-dark/25 disabled:opacity-50"
            />
          </div>
        </div>

        {/* 문장 4: 파일 첨부 */}
        <div className="text-left">
          <span className="block mb-3 text-text-dark/40 font-mono text-xs uppercase tracking-widest">04 / File Attachment</span>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <button
              type="button"
              onClick={triggerFileSelect}
              disabled={isLoading}
              className="px-4 py-2.5 border border-text-dark/20 hover:border-brand hover:text-brand text-xs font-bold tracking-widest uppercase transition-all duration-300 cursor-pointer self-start disabled:cursor-not-allowed disabled:opacity-50"
            >
              ↓ 파일 첨부
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept=".jpg,.jpeg,.png,.pdf,.zip"
            />
            <div className="flex-1">
              {form.file ? (
                <div className="flex items-center gap-2 text-xs font-medium text-brand">
                  <span className="truncate max-w-[280px]">{form.file.name}</span>
                  <span className="text-[10px] text-text-dark/40">({(form.file.size / (1024 * 1024)).toFixed(2)} MB)</span>
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    disabled={isLoading}
                    className="text-red-500 hover:text-red-700 ml-2 font-bold cursor-pointer disabled:cursor-not-allowed"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <span className="text-xs text-text-dark/40">관련 파일을 첨부합니다. (최대 4MB, jpg/jpeg/png/pdf/zip) · 큰 파일은 참고 URL란에 링크로 공유해주세요.</span>
              )}
            </div>
          </div>
        </div>

        {/* 문장 5: 답변 수신 정보 */}
        <div className="text-xl sm:text-2xl font-light tracking-tight text-left leading-loose">
          <span className="block mb-2 text-text-dark/40 font-mono text-xs uppercase tracking-widest">05 / Receive Contact Info</span>
          답변은{' '}
          <div className="inline-block relative align-middle">
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handlePhoneChange}
              placeholder="전화번호"
              disabled={isLoading}
              className={`inline-block text-left bg-transparent border-b ${
                errors.phone ? 'border-red-500' : 'border-text-dark/15'
              } focus:border-brand focus:outline-none transition-colors px-2 py-0.5 max-w-[200px] text-base sm:text-lg font-medium text-brand placeholder-text-dark/25 disabled:opacity-50`}
            />
            {errors.phone && <span className="absolute left-0 -bottom-5 text-[10px] text-red-500 font-normal whitespace-nowrap">{errors.phone}</span>}
          </div>
          {' , '}
          <div className="inline-block relative align-middle">
            <input
              type="text"
              name="email"
              value={form.email}
              onChange={handleInputChange}
              placeholder="이메일 주소"
              disabled={isLoading}
              className={`inline-block text-left bg-transparent border-b ${
                errors.email ? 'border-red-500' : 'border-text-dark/15'
              } focus:border-brand focus:outline-none transition-colors px-2 py-0.5 max-w-[260px] text-base sm:text-lg font-medium text-brand placeholder-text-dark/25 disabled:opacity-50`}
            />
            {errors.email && <span className="absolute left-0 -bottom-5 text-[10px] text-red-500 font-normal whitespace-nowrap">{errors.email}</span>}
          </div>{' '}
          로 받고 싶어요.
        </div>

        {/* 개인정보 처리방침 동의 */}
        <div className="text-left pt-4 border-t border-text-dark/10 space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="agreePrivacy"
              name="agreePrivacy"
              checked={form.agreePrivacy}
              disabled={isLoading}
              onChange={(e) => {
                setForm((prev) => ({ ...prev, agreePrivacy: e.target.checked }));
                if (errors.agreePrivacy && e.target.checked) {
                  setErrors((prev) => {
                    const next = { ...prev };
                    delete next.agreePrivacy;
                    return next;
                  });
                }
              }}
              className="w-4 h-4 accent-brand rounded border-text-dark/15 focus:ring-brand cursor-pointer disabled:cursor-not-allowed"
            />
            <label htmlFor="agreePrivacy" className="text-xs sm:text-sm text-text-dark/60 cursor-pointer">
              <a href="/privacy" target="_blank" rel="noopener noreferrer" className="underline hover:text-brand transition-colors font-medium">개인정보처리방침</a>에 동의합니다.
              <span className="text-accent ml-1 font-semibold">(필수)</span>
            </label>
          </div>
          {errors.agreePrivacy && <p className="text-[10px] text-red-500 font-normal">{errors.agreePrivacy}</p>}
        </div>

        {/* 서버 에러 메시지 */}
        {submitStatus === 'error' && (
          <div className="text-sm text-red-500 border border-red-200 bg-red-50 px-4 py-3 leading-relaxed">
            <p>{serverError}</p>
            <p className="mt-1 text-xs text-red-400">
              문제가 지속되면 직접 연락해 주세요: <a href="mailto:turn.nemoon@gmail.com" className="underline">turn.nemoon@gmail.com</a>
            </p>
          </div>
        )}
      </div>

      {/* 제출 버튼 */}
      <div className="mt-12 flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className="px-8 py-3 bg-text-dark text-white font-semibold text-xs sm:text-sm tracking-widest uppercase transition-all duration-300 hover:bg-brand hover:scale-[1.02] cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 disabled:scale-100"
        >
          {isLoading ? '전송 중...' : '문의하기 →'}
        </button>
      </div>
    </form>
  );
}
