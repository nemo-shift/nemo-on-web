import { NavLink } from '@/types/nav';

export const NAV_LINKS: NavLink[] = [
  { label: 'About', href: '/about' },
  { label: 'Offerings', href: '/offerings' },
  { label: 'Studio', href: '/offerings/studio' },
  { label: 'Lab', href: '/offerings/lab' },
  { label: 'Diagnosis', href: '/diagnosis' },
  { label: 'Contact', href: '/contact' },
] as const;
