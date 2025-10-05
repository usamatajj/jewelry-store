import Link from 'next/link';
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-full bg-primary"></div>
              <span className="text-xl font-bold">Jewelry Store</span>
            </div>
            <p className="text-gray-300 text-sm">
              Discover exquisite jewelry pieces crafted with precision and passion. From
              elegant necklaces to stunning rings, find your perfect piece.
            </p>
            <div className="flex space-x-4">
              <Facebook className="h-5 w-5 hover:text-primary cursor-pointer" />
              <Instagram className="h-5 w-5 hover:text-primary cursor-pointer" />
              <Twitter className="h-5 w-5 hover:text-primary cursor-pointer" />
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <div className="space-y-2">
              <Link
                href="/about"
                className="block text-gray-300 hover:text-white text-sm"
              >
                About Us
              </Link>
              <Link
                href="/contact"
                className="block text-gray-300 hover:text-white text-sm"
              >
                Contact
              </Link>
              <Link
                href="/shipping"
                className="block text-gray-300 hover:text-white text-sm"
              >
                Shipping Info
              </Link>
              <Link
                href="/returns"
                className="block text-gray-300 hover:text-white text-sm"
              >
                Returns & Exchanges
              </Link>
              <Link
                href="/size-guide"
                className="block text-gray-300 hover:text-white text-sm"
              >
                Size Guide
              </Link>
            </div>
          </div>

          {/* Customer Service */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Customer Service</h3>
            <div className="space-y-2">
              <Link href="/faq" className="block text-gray-300 hover:text-white text-sm">
                FAQ
              </Link>
              <Link
                href="/track-order"
                className="block text-gray-300 hover:text-white text-sm"
              >
                Track Your Order
              </Link>
              <Link
                href="/warranty"
                className="block text-gray-300 hover:text-white text-sm"
              >
                Warranty
              </Link>
              <Link
                href="/care-instructions"
                className="block text-gray-300 hover:text-white text-sm"
              >
                Care Instructions
              </Link>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-primary" />
                <span className="text-sm text-gray-300">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-primary" />
                <span className="text-sm text-gray-300">info@jewelrystore.com</span>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="h-4 w-4 text-primary mt-1" />
                <span className="text-sm text-gray-300">
                  123 Jewelry Street
                  <br />
                  New York, NY 10001
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-gray-400">
              © 2024 Jewelry Store. All rights reserved.
            </p>
            <div className="flex space-x-6 text-sm">
              <Link href="/privacy" className="text-gray-400 hover:text-white">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-gray-400 hover:text-white">
                Terms of Service
              </Link>
              <Link href="/cookies" className="text-gray-400 hover:text-white">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
