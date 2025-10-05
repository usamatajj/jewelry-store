import CategoryPage from '@/components/CategoryPage';

interface GemstonesPageProps {
  searchParams: {
    search?: string;
    sort?: string;
    min_price?: string;
    max_price?: string;
  };
}

export default async function GemstonesPage({ searchParams }: GemstonesPageProps) {
  return (
    <CategoryPage
      categorySlug="gemstones"
      parentCategorySlug="gems"
      title="Gemstone Jewelry"
      description="Discover our colorful collection of gemstone jewelry"
      searchParams={searchParams}
    />
  );
}
