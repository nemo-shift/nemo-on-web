'use client';

import React, { useState, useRef } from 'react';

interface ContactFormProps {
  onSubmitSuccess: (data: any) => void;
}

type InquiryType = 'project' | 'webinar' | 'collaboration' | 'etc';

interface FormState {
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

export default function ContactForm({ onSubmitSuccess }: ContactFormProps) {
  const [form, setForm] = useState<FormState>({
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

  const handleTypeChange = (type: InquiryType) => {
    setForm((prev) => ({ ...prev, inquiryType: type }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    if (selectedFile) {
      if (selectedFile.size > 40 * 1024 * 1024) {
        alert('파일 용량은 최대 40MB까지 첨부할 수 있습니다.');
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
    } else if (!/^\d{2,3}-\d{3,4}-\d{4}$/.test(form.phone)) {
      newErrors.phone = '올바른 전화번호 형식(예: 010-0000-0000)으로 입력해주세요.';
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      // 실제 API 연동이 예정되어 있으나 우선 로컬 성공 상태로 전환
      onSubmitSuccess(form);
    }
  };

  const inquiryTypeLabels: Record<InquiryType, string> = {
    project: '프로젝트 의뢰',
    webinar: '웨비나 관련 문의',
    collaboration: '채용 / 협업 문의',
    etc: '기타 문의',
  };

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
            className="inline-block text-left bg-transparent border-b border-text-dark/15 focus:border-brand focus:outline-none transition-colors px-2 py-0.5 max-w-[220px] text-base sm:text-lg font-medium text-brand placeholder-text-dark/25"
          />{' '}
          의{' '}
          <div className="inline-block relative">
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleInputChange}
              placeholder="이름을 입력해주세요."
              className={`inline-block text-left bg-transparent border-b ${
                errors.name ? 'border-red-500' : 'border-text-dark/15'
              } focus:border-brand focus:outline-none transition-colors px-2 py-0.5 max-w-[180px] text-base sm:text-lg font-medium text-brand placeholder-text-dark/25`}
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
                  className={`px-4 py-2 border border-text-dark/10 text-xs sm:text-sm tracking-tight transition-all duration-300 cursor-pointer ${
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
                className={`w-full bg-transparent border ${
                  errors.content ? 'border-red-500' : 'border-text-dark/15'
                } focus:border-brand focus:outline-none transition-colors p-4 text-sm font-light placeholder-text-dark/25 resize-none leading-relaxed`}
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
              className="w-full bg-transparent border-b border-text-dark/15 focus:border-brand focus:outline-none transition-colors py-2 text-sm font-light placeholder-text-dark/25"
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
              className="px-4 py-2.5 border border-text-dark/20 hover:border-brand hover:text-brand text-xs font-bold tracking-widest uppercase transition-all duration-300 cursor-pointer self-start"
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
                    className="text-red-500 hover:text-red-700 ml-2 font-bold cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <span className="text-xs text-text-dark/40">관련 파일을 첨부합니다. (최대 40MB, jpg/jpeg/png/pdf/zip 등)</span>
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
              type="text"
              name="phone"
              value={form.phone}
              onChange={handleInputChange}
              placeholder="전화번호('-' 포함)"
              className={`inline-block text-left bg-transparent border-b ${
                errors.phone ? 'border-red-500' : 'border-text-dark/15'
              } focus:border-brand focus:outline-none transition-colors px-2 py-0.5 max-w-[200px] text-base sm:text-lg font-medium text-brand placeholder-text-dark/25`}
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
              className={`inline-block text-left bg-transparent border-b ${
                errors.email ? 'border-red-500' : 'border-text-dark/15'
              } focus:border-brand focus:outline-none transition-colors px-2 py-0.5 max-w-[260px] text-base sm:text-lg font-medium text-brand placeholder-text-dark/25`}
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
              className="w-4 h-4 accent-brand rounded border-text-dark/15 focus:ring-brand cursor-pointer"
            />
            <label htmlFor="agreePrivacy" className="text-xs sm:text-sm text-text-dark/60 cursor-pointer">
              <span className="underline hover:text-brand transition-colors font-medium">개인정보처리방침</span>에 동의합니다.
              <span className="text-accent ml-1 font-semibold">(필수)</span>
            </label>
          </div>
          {errors.agreePrivacy && <p className="text-[10px] text-red-500 font-normal">{errors.agreePrivacy}</p>}
        </div>
      </div>

      {/* 제출 버튼 */}
      <div className="mt-12 flex justify-end">
        <button
          type="submit"
          className="px-8 py-3 bg-text-dark text-white font-semibold text-xs sm:text-sm tracking-widest uppercase transition-all duration-300 hover:bg-brand hover:scale-[1.02] cursor-pointer"
        >
          문의하기 →
        </button>
      </div>
    </form>
  );
}
