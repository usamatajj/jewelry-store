import CategoryPage from '@/components/CategoryPage';

interface EngagementRingsPageProps {
  searchParams: {
    search?: string;
    sort?: string;
    min_price?: string;
    max_price?: string;
  };
}

export default async function EngagementRingsPage({
  searchParams,
}: EngagementRingsPageProps) {
  return (
    <CategoryPage
      categorySlug="engagement-rings"
      parentCategorySlug="women"
      title="Engagement Rings"
      description="Discover our stunning collection of engagement rings"
      searchParams={searchParams}
    />
  );
}
