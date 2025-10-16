'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Check, ShieldAlert } from 'lucide-react';
import { Product } from '@/types';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface AddToCartButtonProps {
  product: Product;
  className?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function AddToCartButton({
  product,
  className,
  variant = 'default',
  size = 'default',
}: AddToCartButtonProps) {
  const { addItem } = useCart();
  const { user } = useAuth();
  const [isAdded, setIsAdded] = useState(false);

  const handleAddToCart = () => {
    // Prevent admins from adding items to cart
    if (user?.role === 'admin') {
      toast.error('Admin accounts cannot purchase items');
      return;
    }

    addItem(product);
    setIsAdded(true);

    // Reset the added state after 2 seconds
    setTimeout(() => {
      setIsAdded(false);
    }, 2000);
  };

  // If admin, show disabled button with tooltip
  if (user?.role === 'admin') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className={cn('inline-block', className)}>
              <Button
                onClick={handleAddToCart}
                className="transition-all duration-200"
                variant={variant}
                size={size}
                disabled
              >
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
    <Button
      onClick={handleAddToCart}
      className={cn(
        'transition-all duration-200',
        isAdded && 'bg-green-600 hover:bg-green-700',
        className
      )}
      variant={isAdded ? 'default' : variant}
      size={size}
      disabled={isAdded}
    >
      {isAdded ? (
        <>
          <Check className="mr-2 h-4 w-4" />
          Added to Cart
        </>
      ) : (
        <>
          <ShoppingCart className="mr-2 h-4 w-4" />
          Add to Cart
        </>
      )}
    </Button>
  );
}
