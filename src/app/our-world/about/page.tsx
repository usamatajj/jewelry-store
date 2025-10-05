import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Heart, Award, Users, Target } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">About Us</h1>
        <p className="text-xl text-gray-600">
          Crafting beautiful jewelry with passion and precision since 1985
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
        <div>
          <h2 className="text-2xl font-bold mb-6">Our Story</h2>
          <p className="text-gray-600 mb-4">
            Founded in 1985 by master jeweler Maria Rodriguez, our jewelry store began as
            a small family business with a simple mission: to create beautiful,
            high-quality jewelry that celebrates life's most precious moments.
          </p>
          <p className="text-gray-600 mb-4">
            What started as a small workshop has grown into a trusted name in fine
            jewelry, but we've never lost sight of our roots. Every piece we create is
            still handcrafted with the same attention to detail and passion that Maria
            brought to her work over three decades ago.
          </p>
          <p className="text-gray-600">
            Today, we're proud to serve customers around the world while maintaining our
            commitment to quality, craftsmanship, and ethical sourcing.
          </p>
        </div>

        <div className="bg-gray-100 rounded-lg p-8">
          <h3 className="text-xl font-bold mb-4">Our Values</h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Heart className="h-5 w-5 text-primary mt-1" />
              <div>
                <h4 className="font-semibold">Passion</h4>
                <p className="text-sm text-gray-600">
                  We love what we do and it shows in every piece we create.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Award className="h-5 w-5 text-primary mt-1" />
              <div>
                <h4 className="font-semibold">Quality</h4>
                <p className="text-sm text-gray-600">
                  We use only the finest materials and time-tested techniques.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Users className="h-5 w-5 text-primary mt-1" />
              <div>
                <h4 className="font-semibold">Community</h4>
                <p className="text-sm text-gray-600">
                  We support local artisans and ethical sourcing practices.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Target className="h-5 w-5 text-primary mt-1" />
              <div>
                <h4 className="font-semibold">Excellence</h4>
                <p className="text-sm text-gray-600">
                  We strive for perfection in every aspect of our work.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>35+ Years</CardTitle>
            <CardDescription>Of jewelry crafting experience</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Three decades of expertise in creating beautiful, lasting jewelry.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>10,000+</CardTitle>
            <CardDescription>Happy customers worldwide</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              From engagement rings to anniversary gifts, we've helped celebrate countless
              special moments.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>100%</CardTitle>
            <CardDescription>Handcrafted pieces</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Every piece is individually crafted by our skilled artisans.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
