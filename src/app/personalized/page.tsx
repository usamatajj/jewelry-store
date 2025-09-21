import CategoryPage from '@/components/CategoryPage';

interface PersonalizedPageProps {
  searchParams: {
    search?: string;
    sort?: string;
    min_price?: string;
    max_price?: string;
  };
}

export default async function PersonalizedPage({
  searchParams,
}: PersonalizedPageProps) {
  return (
    <CategoryPage
      categorySlug="personalized"
      parentCategorySlug="personalized"
      title="Personalized Jewelry"
      description="Discover our custom and personalized jewelry collection"
      searchParams={searchParams}
    />
  );
}
