import { Category } from '@/types';

// Database category mapping based on actual database structure
export const DB_CATEGORY_MAPPING = {
  // Main categories
  women: '52f2afb9-eeb6-4398-83fa-5a95e833a775',
  men: '4d6620a4-8c46-4be3-bff1-2cd6f799b96b',
  couple: '68db40f0-f46b-4de1-9d9d-5b61b6220a5e',
  gems: 'da602aad-0407-4815-9d85-4fce781de919',
  personalized: '75dfcdde-8010-49a5-b867-48e11922e485',
  gifting: '2cb55022-ce64-4c50-8c59-a4c9ba3f9ac9',
  'our-world': '09cd84f3-ec80-432b-b72c-5ce3b91952f2',

  // Women subcategories
  necklaces: '1f5b3382-de21-4c84-bb2f-a039f77f6b5a',
  earrings: '066ec8a2-5de1-4bc3-9f16-c807e1403c66',
  rings: 'a96947d5-8e89-4211-a012-34a66a98b136',
  bracelets: '4549532f-e7f7-490f-bde9-83dc360c5b12',
  'full-sets': 'fca6285a-14d4-4dcd-a08b-f73292cb28fa',
  'engagement-rings': 'c66b1d1c-f060-428d-8a61-b8db456f6c96',
  minimalist: 'f3e85e7d-1c7f-4117-95cc-41c17c51b300',
  'solitaire-rings': 'aabf84aa-f6cd-47ed-ad26-36e211e4fd0c',
  zodiac: 'c73a5d2e-1bc6-4eaa-8413-6889c5854358',
  anklets: 'c52f05cd-f4c4-4354-87d4-72ddb8e9b657',
  'nose-pins': 'b2713d0f-c6b9-43b5-b791-15ab5e683321',
  'best-sellers': '0a18c1b3-b8fd-4aa3-8501-6468b8778fdb',
  'new-arrivals': '6bc3d1cd-3d27-4141-9a20-160ad5b5ab49',

  // Men subcategories
  wallets: '441279d6-7854-4d89-bb1f-011f1f1abf77',
  chains: '0589c600-ee13-41f4-bfe5-1ba5b87fa6f9',
  cufflinks: 'f345e0ed-b0ac-478f-8981-ef297402317a',
  'lapel-pins': '69536728-be84-4939-b43c-7a3b52b1d22c',

  // Couple subcategories
  'matching-sets': '2b8167be-e4b7-4fca-a621-5f55c242c1f1',
  'his-hers': '8e4c08a8-2b72-4e02-96ae-11ad690ccdef',
  'wedding-bands': '23a15623-7b1c-432a-8252-48a087482260',

  // Gems subcategories
  diamonds: 'c67002f1-3993-4266-88dd-d48e11d96fae',
  gold: '9dfea8a3-f778-433b-97be-8424af7d7207',
  silver: '1bb1a8c5-8e56-4eab-a2a4-c0b9f182c65a',
  pearls: '0c7e2955-baf5-431f-952c-89c62c1c9b77',
  gemstones: 'b0f0988c-b6bc-4787-a549-150f9902448d',

  // Personalized subcategories
  engraved: 'd564e6cb-9866-43f6-9973-0e1b527bd869',
  custom: '542b8f92-55f1-4f3d-a5bf-23ff27fe7bb7',
  birthstone: 'c44b8082-a36c-4969-9fc0-ba926c15564b',

  // Gifting subcategories
  'gift-cards': 'eeb3f73c-8337-4b79-89be-6b48b3a525e8',
  'gift-sets': 'bdbb49ad-c3c6-4c83-ad63-f0e63ac37bc1',
  'special-occasions': 'd3706de6-2811-42dd-929e-94880fdaa35e',

  // Our World subcategories
  about: '35aecf26-e0a1-4f63-bd1b-1fe9d50dea44',
  sustainability: 'e9540c9c-d257-4b69-bbd7-52d36b05326d',
  careers: '0492968e-03a6-4119-88ab-5e7532216677',
  contact: '29e9edaf-2e7f-407e-81e8-4f1bce623038',
} as const;

