import CategoryPage from '@/components/CategoryPage';

interface EngravedPageProps {
  searchParams: {
    search?: string;
    sort?: string;
    min_price?: string;
    max_price?: string;
  };
}

export default async function EngravedPage({ searchParams }: EngravedPageProps) {
  return (
    <CategoryPage
      categorySlug="engraved"
      parentCategorySlug="personalized"
      title="Engraved Jewelry"
      description="Discover our collection of custom engraved jewelry"
      searchParams={searchParams}
    />
  );
}
