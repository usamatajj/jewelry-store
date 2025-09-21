'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface SortSelectProps {
  defaultValue?: string;
}

export function SortSelect({ defaultValue = 'newest' }: SortSelectProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value === 'newest') {
      params.delete('sort'); // Remove sort param to use default
    } else {
      params.set('sort', value);
    }

    router.push(`?${params.toString()}`);
  };

  return (
    <Select defaultValue={defaultValue} onValueChange={handleSortChange}>
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
  );
}
