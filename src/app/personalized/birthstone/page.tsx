import CategoryPage from '@/components/CategoryPage';

interface BirthstonePageProps {
  searchParams: {
    search?: string;
    sort?: string;
    min_price?: string;
    max_price?: string;
  };
}

export default async function BirthstonePage({ searchParams }: BirthstonePageProps) {
  return (
    <CategoryPage
      categorySlug="birthstone"
      parentCategorySlug="personalized"
      title="Birthstone Jewelry"
      description="Discover our collection of birthstone jewelry"
      searchParams={searchParams}
    />
  );
}
