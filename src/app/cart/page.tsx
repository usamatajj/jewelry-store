'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  ArrowLeft,
  ShoppingBag,
  Heart,
} from 'lucide-react';
import { useCart } from '@/contexts/CartContext';

export default function CartPage() {
  const { state, updateQuantity, removeItem, clearCart } = useCart();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  if (state.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <ShoppingCart className="h-24 w-24 text-gray-300 mx-auto mb-6" />
          <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
          <p className="text-gray-600 mb-8">
            Looks like you haven&apos;t added any items to your cart yet.
          </p>
          <Link href="/products">
            <Button size="lg" className="w-full">
              <ShoppingBag className="mr-2 h-5 w-5" />
              Start Shopping
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center space-x-4 mb-8">
        <Link href="/products">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Shopping Cart</h1>
        <Badge variant="secondary" className="ml-auto">
          {state.itemCount} {state.itemCount === 1 ? 'item' : 'items'}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {state.items.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="relative w-20 h-20 flex-shrink-0">
                    <Image
                      src={item.product.images[0]}
                      alt={item.product.name}
                      fill
                      className="object-cover rounded-lg"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <Link href={`/products/${item.product.slug}`}>
                      <h3 className="font-semibold text-lg hover:text-primary transition-colors">
                        {item.product.name}
                      </h3>
                    </Link>
                    <p className="text-gray-600 text-sm line-clamp-2">
                      {item.product.description}
                    </p>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        {item.product.category?.name}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex flex-col items-end space-y-4">
                    <div className="text-right">
                      <p className="text-lg font-semibold">
                        {formatPrice(item.product.price * item.quantity)}
                      </p>
                      <p className="text-sm text-gray-600">
                        {formatPrice(item.product.price)} each
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() =>
                          updateQuantity(item.product.id, item.quantity - 1)
                        }
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center font-medium">
                        {item.quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() =>
                          updateQuantity(item.product.id, item.quantity + 1)
                        }
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => removeItem(item.product.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Remove
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          <div className="flex justify-between items-center pt-4">
            <Button
              variant="outline"
              onClick={clearCart}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear Cart
            </Button>

            <Link href="/products">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-8">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-6">Order Summary</h2>

              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>Subtotal ({state.itemCount} items)</span>
                  <span className="font-medium">
                    {formatPrice(state.total)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="font-medium">
                    {state.total >= 100 ? 'Free' : formatPrice(9.99)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Tax</span>
                  <span className="font-medium">
                    {formatPrice(state.total * 0.08)}
                  </span>
                </div>

                <Separator />

                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>
                    {formatPrice(
                      state.total +
                        (state.total >= 100 ? 0 : 9.99) +
                        state.total * 0.08
                    )}
                  </span>
                </div>
              </div>

              <div className="space-y-4 mt-6">
                <Link href="/checkout" className="block">
                  <Button size="lg" className="w-full">
                    Proceed to Checkout
                  </Button>
                </Link>

                <Button variant="outline" size="lg" className="w-full">
                  <Heart className="h-4 w-4 mr-2" />
                  Save for Later
                </Button>
              </div>

              <div className="mt-6 text-sm text-gray-600">
                <p className="mb-2">We accept:</p>
                <div className="flex space-x-2">
                  <div className="w-8 h-5 bg-blue-600 rounded text-white text-xs flex items-center justify-center">
                    V
                  </div>
                  <div className="w-8 h-5 bg-red-600 rounded text-white text-xs flex items-center justify-center">
                    M
                  </div>
                  <div className="w-8 h-5 bg-blue-500 rounded text-white text-xs flex items-center justify-center">
                    A
                  </div>
                  <div className="w-8 h-5 bg-orange-500 rounded text-white text-xs flex items-center justify-center">
                    D
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
