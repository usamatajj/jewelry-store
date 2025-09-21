import CategoryPage from '@/components/CategoryPage';

interface GoldPageProps {
  searchParams: {
    search?: string;
    sort?: string;
    min_price?: string;
    max_price?: string;
  };
}

export default async function GoldPage({ searchParams }: GoldPageProps) {
  return (
    <CategoryPage
      categorySlug="gold"
      parentCategorySlug="gems"
      title="Gold Jewelry"
      description="Discover our luxurious collection of gold jewelry"
      searchParams={searchParams}
    />
  );
}
