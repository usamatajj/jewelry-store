import CategoryPage from '@/components/CategoryPage';

interface DiamondsPageProps {
  searchParams: Promise<{
    search?: string;
    sort?: string;
    min_price?: string;
    max_price?: string;
  }>;
}

export default async function DiamondsPage({ searchParams }: DiamondsPageProps) {
  return (
    <CategoryPage
      categorySlug="diamonds"
      parentCategorySlug="gems"
      title="Diamond Jewelry"
      description="Discover our stunning collection of diamond jewelry"
      searchParams={searchParams}
    />
  );
}
