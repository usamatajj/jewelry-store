import CategoryPage from '@/components/CategoryPage';

interface CouplePageProps {
  searchParams: {
    search?: string;
    sort?: string;
    min_price?: string;
    max_price?: string;
  };
}

export default async function CouplePage({ searchParams }: CouplePageProps) {
  return (
    <CategoryPage
      categorySlug="couple"
      parentCategorySlug="couple"
      title="Couple's Jewelry"
      description="Discover our romantic collection of jewelry for couples"
      searchParams={searchParams}
    />
  );
}
