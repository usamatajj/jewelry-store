'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useCallback, useRef } from 'react';

interface SearchInputProps {
  placeholder?: string;
  defaultValue?: string;
  className?: string;
}

export function SearchInput({
  placeholder = 'Search products...',
  defaultValue = '',
  className = 'pl-10',
}: SearchInputProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const timeoutRef = useRef<NodeJS.Timeout>();

  const handleSearch = useCallback(
    (value: string) => {
      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Set new timeout for debounced search
      timeoutRef.current = setTimeout(() => {
        const params = new URLSearchParams(searchParams.toString());

        if (value.trim()) {
          params.set('search', value.trim());
        } else {
          params.delete('search');
        }

        router.push(`?${params.toString()}`);
      }, 300); // 300ms debounce
    },
    [router, searchParams]
  );

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      <Input
        placeholder={placeholder}
        defaultValue={defaultValue}
        className={className}
        onChange={(e) => handleSearch(e.target.value)}
      />
    </div>
  );
}
