import CategoryPage from '@/components/CategoryPage';

interface BestSellersPageProps {
  searchParams: {
    search?: string;
    sort?: string;
    min_price?: string;
    max_price?: string;
  };
}

export default async function BestSellersPage({ searchParams }: BestSellersPageProps) {
  return (
    <CategoryPage
      categorySlug="best-sellers"
      parentCategorySlug="women"
      title="Women's Best Sellers"
      description="Discover our most popular jewelry pieces for women"
      searchParams={searchParams}
    />
  );
}
