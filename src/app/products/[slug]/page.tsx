import React from 'react';
import { notFound } from 'next/navigation';
import { ProductService } from '@/services/product.service';
import { ProductGallery } from '@/components/ui/ProductGallery';
import { ProductSpecifications } from '@/components/ui/ProductSpecifications';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, ShieldCheck, Truck, RotateCcw, Star } from 'lucide-react';

const productService = new ProductService();

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

const mockProducts: Record<string, any> = {
  'premium-refrigerator': {
    name: 'Premium Smart Refrigerator',
    slug: 'premium-refrigerator',
    description: 'Energy-efficient smart refrigerator with advanced cooling technology, Wi-Fi connectivity, and spacious storage for the modern kitchen.',
    basePrice: 65000,
    imageUrl: 'https://images.unsplash.com/photo-1600566753376-12c8ab7c3a0c?w=800&q=80',
    category: { name: 'Refrigerators' },
    brand: { name: 'CasaTech' },
    specifications: {
      'Energy Rating': 'A+++',
      'Warranty': '2 Years Full, 10 Years Compressor',
      'Material': 'Premium Stainless Steel',
      'Dimensions': '800 x 1800 x 700 mm',
      'Weight': '95 kg',
      'Smart Features': 'Wi-Fi enabled, App Control',
      'Capacity': '600L',
    },
  },
  'smart-washing-machine': {
    name: 'Smart Washing Machine',
    slug: 'smart-washing-machine',
    description: 'Advanced washing technology with AI-powered fabric care, steam cleaning, and energy-efficient performance.',
    basePrice: 40000,
    imageUrl: 'https://images.unsplash.com/photo-1610557899350-1715f3b01970?w=800&q=80',
    category: { name: 'Washing Machines' },
    brand: { name: 'CasaTech' },
    specifications: {
      'Energy Rating': 'A++',
      'Warranty': '2 Years Full',
      'Capacity': '10.5 kg',
      'Spin Speed': '1400 RPM',
      'Smart Features': 'AI Wash, App Control',
      'Noise Level': '52 dB',
    },
  },
  'high-fidelity-soundbar': {
    name: 'High-Fidelity Soundbar',
    slug: 'high-fidelity-soundbar',
    description: 'Immersive audio experience with Dolby Atmos, wireless subwoofer, and premium build quality for your home entertainment.',
    basePrice: 25000,
    imageUrl: 'https://images.unsplash.com/photo-1540526377264-7049969a65e6?w=800&q=80',
    category: { name: 'Audio Systems' },
    brand: { name: 'AudioWave' },
    specifications: {
      'Power Output': '400W',
      'Channels': '3.1.2',
      'Warranty': '1 Year',
      'Connectivity': 'Bluetooth 5.0, HDMI eARC, Optical',
      'Dimensions': '1050 x 65 x 95 mm',
      'Features': 'Dolby Atmos, DTS:X',
    },
  },
  '4k-qled-tv': {
    name: '4K QLED TV 55"',
    slug: '4k-qled-tv',
    description: 'Stunning 4K QLED display with vibrant colors, smart TV features, and sleek design for an unparalleled viewing experience.',
    basePrice: 75000,
    imageUrl: 'https://images.unsplash.com/photo-1593359674799-6c9c90d5be6b?w=800&q=80',
    category: { name: 'TVs' },
    brand: { name: 'VisionPlus' },
    specifications: {
      'Screen Size': '55"',
      'Resolution': '4K UHD (3840 x 2160)',
      'Warranty': '3 Years',
      'Smart TV': 'Yes, WebOS',
      'HDR': 'HDR10+, Dolby Vision',
      'Refresh Rate': '120Hz',
    },
  },
  'inverter-air-conditioner': {
    name: 'Inverter Air Conditioner',
    slug: 'inverter-air-conditioner',
    description: 'Energy-efficient inverter AC with quiet operation, smart temperature control, and sleek design for ultimate comfort.',
    basePrice: 35000,
    imageUrl: 'https://images.unsplash.com/photo-1585775775657-06c2e6b49c70?w=800&q=80',
    category: { name: 'Air Conditioners' },
    brand: { name: 'CasaTech' },
    specifications: {
      'Cooling Capacity': '2.5 HP',
      'Energy Rating': 'A+++',
      'Warranty': '1 Year Parts, 5 Years Compressor',
      'Noise Level': '25 dB',
      'Features': 'Inverter, Wi-Fi, Sleep Mode',
      'Coverage': 'Up to 35 sqm',
    },
  },
};

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;

  let product: any;

  try {
    const result = await productService.getProductBySlug(slug);
    if (result) product = result;
  } catch {
    // Database unavailable — use mock data
  }

  if (!product) {
    product = mockProducts[slug];
  }

  if (!product) {
    notFound();
  }

  const fallbackImg = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80';
  const galleryImages = product.imageUrl ? [product.imageUrl, fallbackImg] : [fallbackImg];

  const specifications = product.specifications || {
    'Energy Rating': 'A+++',
    'Warranty': '2 Years Full, 10 Years Compressor',
    'Material': 'Premium Stainless Steel',
    'Dimensions': '800 x 1800 x 700 mm',
    'Weight': '95 kg',
    'Smart Features': 'Wi-Fi enabled, App Control',
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left: Visuals */}
        <div className="space-y-6">
          <ProductGallery images={galleryImages} />
        </div>

        {/* Right: Info & Purchase */}
        <div className="flex flex-col space-y-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-primary border-primary">
                {product.category?.name || 'Premium'}
              </Badge>
              <Badge variant="outline" className="text-accent-foreground border-accent-foreground">
                {product.brand?.name || 'Certified'}
              </Badge>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-primary font-heading leading-tight">
              {product.name}
            </h1>
            <p className="text-2xl font-semibold text-accent-foreground">
              ₱{Number(product.basePrice).toLocaleString()}
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Purchase Section */}
          <div className="p-6 rounded-2xl bg-white border border-border/60 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Quantity</span>
              <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" className="h-8 w-8 rounded-full border-border/60">-</Button>
                <span className="text-lg font-bold text-primary">1</span>
                <Button variant="outline" size="icon" className="h-8 w-8 rounded-full border-border/60">+</Button>
              </div>
            </div>

            <Button size="lg" className="w-full py-6 text-xl rounded-full shadow-lg bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300 flex items-center justify-center gap-2">
              <ShoppingCart className="h-6 w-6" /> Add to Cart
            </Button>
          </div>

          {/* Trust Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex flex-col items-center text-center p-4 rounded-xl bg-muted/30 border border-border/40">
              <Truck className="h-6 w-6 text-accent mb-2" />
              <span className="text-xs font-semibold text-primary">Fast Delivery</span>
            </div>
            <div className="flex flex-col items-center text-center p-4 rounded-xl bg-muted/30 border border-border/40">
              <ShieldCheck className="h-6 w-6 text-accent mb-2" />
              <span className="text-xs font-semibold text-primary">Official Warranty</span>
            </div>
            <div className="flex flex-col items-center text-center p-4 rounded-xl bg-muted/30 border border-border/40">
              <RotateCcw className="h-6 w-6 text-accent mb-2" />
              <span className="text-xs font-semibold text-primary">Easy Returns</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Specifications & Related */}
      <div className="mt-24 border-t border-secondary/30 pt-12">
        <ProductSpecifications specs={specifications as Record<string, string>} />
      </div>
    </div>
  );
}
