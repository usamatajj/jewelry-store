import CategoryPage from '@/components/CategoryPage';

interface MenLapelPinsPageProps {
  searchParams: {
    search?: string;
    sort?: string;
    min_price?: string;
    max_price?: string;
  };
}

export default async function MenLapelPinsPage({
  searchParams,
}: MenLapelPinsPageProps) {
  return (
    <CategoryPage
      categorySlug="lapel-pins"
      parentCategorySlug="men"
      title="Men's Lapel Pins"
      description="Discover our sophisticated collection of lapel pins for men"
      searchParams={searchParams}
    />
  );
}
