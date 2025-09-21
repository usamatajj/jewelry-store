'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

interface SortSelectWithLoadingProps {
  defaultValue?: string;
}

export function SortSelectWithLoading({
  defaultValue = 'newest',
}: SortSelectWithLoadingProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  const handleSortChange = async (value: string) => {
    setIsLoading(true);

    const params = new URLSearchParams(searchParams.toString());

    if (value === 'newest') {
      params.delete('sort'); // Remove sort param to use default
    } else {
      params.set('sort', value);
    }

    // Add a small delay to show loading state
    await new Promise((resolve) => setTimeout(resolve, 100));

    router.push(`?${params.toString()}`);

    // Reset loading state after navigation
    setTimeout(() => setIsLoading(false), 500);
  };

  return (
    <div className="relative">
      <Select
        defaultValue={defaultValue}
        onValueChange={handleSortChange}
        disabled={isLoading}
      >
        <SelectTrigger className={isLoading ? 'opacity-50' : ''}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="newest">Newest First</SelectItem>
          <SelectItem value="price-low">Price: Low to High</SelectItem>
          <SelectItem value="price-high">Price: High to Low</SelectItem>
          <SelectItem value="name">Name A-Z</SelectItem>
        </SelectContent>
      </Select>
      {isLoading && (
        <div className="absolute right-8 top-1/2 transform -translate-y-1/2">
          <Loader2 className="h-4 w-4 animate-spin" />
        </div>
      )}
    </div>
  );
}
