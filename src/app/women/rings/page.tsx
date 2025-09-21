import CategoryPage from '@/components/CategoryPage';

interface RingsPageProps {
  searchParams: Promise<{
    search?: string;
    sort?: string;
    min_price?: string;
    max_price?: string;
  }>;
}

export default async function RingsPage({ searchParams }: RingsPageProps) {
  return (
    <CategoryPage
      categorySlug="rings"
      parentCategorySlug="women"
      title="Women's Rings"
      description="Discover our exquisite collection of rings for women"
      searchParams={searchParams}
    />
  );
}
