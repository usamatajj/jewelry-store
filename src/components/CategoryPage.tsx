import { Badge } from '@/components/ui/badge';
import { SortSelectWithLoading } from '@/components/SortSelectWithLoading';
import { SearchInput } from '@/components/SearchInput';
import { PriceRangeInputs } from '@/components/PriceRangeInputs';
import { ProductsList } from '@/components/ProductsList';
import { createClient } from '@/lib/supabase-server';
import { getCategoryIdBySlug, getSubcategoriesByParent } from '@/lib/category-utils';
import { Product } from '@/types';
import { Suspense } from 'react';

interface CategoryPageProps {
  categorySlug: string;
  parentCategorySlug: string;
  title: string;
  description: string;
  searchParams: Promise<{
    search?: string;
    sort?: string;
    min_price?: string;
    max_price?: string;
  }>;
}

async function getProductsByCategory(
  categorySlug: string,
  parentCategorySlug: string,
  searchParams: {
    search?: string;
    sort?: string;
    min_price?: string;
    max_price?: string;
  }
): Promise<Product[]> {
  const supabase = await createClient();

  const categoryId = getCategoryIdBySlug(categorySlug);
  if (!categoryId) {
    return [];
  }

  let query = supabase.from('products').select('*');

  if (parentCategorySlug) {
    // This is a subcategory - get products from this specific category
    if (parentCategorySlug === 'gems') {
      // For gems subcategories, search by product name/description instead of category
      const searchTerm = categorySlug; // diamonds, gold, silver, etc.
      query = query.ilike('name', `%${searchTerm}%`);
    } else {
      query = query.eq('category_id', categoryId);
    }
  } else {
    // This is a main category - get products from all its subcategories
    const subcategories = getSubcategoriesByParent(categorySlug);
    const subcategoryIds = subcategories
      .map((slug) => getCategoryIdBySlug(slug))
      .filter(Boolean) as string[];

    if (subcategoryIds.length > 0) {
      query = query.in('category_id', subcategoryIds);
    } else {
      return [];
    }
  }

  // Apply filters
  if (searchParams.search) {
    query = query.or(
      `name.ilike.%${searchParams.search}%,description.ilike.%${searchParams.search}%`
    );
  }

  if (searchParams.min_price) {
    query = query.gte('price', parseFloat(searchParams.min_price));
  }

  if (searchParams.max_price) {
    query = query.lte('price', parseFloat(searchParams.max_price));
  }

  // Apply sorting
  switch (searchParams.sort) {
    case 'price-low':
      query = query.order('price', { ascending: true });
      break;
    case 'price-high':
      query = query.order('price', { ascending: false });
      break;
    case 'name':
      query = query.order('name', { ascending: true });
      break;
    case 'newest':
      query = query.order('created_at', { ascending: false });
      break;
    default:
      query = query.order('created_at', { ascending: false });
  }

  const { data: products, error } = await query;

  if (error) {
    console.error(`Error fetching ${categorySlug}:`, error);
    return [];
  }

  return (products as Product[]) || [];
}

export default async function CategoryPage({
  categorySlug,
  parentCategorySlug,
  title,
  description,
  searchParams,
}: CategoryPageProps) {
  const awaitedSearchParams = await searchParams;
  const products = await getProductsByCategory(
    categorySlug,
    parentCategorySlug,
    awaitedSearchParams
  );

  const activeFilters = Object.entries(awaitedSearchParams).filter(([, value]) => value);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">{title}</h1>
        <p className="text-gray-600">{description}</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <div className="lg:w-64 space-y-6">
          <div className="space-y-4">
            <h3 className="font-semibold">Search</h3>
            <SearchInput
              placeholder={`Search ${categorySlug}...`}
              defaultValue={awaitedSearchParams.search || ''}
            />
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Price Range</h3>
            <PriceRangeInputs
              minPriceDefault={awaitedSearchParams.min_price || ''}
              maxPriceDefault={awaitedSearchParams.max_price || ''}
            />
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Sort By</h3>
            <SortSelectWithLoading defaultValue={awaitedSearchParams.sort || 'newest'} />
          </div>

          {/* Active Filters */}
          {activeFilters.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-semibold">Active Filters</h3>
              <div className="flex flex-wrap gap-2">
                {activeFilters.map(([key, value]) => (
                  <Badge key={key} variant="secondary" className="cursor-pointer">
                    {key}: {value}
                    <button className="ml-2 hover:text-destructive">×</button>
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Products Grid */}
        <div className="flex-1">
          <Suspense
            fallback={
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                <span className="ml-2">Loading products...</span>
              </div>
            }
          >
            <ProductsList products={products} categoryName={title} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
