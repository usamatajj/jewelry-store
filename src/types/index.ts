export interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  created_at: string;
  children?: Category[];
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  category_id: string;
  image_url: string;
  created_at: string;
  category?: Category;
}

// Category slug types for type safety
export type MainCategorySlug =
  | 'women'
  | 'men'
  | 'couple'
  | 'gems'
  | 'personalized'
  | 'gifting'
  | 'our-world';

export type WomenCategorySlug =
  | 'necklaces'
  | 'earrings'
  | 'rings'
  | 'bracelets'
  | 'full-sets'
  | 'engagement-rings'
  | 'minimalist'
  | 'solitaire-rings'
  | 'zodiac'
  | 'anklets'
  | 'nose-pins'
  | 'best-sellers'
  | 'new-arrivals';

export type MenCategorySlug = 'wallets' | 'chains' | 'cufflinks' | 'lapel-pins';

export type CoupleCategorySlug = 'matching-sets' | 'his-hers' | 'wedding-bands';

export type GemsCategorySlug =
  | 'diamonds'
  | 'gold'
  | 'silver'
  | 'pearls'
  | 'gemstones';

export type PersonalizedCategorySlug = 'engraved' | 'custom' | 'birthstone';

export type GiftingCategorySlug =
  | 'gift-cards'
  | 'gift-sets'
  | 'special-occasions';

export type OurWorldCategorySlug =
  | 'about'
  | 'sustainability'
  | 'careers'
  | 'contact';

export type AllCategorySlug =
  | MainCategorySlug
  | WomenCategorySlug
  | MenCategorySlug
  | CoupleCategorySlug
  | GemsCategorySlug
  | PersonalizedCategorySlug
  | GiftingCategorySlug
  | OurWorldCategorySlug;

// Category route types
export type CategoryRoute =
  | `/${MainCategorySlug}`
  | `/women/${WomenCategorySlug}`
  | `/men/${MenCategorySlug}`
  | `/couple/${CoupleCategorySlug}`
  | `/gems/${GemsCategorySlug}`
  | `/personalized/${PersonalizedCategorySlug}`
  | `/gifting/${GiftingCategorySlug}`
  | `/our-world/${OurWorldCategorySlug}`;

// Product with typed category
export interface TypedProduct extends Omit<Product, 'category'> {
  category: Category;
}

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
}

export interface User {
  id: string;
  email: string;
  role: 'customer' | 'admin';
  created_at: string;
}

export interface CheckoutForm {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  deliveryAddress?: string;
  deliveryCity?: string;
  deliveryState?: string;
  deliveryZipCode?: string;
  paymentMethod: 'card' | 'upi' | 'netbanking';
  cardNumber?: string;
  expiryDate?: string;
  cvv?: string;
  upiId?: string;
  bankName?: string;
}

export interface NavigationItem {
  name: string;
  href: string;
  children?: NavigationItem[];
}
