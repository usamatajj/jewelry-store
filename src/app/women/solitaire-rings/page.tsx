import CategoryPage from '@/components/CategoryPage';

interface SolitaireRingsPageProps {
  searchParams: {
    search?: string;
    sort?: string;
    min_price?: string;
    max_price?: string;
  };
}

export default async function SolitaireRingsPage({
  searchParams,
}: SolitaireRingsPageProps) {
  return (
    <CategoryPage
      categorySlug="solitaire-rings"
      parentCategorySlug="women"
      title="Solitaire Rings"
      description="Discover our beautiful solitaire ring collection"
      searchParams={searchParams}
    />
  );
}
