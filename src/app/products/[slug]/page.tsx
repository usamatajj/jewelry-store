import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  ShoppingCart,
  Heart,
  Share2,
  Truck,
  Shield,
  RotateCcw,
  Star,
  ArrowLeft,
} from 'lucide-react';
import { createClient } from '@/lib/supabase-server';
import { ProductCard } from '@/components/ProductCard';
import { AddToCartButton } from '@/components/AddToCartButton';
import { Product } from '@/types';

interface ProductPageProps {
  params: {
    slug: string;
  };
}

async function getProduct(slug: string) {
  const supabase = await createClient();

  const { data: product, error } = await supabase
    .from('products')
    .select(
      `
      *,
      category:categories(*)
    `
    )
    .eq('slug', slug)
    .single();

  if (error || !product) {
    return null;
  }

  return product as Product & { category: any };
}

async function getRelatedProducts(categoryId: string, productId: string) {
  const supabase = await createClient();

  const { data: products, error } = await supabase
    .from('products')
    .select(
      `
      *,
      category:categories(*)
    `
    )
    .eq('category_id', categoryId)
    .neq('id', productId)
    .limit(4);

  if (error) {
    console.error('Error fetching related products:', error);
    return [];
  }

  return products as (Product & { category: any })[];
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    notFound();
  }

  const relatedProducts = await getRelatedProducts(
    product.category_id,
    product.id
  );

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
        <Link href="/" className="hover:text-primary">
          Home
        </Link>
        <span>/</span>
        <Link href="/products" className="hover:text-primary">
          Products
        </Link>
        <span>/</span>
        <Link
          href={`/products?category=${product.category?.slug}`}
          className="hover:text-primary"
        >
          {product.category?.name}
        </Link>
        <span>/</span>
        <span className="text-gray-900">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="aspect-square relative overflow-hidden rounded-lg">
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute top-4 right-4">
              <Badge variant="secondary" className="bg-white/90 text-gray-900">
                New
              </Badge>
            </div>
          </div>

          {/* Additional images would go here */}
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="aspect-square relative overflow-hidden rounded cursor-pointer border-2 border-transparent hover:border-primary"
              >
                <Image
                  src={product.image_url}
                  alt={`${product.name} view ${i}`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            <div className="flex items-center space-x-4 mb-4">
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className="h-4 w-4 fill-yellow-400 text-yellow-400"
                  />
                ))}
                <span className="text-sm text-gray-600 ml-2">
                  (4.8) 124 reviews
                </span>
              </div>
            </div>
            <p className="text-3xl font-bold text-primary mb-4">
              {formatPrice(product.price)}
            </p>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-gray-600 leading-relaxed">
              {product.description}
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Features</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                <span>Premium quality materials</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                <span>Handcrafted with attention to detail</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                <span>Comes with elegant gift box</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                <span>Lifetime warranty included</span>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Quantity</h3>
            <div className="flex items-center space-x-4">
              <div className="flex items-center border rounded-lg">
                <Button variant="ghost" size="icon" className="h-10 w-10">
                  -
                </Button>
                <span className="px-4 py-2 min-w-[3rem] text-center">1</span>
                <Button variant="ghost" size="icon" className="h-10 w-10">
                  +
                </Button>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <AddToCartButton product={product} className="flex-1" />
            <Button variant="outline" size="icon" className="h-12 w-12">
              <Heart className="h-5 w-5" />
            </Button>
            <Button variant="outline" size="icon" className="h-12 w-12">
              <Share2 className="h-5 w-5" />
            </Button>
          </div>

          <Separator />

          {/* Features */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3">
              <Truck className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium text-sm">Free Shipping</p>
                <p className="text-xs text-gray-600">On orders over $100</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Shield className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium text-sm">Secure Payment</p>
                <p className="text-xs text-gray-600">100% secure checkout</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <RotateCcw className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium text-sm">Easy Returns</p>
                <p className="text-xs text-gray-600">30-day return policy</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-8">Related Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((relatedProduct) => (
              <ProductCard key={relatedProduct.id} product={relatedProduct} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
