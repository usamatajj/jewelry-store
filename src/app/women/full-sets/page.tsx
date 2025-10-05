import CategoryPage from '@/components/CategoryPage';

interface FullSetsPageProps {
  searchParams: {
    search?: string;
    sort?: string;
    min_price?: string;
    max_price?: string;
  };
}

export default async function FullSetsPage({ searchParams }: FullSetsPageProps) {
  return (
    <CategoryPage
      categorySlug="full-sets"
      parentCategorySlug="women"
      title="Women's Full Sets"
      description="Discover our complete jewelry sets for women"
      searchParams={searchParams}
    />
  );
}