// Reverse mapping from ID to slug
export const DB_ID_TO_SLUG = Object.fromEntries(
  Object.entries(DB_CATEGORY_MAPPING).map(([slug, id]) => [id, slug])
) as Record<string, string>;

// Category hierarchy mapping
export const CATEGORY_HIERARCHY = {
  // Main categories with their children
  women: [
    'necklaces',
    'earrings',
    'rings',
    'bracelets',
    'full-sets',
    'engagement-rings',
    'minimalist',
    'solitaire-rings',
    'zodiac',
    'anklets',
    'nose-pins',
    'best-sellers',
    'new-arrivals',
  ],
  men: ['wallets', 'chains', 'cufflinks', 'lapel-pins'],
  couple: ['matching-sets', 'his-hers', 'wedding-bands'],
  gems: ['diamonds', 'gold', 'silver', 'pearls', 'gemstones'],
  personalized: ['engraved', 'custom', 'birthstone'],
  gifting: ['gift-cards', 'gift-sets', 'special-occasions'],
  'our-world': ['about', 'sustainability', 'careers', 'contact'],
} as const;

// Utility functions
export const getCategoryIdBySlug = (slug: string): string | undefined => {
  return DB_CATEGORY_MAPPING[slug as keyof typeof DB_CATEGORY_MAPPING];
};

export const getCategorySlugById = (id: string): string | undefined => {
  return DB_ID_TO_SLUG[id];
};

export const getParentCategorySlug = (
  subcategorySlug: string
): string | undefined => {
  for (const [parentSlug, children] of Object.entries(CATEGORY_HIERARCHY)) {
    if ((children as readonly string[]).includes(subcategorySlug)) {
      return parentSlug;
    }
  }
  return undefined;
};

export const getSubcategoriesByParent = (
  parentSlug: string
): readonly string[] => {
  return (
    CATEGORY_HIERARCHY[parentSlug as keyof typeof CATEGORY_HIERARCHY] || []
  );
};

export const isValidCategorySlug = (slug: string): boolean => {
  return slug in DB_CATEGORY_MAPPING;
};

export const isValidSubcategorySlug = (
  parentSlug: string,
  subSlug: string
): boolean => {
  const subcategories = getSubcategoriesByParent(parentSlug);
  return subcategories.includes(subSlug);
};

// Database query helpers
export const buildCategoryQuery = (
  categorySlug: string,
  parentCategorySlug?: string
) => {
  const categoryId = getCategoryIdBySlug(categorySlug);
  if (!categoryId) return null;

  if (parentCategorySlug) {
    // This is a subcategory
    const parentId = getCategoryIdBySlug(parentCategorySlug);
    return {
      category_id: categoryId,
      parent_category_id: parentId,
    };
  } else {
    // This is a main category - get all products from its subcategories
    const subcategories = getSubcategoriesByParent(categorySlug);
    const subcategoryIds = subcategories
      .map((slug) => getCategoryIdBySlug(slug))
      .filter(Boolean) as string[];

    return {
      category_ids: subcategoryIds,
      parent_category_id: categoryId,
    };
  }
};

/**
 * Organize categories into a hierarchical structure
 * @param categories - Flat array of categories from database
 * @returns Array of parent categories with children nested
 */
export const organizeCategories = (categories: Category[]): Category[] => {
  const parentCategories = categories.filter((cat) => !cat.parent_id);
  const childCategories = categories.filter((cat) => cat.parent_id);

  return parentCategories.map((parent) => ({
    ...parent,
    children: childCategories.filter((child) => child.parent_id === parent.id),
  }));
};

/**
 * Get all parent categories
 * @param categories - Flat array of categories
 * @returns Array of parent categories only
 */
export const getParentCategories = (categories: Category[]): Category[] => {
  return categories.filter((cat) => !cat.parent_id);
};

/**
 * Get children of a specific parent category
 * @param categories - Flat array of categories
 * @param parentId - ID of the parent category
 * @returns Array of child categories
 */
export const getChildCategories = (
  categories: Category[],
  parentId: string
): Category[] => {
  return categories.filter((cat) => cat.parent_id === parentId);
};
