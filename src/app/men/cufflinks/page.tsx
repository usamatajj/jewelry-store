import CategoryPage from '@/components/CategoryPage';

interface MenCufflinksPageProps {
  searchParams: {
    search?: string;
    sort?: string;
    min_price?: string;
    max_price?: string;
  };
}

export default async function MenCufflinksPage({ searchParams }: MenCufflinksPageProps) {
  return (
    <CategoryPage
      categorySlug="cufflinks"
      parentCategorySlug="men"
      title="Men's Cufflinks"
      description="Discover our elegant collection of cufflinks for men"
      searchParams={searchParams}
    />
  );
}
