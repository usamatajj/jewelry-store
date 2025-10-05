import Link from 'next/link';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Leaf, Users, Mail } from 'lucide-react';

export default function OurWorldPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold mb-4">Our World</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Discover the story behind our jewelry, our commitment to sustainability, and the
          people who make it all possible.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <Link href="/our-world/about">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <Heart className="h-8 w-8 text-primary mb-2" />
              <CardTitle>About Us</CardTitle>
              <CardDescription>
                Learn about our heritage and passion for jewelry
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/our-world/sustainability">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <Leaf className="h-8 w-8 text-green-600 mb-2" />
              <CardTitle>Sustainability</CardTitle>
              <CardDescription>
                Our commitment to ethical and sustainable practices
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/our-world/careers">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <Users className="h-8 w-8 text-blue-600 mb-2" />
              <CardTitle>Careers</CardTitle>
              <CardDescription>Join our team and be part of our story</CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/our-world/contact">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <Mail className="h-8 w-8 text-purple-600 mb-2" />
              <CardTitle>Contact</CardTitle>
              <CardDescription>Get in touch with our team</CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>

      <div className="bg-gray-50 rounded-lg p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
        <p className="text-gray-600 max-w-3xl mx-auto">
          We believe that jewelry is more than just an accessory – it&apos;s a way to
          express your unique style, celebrate special moments, and create lasting
          memories. Our mission is to create beautiful, high-quality jewelry that
          you&apos;ll treasure for years to come, while maintaining the highest standards
          of craftsmanship and ethical sourcing.
        </p>
      </div>
    </div>
  );
}
