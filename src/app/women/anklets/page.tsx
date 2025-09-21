import CategoryPage from '@/components/CategoryPage';

interface AnkletsPageProps {
  searchParams: {
    search?: string;
    sort?: string;
    min_price?: string;
    max_price?: string;
  };
}

export default async function AnkletsPage({ searchParams }: AnkletsPageProps) {
  return (
    <CategoryPage
      categorySlug="anklets"
      parentCategorySlug="women"
      title="Anklets"
      description="Discover our delicate anklet collection"
      searchParams={searchParams}
    />
  );
}
