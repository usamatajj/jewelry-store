import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Heart, Shield, Truck } from 'lucide-react';
import HeroCarousel from '@/components/HeroCarousel';

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Carousel */}
      <HeroCarousel />

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Free Shipping</h3>
              <p className="text-gray-600">Free shipping on orders over $100</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure Payment</h3>
              <p className="text-gray-600">Your payment information is safe and secure</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Quality Guarantee</h3>
              <p className="text-gray-600">
                Premium quality jewelry with lifetime warranty
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Shop by Category</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Explore our carefully curated collections designed for every style and
              occasion
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: "Women's Jewelry",
                description: 'Elegant pieces for the modern woman',
                href: '/women',
                image:
                  'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=500&h=300&fit=crop',
                count: '200+ items',
              },
              {
                name: "Men's Jewelry",
                description: 'Sophisticated accessories for gentlemen',
                href: '/men',
                image:
                  'https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=500&h=300&fit=crop',
                count: '150+ items',
              },
              {
                name: 'Couple Sets',
                description: 'Matching pieces for special moments',
                href: '/couple',
                image:
                  'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=500&h=300&fit=crop',
                count: '75+ items',
              },
              {
                name: 'Gems & Stones',
                description: 'Precious stones and materials',
                href: '/gems',
                image:
                  'https://images.unsplash.com/photo-1544376664-80b17f09d399?w=500&h=300&fit=crop',
                count: '100+ items',
              },
              {
                name: 'Personalized',
                description: 'Custom jewelry made just for you',
                href: '/personalized',
                image:
                  'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=500&h=300&fit=crop',
                count: '50+ items',
              },
              {
                name: 'Gift Sets',
                description: 'Perfect gifts for loved ones',
                href: '/gifting',
                image:
                  'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=500&h=300&fit=crop',
                count: '25+ items',
              },
            ].map((category) => (
              <Card
                key={category.name}
                className="group overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div className="aspect-video relative overflow-hidden">
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{category.name}</h3>
                  <p className="text-gray-600 mb-4">{category.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">{category.count}</span>
                    <Link href={category.href}>
                      <Button variant="outline" size="sm">
                        Shop Now
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Find Your Perfect Piece?
          </h2>
          <p className="text-xl text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
            Browse our extensive collection and discover jewelry that speaks to your style
            and personality.
          </p>
          <Button
            size="lg"
            variant="secondary"
            className="bg-white text-primary hover:bg-gray-100"
          >
            Start Shopping
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>
    </div>
  );
}
