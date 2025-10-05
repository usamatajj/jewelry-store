import CategoryPage from '@/components/CategoryPage';

interface MenChainsPageProps {
  searchParams: {
    search?: string;
    sort?: string;
    min_price?: string;
    max_price?: string;
  };
}

export default async function MenChainsPage({ searchParams }: MenChainsPageProps) {
  return (
    <CategoryPage
      categorySlug="chains"
      parentCategorySlug="men"
      title="Men's Chains"
      description="Discover our bold collection of chains for men"
      searchParams={searchParams}
    />
  );
}
