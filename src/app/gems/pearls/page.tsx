import CategoryPage from '@/components/CategoryPage';

interface PearlsPageProps {
  searchParams: {
    search?: string;
    sort?: string;
    min_price?: string;
    max_price?: string;
  };
}

export default async function PearlsPage({ searchParams }: PearlsPageProps) {
  return (
    <CategoryPage
      categorySlug="pearls"
      parentCategorySlug="gems"
      title="Pearl Jewelry"
      description="Discover our classic collection of pearl jewelry"
      searchParams={searchParams}
    />
  );
}
