import CategoryPage from '@/components/CategoryPage';

interface MenPageProps {
  searchParams: {
    search?: string;
    sort?: string;
    min_price?: string;
    max_price?: string;
  };
}

export default async function MenPage({ searchParams }: MenPageProps) {
  return (
    <CategoryPage
      categorySlug="men"
      parentCategorySlug="men"
      title="Men's Jewelry"
      description="Discover our complete collection of jewelry for men"
      searchParams={searchParams}
    />
  );
}
