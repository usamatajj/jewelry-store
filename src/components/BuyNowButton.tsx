'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Zap, ShieldAlert } from 'lucide-react';
import { Product } from '@/types';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface BuyNowButtonProps {
  product: Product;
  className?: string;
}

export function BuyNowButton({ product, className }: BuyNowButtonProps) {
  const router = useRouter();
  const { addItem } = useCart();
  const { user } = useAuth();

  const handleBuyNow = () => {
    // Prevent admins from buying
    if (user?.role === 'admin') {
      toast.error('Admin accounts cannot purchase items');
      return;
    }

    // Add to cart and redirect to checkout
    addItem(product, 1);
    router.push('/checkout');
  };

  // If admin, show disabled button with tooltip
  if (user?.role === 'admin') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className={className}>
              <Button variant="outline" disabled className="w-full">
                <ShieldAlert className="mr-2 h-4 w-4" />
                Admin Account
              </Button>
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p>Admin accounts cannot purchase items</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <Button onClick={handleBuyNow} variant="outline" className={className}>
      <Zap className="mr-2 h-4 w-4" />
      Buy Now
    </Button>
  );
}
