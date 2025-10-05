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
import { Search, Filter, Grid, List } from 'lucide-react';
import { createClient } from '@/lib/supabase-server';
import { Product, Category } from '@/types';
import { getCategoryIdBySlug, getSubcategoriesByParent } from '@/lib/category-utils';

async function getWomenProducts() {
  const supabase = await createClient();

  // Get all women's subcategory IDs
  const subcategories = getSubcategoriesByParent('women');
  const subcategoryIds = subcategories
    .map((slug) => getCategoryIdBySlug(slug))
    .filter(Boolean) as string[];

  if (subcategoryIds.length === 0) {
    return [];
  }

  const { data: products, error } = await supabase
    .from('products')
    .select(
      `
      *,
      category:categories(*)
    `
    )
    .in('category_id', subcategoryIds)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching women products:', error);
    return [];
  }

  return products as (Product & { category: Category })[];
}

export default async function WomenPage() {
  const products = await getWomenProducts();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Women&apos;s Jewelry</h1>
        <p className="text-gray-600">
          Discover our stunning collection of jewelry designed specifically for women
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <div className="lg:w-64 space-y-6">
          <div className="space-y-4">
            <h3 className="font-semibold">Search</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input placeholder="Search products..." className="pl-10" />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Category</h3>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="necklaces">Necklaces</SelectItem>
                <SelectItem value="earrings">Earrings</SelectItem>
                <SelectItem value="rings">Rings</SelectItem>
                <SelectItem value="bracelets">Bracelets</SelectItem>
                <SelectItem value="engagement-rings">Engagement Rings</SelectItem>
                <SelectItem value="minimalist">Minimalist</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Price Range</h3>
            <div className="space-y-2">
              <Input type="number" placeholder="Min Price" />
              <Input type="number" placeholder="Max Price" />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Sort By</h3>
            <Select defaultValue="newest">
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
