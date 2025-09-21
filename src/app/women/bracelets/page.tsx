import CategoryPage from '@/components/CategoryPage';

interface BraceletsPageProps {
  searchParams: {
    search?: string;
    sort?: string;
    min_price?: string;
    max_price?: string;
  };
}

export default async function BraceletsPage({
  searchParams,
}: BraceletsPageProps) {
  return (
    <CategoryPage
      categorySlug="bracelets"
      parentCategorySlug="women"
      title="Women's Bracelets"
      description="Discover our exquisite collection of bracelets for women"
      searchParams={searchParams}
    />
  );
}
