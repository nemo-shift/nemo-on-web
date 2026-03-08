// 전역 타입 정의
// 프로젝트 공통 타입을 여기에 export

export type ButtonProps = {
  label: string;
  onClick?: () => void;
  isActive?: boolean;
  className?: string;
};

export type { HeroSectionProps, HeroBigTypoProps } from './hero';

export type {
  BrandStoryScene,
  MessageBubble,
  AboutContent,
  FooterColumn,
  NavLink,
  HomeContent,
} from './home';
