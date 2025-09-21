import CategoryPage from '@/components/CategoryPage';

interface MinimalistPageProps {
  searchParams: {
    search?: string;
    sort?: string;
    min_price?: string;
    max_price?: string;
  };
}

export default async function MinimalistPage({
  searchParams,
}: MinimalistPageProps) {
  return (
    <CategoryPage
      categorySlug="minimalist"
      parentCategorySlug="women"
      title="Minimalist Jewelry"
      description="Discover our elegant minimalist jewelry collection"
      searchParams={searchParams}
    />
  );
}
