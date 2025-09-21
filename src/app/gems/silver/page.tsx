import CategoryPage from '@/components/CategoryPage';

interface SilverPageProps {
  searchParams: {
    search?: string;
    sort?: string;
    min_price?: string;
    max_price?: string;
  };
}

export default async function SilverPage({ searchParams }: SilverPageProps) {
  return (
    <CategoryPage
      categorySlug="silver"
      parentCategorySlug="gems"
      title="Silver Jewelry"
      description="Discover our elegant collection of silver jewelry"
      searchParams={searchParams}
    />
  );
}
