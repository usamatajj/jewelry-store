import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Leaf, Recycle, Heart, Shield } from 'lucide-react';

export default function SustainabilityPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">Sustainability</h1>
        <p className="text-xl text-gray-600">
          Our commitment to ethical and sustainable jewelry practices
        </p>
      </div>

      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Our Commitment</h2>
        <p className="text-gray-600 mb-6 max-w-3xl">
          We believe that beautiful jewelry should also be responsible jewelry. That's why
          we're committed to sustainable practices throughout our entire supply chain,
          from sourcing to packaging.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <Card>
          <CardHeader>
            <Leaf className="h-8 w-8 text-green-600 mb-2" />
            <CardTitle>Ethical Sourcing</CardTitle>
            <CardDescription>
              We work only with certified ethical suppliers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-gray-600">
              <li>• Conflict-free diamonds and gemstones</li>
              <li>• Fair trade gold and silver</li>
              <li>• Recycled precious metals when possible</li>
              <li>• Transparent supply chain tracking</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Recycle className="h-8 w-8 text-blue-600 mb-2" />
            <CardTitle>Eco-Friendly Packaging</CardTitle>
            <CardDescription>Sustainable packaging for every order</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-gray-600">
              <li>• Recycled and recyclable materials</li>
              <li>• Biodegradable packing peanuts</li>
              <li>• Minimal plastic usage</li>
              <li>• Reusable gift boxes</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Heart className="h-8 w-8 text-red-600 mb-2" />
            <CardTitle>Community Support</CardTitle>
            <CardDescription>Supporting local communities and artisans</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-gray-600">
              <li>• Fair wages for all workers</li>
              <li>• Safe working conditions</li>
              <li>• Supporting local artisan communities</li>
              <li>• Educational programs for workers</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Shield className="h-8 w-8 text-purple-600 mb-2" />
            <CardTitle>Quality & Longevity</CardTitle>
            <CardDescription>Creating jewelry that lasts generations</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-gray-600">
              <li>• Lifetime warranty on all pieces</li>
              <li>• Free cleaning and maintenance</li>
              <li>• Repair services to extend jewelry life</li>
              <li>• Timeless designs that never go out of style</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="bg-green-50 rounded-lg p-8 text-center">
        <h2 className="text-2xl font-bold mb-4 text-green-800">Our Impact</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="text-3xl font-bold text-green-600 mb-2">95%</div>
            <p className="text-green-700">Recycled packaging materials</p>
          </div>
          <div>
            <div className="text-3xl font-bold text-green-600 mb-2">100%</div>
            <p className="text-green-700">Conflict-free diamonds</p>
          </div>
          <div>
            <div className="text-3xl font-bold text-green-600 mb-2">50+</div>
            <p className="text-green-700">Ethical supplier partnerships</p>
          </div>
        </div>
      </div>
    </div>
  );
}
