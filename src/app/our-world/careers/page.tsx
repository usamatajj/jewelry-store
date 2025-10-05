import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Award, Heart, Mail } from 'lucide-react';

export default function CareersPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">Careers</h1>
        <p className="text-xl text-gray-600">
          Join our team and be part of creating beautiful jewelry that lasts a lifetime
        </p>
      </div>

      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Why Work With Us?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <Users className="h-8 w-8 text-blue-600 mb-2" />
              <CardTitle>Great Team</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Work alongside passionate, skilled professionals who share your love for
                quality craftsmanship.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Award className="h-8 w-8 text-yellow-600 mb-2" />
              <CardTitle>Growth Opportunities</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                We invest in our team with training, development programs, and advancement
                opportunities.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Heart className="h-8 w-8 text-red-600 mb-2" />
              <CardTitle>Meaningful Work</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Be part of creating jewelry that celebrates life&apos;s most precious
                moments and memories.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Open Positions</h2>
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Jewelry Designer</CardTitle>
              <CardDescription>Full-time • New York, NY</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                We&apos;re looking for a creative jewelry designer to join our design
                team. You&apos;ll work on creating new collections and custom pieces for
                our clients.
              </p>
              <Button variant="outline">Apply Now</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sales Associate</CardTitle>
              <CardDescription>Full-time • New York, NY</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Join our sales team and help customers find the perfect piece of jewelry
                for their special occasions.
              </p>
              <Button variant="outline">Apply Now</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Jewelry Repair Specialist</CardTitle>
              <CardDescription>Full-time • New York, NY</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                We need a skilled jeweler to handle repairs, resizing, and maintenance of
                our customers&apos; precious pieces.
              </p>
              <Button variant="outline">Apply Now</Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Don&apos;t See Your Role?</h2>
        <p className="text-gray-600 mb-6">
          We&apos;re always looking for talented individuals to join our team. Send us
          your resume and let us know how you&apos;d like to contribute.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button>
            <Mail className="h-4 w-4 mr-2" />
            Send Resume
          </Button>
          <Button variant="outline">Learn More About Us</Button>
        </div>
      </div>
    </div>
  );
}
