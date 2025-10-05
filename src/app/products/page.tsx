import { Suspense } from 'react';
import { ProductCard } from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Grid, List } from 'lucide-react';
import { createClient } from '@/lib/supabase-server';
import { Product, Category } from '@/types';
import { getCategoryIdBySlug } from '@/lib/category-utils';

interface ProductsPageProps {
  searchParams: Promise<{
    category?: string;
    search?: string;
    sort?: string;
    min_price?: string;
    max_price?: string;
  }>;
}

async function getProducts(searchParams: ProductsPageProps['searchParams']) {
  const supabase = await createClient();
  const awaitedSearchParams = await searchParams;

  let query = supabase.from('products').select(`
      *,
      category:categories(*)
    `);

  // Apply filters
  if (awaitedSearchParams.category && awaitedSearchParams.category !== 'all') {
    const categoryId = getCategoryIdBySlug(awaitedSearchParams.category);
    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }
  }

  if (awaitedSearchParams.search) {
    query = query.or(
      `name.ilike.%${awaitedSearchParams.search}%,description.ilike.%${awaitedSearchParams.search}%`
    );
  }

  if (awaitedSearchParams.min_price) {
    query = query.gte('price', parseFloat(awaitedSearchParams.min_price));
  }

  if (awaitedSearchParams.max_price) {
    query = query.lte('price', parseFloat(awaitedSearchParams.max_price));
  }

  // Apply sorting
  switch (awaitedSearchParams.sort) {
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
    console.error('Error fetching products:', error);
    return [];
  }

  return products as (Product & { category: Category })[];
}

async function getCategories() {
  const supabase = await createClient();

  const { data: categories, error } = await supabase
    .from('categories')
    .select('*')
    .is('parent_id', null)
    .order('name');

  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }

  return categories as Category[];
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const awaitedSearchParams = await searchParams;
  const [products, categories] = await Promise.all([
    getProducts(searchParams),
    getCategories(),
  ]);

  const activeFilters = Object.entries(awaitedSearchParams).filter(([, value]) => value);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">All Products</h1>
        <p className="text-gray-600">
          Discover our complete collection of exquisite jewelry pieces
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <div className="lg:w-64 space-y-6">
          <div className="space-y-4">
            <h3 className="font-semibold">Search</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search products..."
                defaultValue={awaitedSearchParams.search || ''}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Category</h3>
            <Select defaultValue={awaitedSearchParams.category || 'all'}>
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.slug}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Price Range</h3>
            <div className="space-y-2">
              <Input
                type="number"
                placeholder="Min Price"
                defaultValue={awaitedSearchParams.min_price || ''}
              />
              <Input
                type="number"
                placeholder="Max Price"
                defaultValue={awaitedSearchParams.max_price || ''}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Sort By</h3>
            <Select defaultValue={awaitedSearchParams.sort || 'newest'}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="name">Name A-Z</SelectItem>
              </SelectContent>
            </Select>
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
          <div className="flex items-center justify-between mb-6">
            <p className="text-gray-600">Showing {products.length} products</p>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="icon">
                <Grid className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Suspense fallback={<div>Loading products...</div>}>
            {products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No products found</p>
                <p className="text-gray-400">
                  Try adjusting your filters or search terms
                </p>
              </div>
            )}
          </Suspense>
        </div>
      </div>
    </div>
  );
}
