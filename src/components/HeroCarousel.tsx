'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

interface CarouselSlide {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  badge: string;
  cta: string;
  ctaSecondary: string;
  href: string;
}

const carouselSlides: CarouselSlide[] = [
  {
    id: 1,
    title: 'Exquisite Jewelry for',
    subtitle: 'Every Moment',
    description:
      "Discover our stunning collection of handcrafted jewelry pieces that celebrate life's precious moments.",
    image:
      'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1200&h=600&fit=crop',
    badge: 'New Collection Available',
    cta: 'Shop Now',
    ctaSecondary: 'View Collection',
    href: '/products',
  },
  {
    id: 2,
    title: 'Elegant Engagement',
    subtitle: 'Rings Collection',
    description:
      'Find the perfect symbol of your love with our exquisite engagement rings, crafted with precision and care.',
    image:
      'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=1200&h=600&fit=crop',
    badge: 'Limited Edition',
    cta: 'Explore Rings',
    ctaSecondary: 'View Collection',
    href: '/products?category=rings',
  },
  {
    id: 3,
    title: 'Timeless Luxury',
    subtitle: 'Necklaces & Pendants',
    description:
      'Adorn yourself with our collection of luxurious necklaces and pendants, perfect for any occasion.',
    image:
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=1200&h=600&fit=crop',
    badge: 'Best Sellers',
    cta: 'Shop Necklaces',
    ctaSecondary: 'View Collection',
    href: '/products?category=necklaces',
  },
  {
    id: 4,
    title: 'Sophisticated',
    subtitle: "Men's Collection",
    description:
      "Discover our refined men's jewelry collection featuring elegant rings, chains, and accessories.",
    image:
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=1200&h=600&fit=crop',
    badge: "Men's Premium",
    cta: "Shop Men's",
    ctaSecondary: 'View Collection',
    href: '/products?category=men',
  },
];

export default function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselSlides.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const goToSlide = (slideIndex: number) => {
    setCurrentSlide(slideIndex);
    setIsAutoPlaying(false); // Stop auto-play when user manually navigates
  };

  const goToPrevious = () => {
    setCurrentSlide(
      (prev) => (prev - 1 + carouselSlides.length) % carouselSlides.length
    );
    setIsAutoPlaying(false);
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % carouselSlides.length);
    setIsAutoPlaying(false);
  };

  const currentSlideData = carouselSlides[currentSlide];

  return (
    <section className="relative h-[70vh] md:h-[80vh] overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src={currentSlideData.image}
          alt={currentSlideData.title}
          fill
          className="object-cover transition-all duration-1000 ease-in-out"
          priority={currentSlide === 0}
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-black/60" />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center text-white">
            <Badge
              variant="secondary"
              className="mb-6 bg-white/10 text-white border-white/20 backdrop-blur-sm"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {currentSlideData.badge}
            </Badge>

            <h1
              className="text-4xl md:text-6xl font-bold mb-6 leading-tight text-white"
              style={{
                textShadow:
                  '2px 2px 4px rgba(0,0,0,0.8), -1px -1px 2px rgba(0,0,0,0.8), 1px -1px 2px rgba(0,0,0,0.8), -1px 1px 2px rgba(0,0,0,0.8)',
              }}
            >
              {currentSlideData.title}
              <span
                className="text-white block md:inline"
                style={{
                  textShadow:
                    '2px 2px 4px rgba(0,0,0,0.8), -1px -1px 2px rgba(0,0,0,0.8), 1px -1px 2px rgba(0,0,0,0.8), -1px 1px 2px rgba(0,0,0,0.8)',
                }}
              >
                {' '}
                {currentSlideData.subtitle}
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-2xl mx-auto">
              {currentSlideData.description}
            </p>

            <div className="flex justify-center">
              <Link href={currentSlideData.href}>
                <Button
                  size="lg"
                  className="bg-white text-gray-900 hover:bg-gray-100 transition-all duration-300"
                >
                  {currentSlideData.cta}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={goToPrevious}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-all duration-300 backdrop-blur-sm"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>

      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-all duration-300 backdrop-blur-sm"
        aria-label="Next slide"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex space-x-2">
        {carouselSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentSlide
                ? 'bg-white scale-125'
                : 'bg-white/50 hover:bg-white/70'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Auto-play indicator */}
      <div className="absolute top-4 right-4 z-20">
        <button
          onClick={() => setIsAutoPlaying(!isAutoPlaying)}
          className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-all duration-300 backdrop-blur-sm"
          aria-label={isAutoPlaying ? 'Pause auto-play' : 'Resume auto-play'}
        >
          <div className={`w-4 h-4 ${isAutoPlaying ? 'animate-pulse' : ''}`}>
            {isAutoPlaying ? '⏸️' : '▶️'}
          </div>
        </button>
      </div>
    </section>
  );
}
