import CategoryPage from '@/components/CategoryPage';

interface NecklacesPageProps {
  searchParams: Promise<{
    search?: string;
    sort?: string;
    min_price?: string;
    max_price?: string;
  }>;
}

export default async function NecklacesPage({ searchParams }: NecklacesPageProps) {
  return (
    <CategoryPage
      categorySlug="necklaces"
      parentCategorySlug="women"
      title="Women's Necklaces"
      description="Discover our exquisite collection of necklaces for women"
      searchParams={searchParams}
    />
  );
}
