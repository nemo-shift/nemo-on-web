/**
 * 홈 페이지 관련 타입 정의
 * homeContent.ts 데이터 구조에 대응하는 타입
 */

export type BrandStoryScene = {
  id: number;
  title: string;
  ko: string;
  en: string;
  bg: string;
};

export type MessageBubble = {
  id: number;
  text: string;
};

export type AboutContent = {
  wordPool: string[];
  coreWords: string[];
  sentences: string[];
};

export type FooterColumn = {
  title: string;
  links: { label: string; href: string }[];
};

import { NavLink } from './nav';

export type HomeContent = {
  hero: {
    slogan: [string, string];
    brandName: string;
    navLinks: NavLink[];
    phrases: [string, string, string];
    bigTypo: { nemo: string; off: string; on: string };
  };
  brandStory: BrandStoryScene[];
  message: {
    bubbles: MessageBubble[];
    serviceFlow: string[];
  };
  about: AboutContent;
  footer: FooterColumn[];
};
