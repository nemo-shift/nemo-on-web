import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * 조건부/복합 Tailwind 클래스를 병합하는 유틸 함수
 * clsx + tailwind-merge 조합
 *
 * @param inputs - 클래스 이름 또는 조건부 객체
 * @returns 병합된 클래스 문자열
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
