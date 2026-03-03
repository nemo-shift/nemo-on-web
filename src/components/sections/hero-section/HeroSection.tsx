'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui';

/**
 * HeroSection 컴포넌트
 * 홈페이지 메인 히어로 영역 — 대형 헤드라인과 CTA 버튼
 *
 * Example usage:
 * <HeroSection />
 */
export default function HeroSection(): React.ReactElement {
  const handleCtaClick = () => {
    // CTA 버튼 클릭 핸들러
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="py-20 md:py-32"
    >
      <div className="max-w-screen-xl mx-auto px-4 md:px-8">
        <div className="flex flex-col items-center text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-text-primary mb-6">
            네모ON에 오신 것을 환영합니다
          </h1>
          <p className="text-xl md:text-2xl font-medium text-text-muted mb-8 max-w-2xl">
            현대적이고 반응형인 웹 경험을 제공합니다
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button label="시작하기" onClick={handleCtaClick} />
            <Link
              href="/about"
              className="flex items-center gap-2 px-4 py-2 text-brand-primary hover:underline"
            >
              더 알아보기
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
