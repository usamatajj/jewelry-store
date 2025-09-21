import CategoryPage from '@/components/CategoryPage';

interface ZodiacPageProps {
  searchParams: {
    search?: string;
    sort?: string;
    min_price?: string;
    max_price?: string;
  };
}

export default async function ZodiacPage({ searchParams }: ZodiacPageProps) {
  return (
    <CategoryPage
      categorySlug="zodiac"
      parentCategorySlug="women"
      title="Zodiac Jewelry"
      description="Discover our mystical zodiac jewelry collection"
      searchParams={searchParams}
    />
  );
}
