import CategoryPage from '@/components/CategoryPage';

interface EarringsPageProps {
  searchParams: Promise<{
    search?: string;
    sort?: string;
    min_price?: string;
    max_price?: string;
  }>;
}

export default async function EarringsPage({ searchParams }: EarringsPageProps) {
  return (
    <CategoryPage
      categorySlug="earrings"
      parentCategorySlug="women"
      title="Women's Earrings"
      description="Discover our beautiful collection of earrings for women"
      searchParams={searchParams}
    />
  );
}
