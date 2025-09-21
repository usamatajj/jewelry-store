'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { useCallback, useRef } from 'react';

interface PriceRangeInputsProps {
  minPriceDefault?: string;
  maxPriceDefault?: string;
}

export function PriceRangeInputs({
  minPriceDefault = '',
  maxPriceDefault = '',
}: PriceRangeInputsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const timeoutRef = useRef<NodeJS.Timeout>();

  const updatePriceFilters = useCallback(
    (minPrice?: string, maxPrice?: string) => {
      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Set new timeout for debounced update
      timeoutRef.current = setTimeout(() => {
        const params = new URLSearchParams(searchParams.toString());

        if (minPrice && minPrice.trim()) {
          params.set('min_price', minPrice.trim());
        } else {
          params.delete('min_price');
        }

        if (maxPrice && maxPrice.trim()) {
          params.set('max_price', maxPrice.trim());
        } else {
          params.delete('max_price');
        }

        router.push(`?${params.toString()}`);
      }, 500); // 500ms debounce for price filters
    },
    [router, searchParams]
  );

  return (
    <div className="space-y-2">
      <Input
        type="number"
        placeholder="Min Price"
        defaultValue={minPriceDefault}
        onChange={(e) => {
          const maxPrice = searchParams.get('max_price') || '';
          updatePriceFilters(e.target.value, maxPrice);
        }}
      />
      <Input
        type="number"
        placeholder="Max Price"
        defaultValue={maxPriceDefault}
        onChange={(e) => {
          const minPrice = searchParams.get('min_price') || '';
          updatePriceFilters(minPrice, e.target.value);
        }}
      />
    </div>
  );
}
