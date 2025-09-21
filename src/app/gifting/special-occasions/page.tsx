import CategoryPage from '@/components/CategoryPage';

interface SpecialOccasionsPageProps {
  searchParams: {
    search?: string;
    sort?: string;
    min_price?: string;
    max_price?: string;
  };
}

export default async function SpecialOccasionsPage({
  searchParams,
}: SpecialOccasionsPageProps) {
  return (
    <CategoryPage
      categorySlug="special-occasions"
      parentCategorySlug="gifting"
      title="Special Occasions"
      description="Discover our jewelry for special occasions and celebrations"
      searchParams={searchParams}
    />
  );
}
