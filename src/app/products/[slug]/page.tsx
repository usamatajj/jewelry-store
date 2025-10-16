import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Heart, Share2, Truck, Shield, RotateCcw } from 'lucide-react';
import { createClient } from '@/lib/supabase-server';
import { ProductCard } from '@/components/ProductCard';
import { AddToCartButton } from '@/components/AddToCartButton';
import { BuyNowButton } from '@/components/BuyNowButton';
import { Category, Product } from '@/types';

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

  return product as Product & { category: Category };
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

  return products as (Product & { category: Category })[];
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    notFound();
  }

  const relatedProducts = await getRelatedProducts(product.category_id, product.id);

  const formatPrice = (price: number) => {
    return `Rs ${price.toLocaleString('en-PK')}`;
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
        {/* Left Column - Product Images */}
        <div className="space-y-4">
          <div className="aspect-square relative overflow-hidden rounded-lg">
            <Image
              src={product.images[0]}
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

          {/* Additional images */}
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.slice(1, 5).map((image, i) => (
                <div
                  key={i}
                  className="aspect-square relative overflow-hidden rounded cursor-pointer border-2 border-transparent hover:border-primary"
                >
                  <Image
                    src={image}
                    alt={`${product.name} view ${i + 2}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column - Product Details */}
        <div className="flex flex-col justify-between h-[78%]">
          {/* Top Section - Product Info */}

          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
              <p className="text-3xl font-bold text-primary mb-4">
                {formatPrice(product.price)}
              </p>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-gray-600 leading-relaxed overflow-y-auto">
                {product.description}
              </p>
            </div>
          </div>

          {/* Bottom Section - Action Buttons & Store Features */}
          <div className="space-y-4 mt-20">
            <div className="flex flex-col sm:flex-row gap-4">
              <AddToCartButton product={product} className="flex-1 h-12" />
              <BuyNowButton product={product} className="flex-1 h-12" />
              <Button variant="outline" size="icon" className="h-12 w-12">
                <Heart className="h-5 w-5" />
              </Button>
              <Button variant="outline" size="icon" className="h-12 w-12">
                <Share2 className="h-5 w-5" />
              </Button>
            </div>

            <Separator />

            {/* Store Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center space-x-3">
                <Truck className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium text-sm">Free Shipping</p>
                  <p className="text-xs text-gray-600">On orders over Rs 5,000</p>
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
