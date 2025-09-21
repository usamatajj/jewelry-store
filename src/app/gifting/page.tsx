import CategoryPage from '@/components/CategoryPage';

interface GiftingPageProps {
  searchParams: {
    search?: string;
    sort?: string;
    min_price?: string;
    max_price?: string;
  };
}

export default async function GiftingPage({ searchParams }: GiftingPageProps) {
  return (
    <CategoryPage
      categorySlug="gifting"
      parentCategorySlug="gifting"
      title="Gift Collection"
      description="Discover our perfect gifts for every occasion"
      searchParams={searchParams}
    />
  );
}
