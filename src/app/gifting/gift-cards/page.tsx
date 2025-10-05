import CategoryPage from '@/components/CategoryPage';

interface GiftCardsPageProps {
  searchParams: {
    search?: string;
    sort?: string;
    min_price?: string;
    max_price?: string;
  };
}

export default async function GiftCardsPage({ searchParams }: GiftCardsPageProps) {
  return (
    <CategoryPage
      categorySlug="gift-cards"
      parentCategorySlug="gifting"
      title="Gift Cards"
      description="Discover our gift card options for the perfect present"
      searchParams={searchParams}
    />
  );
}
