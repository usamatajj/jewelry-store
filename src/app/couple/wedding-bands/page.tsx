import CategoryPage from '@/components/CategoryPage';

interface WeddingBandsPageProps {
  searchParams: {
    search?: string;
    sort?: string;
    min_price?: string;
    max_price?: string;
  };
}

export default async function WeddingBandsPage({
  searchParams,
}: WeddingBandsPageProps) {
  return (
    <CategoryPage
      categorySlug="wedding-bands"
      parentCategorySlug="couple"
      title="Wedding Bands"
      description="Discover our elegant collection of wedding bands for couples"
      searchParams={searchParams}
    />
  );
}
