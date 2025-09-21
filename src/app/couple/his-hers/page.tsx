import CategoryPage from '@/components/CategoryPage';

interface HisHersPageProps {
  searchParams: Promise<{
    search?: string;
    sort?: string;
    min_price?: string;
    max_price?: string;
  }>;
}

export default async function HisHersPage({ searchParams }: HisHersPageProps) {
  return (
    <CategoryPage
      categorySlug="his-hers"
      parentCategorySlug="couple"
      title="His & Hers Jewelry"
      description="Discover our romantic his and hers jewelry collection"
      searchParams={searchParams}
    />
  );
}
