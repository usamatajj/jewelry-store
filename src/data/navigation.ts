import { NavigationItem } from '@/types';
import {
  womenCategories,
  menCategories,
  coupleCategories,
  gemsCategories,
  personalizedCategories,
  giftingCategories,
  ourWorldCategories,
} from './categories';

export const navigationData: NavigationItem[] = [
  {
    name: 'Women',
    href: '/women',
    children: womenCategories.map((cat) => ({
      name: cat.name,
      href: cat.href,
    })),
  },
  {
    name: 'Men',
    href: '/men',
    children: menCategories.map((cat) => ({
      name: cat.name,
      href: cat.href,
    })),
  },
  {
    name: 'Couple',
    href: '/couple',
    children: coupleCategories.map((cat) => ({
      name: cat.name,
      href: cat.href,
    })),
  },
  {
    name: 'Gems',
    href: '/gems',
    children: gemsCategories.map((cat) => ({
      name: cat.name,
      href: cat.href,
    })),
  },
  {
    name: 'Personalized',
    href: '/personalized',
    children: personalizedCategories.map((cat) => ({
      name: cat.name,
      href: cat.href,
    })),
  },
  {
    name: 'Gifting',
    href: '/gifting',
    children: giftingCategories.map((cat) => ({
      name: cat.name,
      href: cat.href,
    })),
  },
  {
    name: 'Our World',
    href: '/our-world',
    children: ourWorldCategories.map((cat) => ({
      name: cat.name,
      href: cat.href,
    })),
  },
];
