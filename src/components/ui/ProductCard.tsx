import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, ShoppingCart, Heart } from 'lucide-react';
import { Database } from '@/types/database.types';

type ProductRow = Database['public']['Tables']['products']['Row'];

interface ProductCardProps {
  product: ProductRow & {
    category?: { name: string } | null;
    brand?: { name: string } | null;
  };
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const productSlug = product.slug || product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  const averageRating = 4.5;

  return (
    <Link href={`/products/${productSlug}`} className="group block">
      <div className="relative overflow-hidden rounded-2xl bg-white border border-border/50 shadow-sm hover:shadow-xl transition-all duration-300">
        <div className="relative w-full aspect-square overflow-hidden bg-muted/20">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground/50 text-sm">
              No Image Available
            </div>
          )}
        </div>
        <div className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-brand-gold uppercase tracking-wider">
              {product.category?.name || 'Premium'}
            </span>
            <div className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-brand-gold text-brand-gold" />
              <span className="text-xs text-muted-foreground">{averageRating.toFixed(1)}</span>
            </div>
          </div>
          <h3 className="text-lg font-bold text-brand-navy group-hover:text-brand-gold transition-colors duration-200">
            {product.name}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {product.description}
          </p>
          <div className="flex items-center justify-between pt-2">
            <span className="text-xl font-bold text-brand-navy">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(product.base_price) || 0)}</span>
            <button
              className="p-2.5 rounded-full bg-brand-navy text-white hover:bg-brand-navy/90 transition-colors shadow-sm"
              aria-label="Add to cart"
            >
              <ShoppingCart className="h-4 w-4" />
            </button>
          </div>
        </div>
        <button
          className="absolute top-4 right-4 p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-colors shadow-sm"
          aria-label="Add to wishlist"
        >
          <Heart className="h-4 w-4 text-muted-foreground hover:text-accent transition-colors" />
        </button>
      </div>
    </Link>
  );
};
