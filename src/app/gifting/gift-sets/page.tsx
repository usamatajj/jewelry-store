import CategoryPage from '@/components/CategoryPage';

interface GiftSetsPageProps {
  searchParams: {
    search?: string;
    sort?: string;
    min_price?: string;
    max_price?: string;
  };
}

export default async function GiftSetsPage({
  searchParams,
}: GiftSetsPageProps) {
  return (
    <CategoryPage
      categorySlug="gift-sets"
      parentCategorySlug="gifting"
      title="Gift Sets"
      description="Discover our curated gift sets for special occasions"
      searchParams={searchParams}
    />
  );
}
