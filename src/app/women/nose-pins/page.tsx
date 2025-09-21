import CategoryPage from '@/components/CategoryPage';

interface NosePinsPageProps {
  searchParams: {
    search?: string;
    sort?: string;
    min_price?: string;
    max_price?: string;
  };
}

export default async function NosePinsPage({
  searchParams,
}: NosePinsPageProps) {
  return (
    <CategoryPage
      categorySlug="nose-pins"
      parentCategorySlug="women"
      title="Nose Pins"
      description="Discover our elegant nose pin collection"
      searchParams={searchParams}
    />
  );
}
