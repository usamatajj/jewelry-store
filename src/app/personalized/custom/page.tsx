import CategoryPage from '@/components/CategoryPage';

interface CustomPageProps {
  searchParams: {
    search?: string;
    sort?: string;
    min_price?: string;
    max_price?: string;
  };
}

export default async function CustomPage({ searchParams }: CustomPageProps) {
  return (
    <CategoryPage
      categorySlug="custom"
      parentCategorySlug="personalized"
      title="Custom Designs"
      description="Discover our custom jewelry design services"
      searchParams={searchParams}
    />
  );
}
