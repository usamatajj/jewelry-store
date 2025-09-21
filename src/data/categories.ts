import {
  Category,
  MainCategorySlug,
  WomenCategorySlug,
  MenCategorySlug,
  CoupleCategorySlug,
  GemsCategorySlug,
  PersonalizedCategorySlug,
  GiftingCategorySlug,
  OurWorldCategorySlug,
} from '@/types';

// Main categories data
export const mainCategories: {
  slug: MainCategorySlug;
  name: string;
  href: string;
}[] = [
  { slug: 'women', name: 'Women', href: '/women' },
  { slug: 'men', name: 'Men', href: '/men' },
  { slug: 'couple', name: 'Couple', href: '/couple' },
  { slug: 'gems', name: 'Gems', href: '/gems' },
  { slug: 'personalized', name: 'Personalized', href: '/personalized' },
  { slug: 'gifting', name: 'Gifting', href: '/gifting' },
  { slug: 'our-world', name: 'Our World', href: '/our-world' },
];

// Women subcategories
export const womenCategories: {
  slug: WomenCategorySlug;
  name: string;
  href: string;
}[] = [
  { slug: 'necklaces', name: 'Necklaces', href: '/women/necklaces' },
  { slug: 'earrings', name: 'Earrings', href: '/women/earrings' },
  { slug: 'rings', name: 'Rings', href: '/women/rings' },
  { slug: 'bracelets', name: 'Bracelets', href: '/women/bracelets' },
  { slug: 'full-sets', name: 'Full Sets', href: '/women/full-sets' },
  {
    slug: 'engagement-rings',
    name: 'Engagement Rings',
    href: '/women/engagement-rings',
  },
  { slug: 'minimalist', name: 'Minimalist', href: '/women/minimalist' },
  {
    slug: 'solitaire-rings',
    name: 'Solitaire Rings',
    href: '/women/solitaire-rings',
  },
  { slug: 'zodiac', name: 'Zodiac', href: '/women/zodiac' },
  { slug: 'anklets', name: 'Anklets', href: '/women/anklets' },
  { slug: 'nose-pins', name: 'Nose Pins', href: '/women/nose-pins' },
  { slug: 'best-sellers', name: 'Best Sellers', href: '/women/best-sellers' },
  { slug: 'new-arrivals', name: 'New Arrivals', href: '/women/new-arrivals' },
];

// Men subcategories
export const menCategories: {
  slug: MenCategorySlug;
  name: string;
  href: string;
}[] = [
  { slug: 'wallets', name: 'Wallets', href: '/men/wallets' },
  { slug: 'chains', name: 'Chains', href: '/men/chains' },
  { slug: 'cufflinks', name: 'Cufflinks', href: '/men/cufflinks' },
  { slug: 'lapel-pins', name: 'Lapel Pins', href: '/men/lapel-pins' },
];

// Couple subcategories
export const coupleCategories: {
  slug: CoupleCategorySlug;
  name: string;
  href: string;
}[] = [
  {
    slug: 'matching-sets',
    name: 'Matching Sets',
    href: '/couple/matching-sets',
  },
  { slug: 'his-hers', name: 'His & Hers', href: '/couple/his-hers' },
  {
    slug: 'wedding-bands',
    name: 'Wedding Bands',
    href: '/couple/wedding-bands',
  },
];

// Gems subcategories
export const gemsCategories: {
  slug: GemsCategorySlug;
  name: string;
  href: string;
}[] = [
  { slug: 'diamonds', name: 'Diamonds', href: '/gems/diamonds' },
  { slug: 'gold', name: 'Gold', href: '/gems/gold' },
  { slug: 'silver', name: 'Silver', href: '/gems/silver' },
  { slug: 'pearls', name: 'Pearls', href: '/gems/pearls' },
  { slug: 'gemstones', name: 'Gemstones', href: '/gems/gemstones' },
];

// Personalized subcategories
export const personalizedCategories: {
  slug: PersonalizedCategorySlug;
  name: string;
  href: string;
}[] = [
  {
    slug: 'engraved',
    name: 'Engraved Jewelry',
    href: '/personalized/engraved',
  },
  { slug: 'custom', name: 'Custom Designs', href: '/personalized/custom' },
  {
    slug: 'birthstone',
    name: 'Birthstone Jewelry',
    href: '/personalized/birthstone',
  },
];

// Gifting subcategories
export const giftingCategories: {
  slug: GiftingCategorySlug;
  name: string;
  href: string;
}[] = [
  { slug: 'gift-cards', name: 'Gift Cards', href: '/gifting/gift-cards' },
  { slug: 'gift-sets', name: 'Gift Sets', href: '/gifting/gift-sets' },
  {
    slug: 'special-occasions',
    name: 'Special Occasions',
    href: '/gifting/special-occasions',
  },
];

// Our World subcategories
export const ourWorldCategories: {
  slug: OurWorldCategorySlug;
  name: string;
  href: string;
}[] = [
  { slug: 'about', name: 'About Us', href: '/our-world/about' },
  {
    slug: 'sustainability',
    name: 'Sustainability',
    href: '/our-world/sustainability',
  },
  { slug: 'careers', name: 'Careers', href: '/our-world/careers' },
  { slug: 'contact', name: 'Contact', href: '/our-world/contact' },
];

// All categories combined
export const allCategories = [
  ...mainCategories,
  ...womenCategories,
  ...menCategories,
  ...coupleCategories,
  ...gemsCategories,
  ...personalizedCategories,
  ...giftingCategories,
  ...ourWorldCategories,
];

// Category lookup functions
export const getCategoryBySlug = (slug: string) => {
  return allCategories.find((category) => category.slug === slug);
};

export const getCategoryByHref = (href: string) => {
  return allCategories.find((category) => category.href === href);
};

export const getSubcategoriesByParent = (parentSlug: MainCategorySlug) => {
  switch (parentSlug) {
    case 'women':
      return womenCategories;
    case 'men':
      return menCategories;
    case 'couple':
      return coupleCategories;
    case 'gems':
      return gemsCategories;
    case 'personalized':
      return personalizedCategories;
    case 'gifting':
      return giftingCategories;
    case 'our-world':
      return ourWorldCategories;
    default:
      return [];
  }
};

// Category validation
export const isValidCategorySlug = (slug: string): slug is MainCategorySlug => {
  return mainCategories.some((category) => category.slug === slug);
};

export const isValidSubcategorySlug = (
  parentSlug: MainCategorySlug,
  subSlug: string
): boolean => {
  const subcategories = getSubcategoriesByParent(parentSlug);
  return subcategories.some((category) => category.slug === subSlug);
};

// Route validation
export const isValidCategoryRoute = (pathname: string): boolean => {
  return allCategories.some((category) => category.href === pathname);
};
