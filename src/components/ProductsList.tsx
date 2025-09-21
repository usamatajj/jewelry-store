'use client';

import { ProductCard } from '@/components/ProductCard';
import { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { Grid, List } from 'lucide-react';
import { useState } from 'react';

interface ProductsListProps {
  products: Product[];
  categoryName: string;
}

export function ProductsList({ products, categoryName }: ProductsListProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  return (
    <div className="flex-1">
      <div className="flex items-center justify-between mb-6">
        <p className="text-gray-600">
          Showing {products.length} {categoryName.toLowerCase()}
        </p>
        <div className="flex items-center space-x-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {products.length > 0 ? (
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
              : 'space-y-4'
          }
        >
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              variant={viewMode}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            No {categoryName.toLowerCase()} found
          </p>
          <p className="text-gray-400">
            Try adjusting your filters or search terms
          </p>
        </div>
      )}
    </div>
  );
}
