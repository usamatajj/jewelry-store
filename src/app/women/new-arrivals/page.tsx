import CategoryPage from '@/components/CategoryPage';

interface NewArrivalsPageProps {
  searchParams: {
    search?: string;
    sort?: string;
    min_price?: string;
    max_price?: string;
  };
}

export default async function NewArrivalsPage({ searchParams }: NewArrivalsPageProps) {
  return (
    <CategoryPage
      categorySlug="new-arrivals"
      parentCategorySlug="women"
      title="Women's New Arrivals"
      description="Discover our latest jewelry pieces for women"
      searchParams={searchParams}
    />
  );
}
