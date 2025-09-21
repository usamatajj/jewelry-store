import CategoryPage from '@/components/CategoryPage';

interface MatchingSetsPageProps {
  searchParams: {
    search?: string;
    sort?: string;
    min_price?: string;
    max_price?: string;
  };
}

export default async function MatchingSetsPage({
  searchParams,
}: MatchingSetsPageProps) {
  return (
    <CategoryPage
      categorySlug="matching-sets"
      parentCategorySlug="couple"
      title="Matching Sets"
      description="Discover our beautiful matching jewelry sets for couples"
      searchParams={searchParams}
    />
  );
}
