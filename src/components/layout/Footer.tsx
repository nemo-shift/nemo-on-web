import React from 'react';
import Link from 'next/link';

/**
 * Footer 컴포넌트
 * 사이트 하단 푸터
 *
 * Example usage:
 * <Footer />
 */
export default function Footer(): React.ReactElement {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-surface-light py-8 md:py-12">
      <div className="max-w-screen-xl mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-text-muted">
            © {currentYear} 네모ON. All rights reserved.
          </p>
          <nav className="flex gap-6">
            <Link
              href="/privacy"
              className="text-sm text-text-muted hover:text-text-primary transition-colors"
            >
              개인정보처리방침
            </Link>
            <Link
              href="/terms"
              className="text-sm text-text-muted hover:text-text-primary transition-colors"
            >
              이용약관
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
