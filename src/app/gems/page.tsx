import CategoryPage from '@/components/CategoryPage';

interface GemsPageProps {
  searchParams: {
    search?: string;
    sort?: string;
    min_price?: string;
    max_price?: string;
  };
}

export default async function GemsPage({ searchParams }: GemsPageProps) {
  return (
    <CategoryPage
      categorySlug="gems"
      parentCategorySlug="gems"
      title="Gems & Materials"
      description="Discover our collection of precious gems and materials"
      searchParams={searchParams}
    />
  );
}
