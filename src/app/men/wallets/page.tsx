import CategoryPage from '@/components/CategoryPage';

interface MenWalletsPageProps {
  searchParams: Promise<{
    search?: string;
    sort?: string;
    min_price?: string;
    max_price?: string;
  }>;
}

export default async function MenWalletsPage({
  searchParams,
}: MenWalletsPageProps) {
  return (
    <CategoryPage
      categorySlug="wallets"
      parentCategorySlug="men"
      title="Men's Wallets"
      description="Discover our premium collection of wallets for men"
      searchParams={searchParams}
    />
  );
}
