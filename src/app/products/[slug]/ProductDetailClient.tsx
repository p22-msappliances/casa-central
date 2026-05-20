"use client";

import React, { useState } from 'react';
import { ProductGallery } from '@/components/ui/ProductGallery';
import { ProductSpecifications } from '@/components/ui/ProductSpecifications';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, ShieldCheck, Truck, RotateCcw, Minus, Plus } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { toast } from 'sonner';

interface ProductDetailClientProps {
  product: any;
}

export default function ProductDetailClient({ product }: ProductDetailClientProps) {
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore(state => state.addItem);
  const totalStock = product.total_stock || 0;
  const isInStock = totalStock > 0;

  const handleAddToCart = () => {
    const variant = product.product_variants?.[0];
    if (!variant || !isInStock) {
      toast.error('This product is currently out of stock');
      return;
    }

    if (quantity > totalStock) {
      toast.error(`Only ${totalStock} available`);
      return;
    }

    addItem({
      variantId: variant.id,
      productId: product.id,
      name: product.name,
      price: variant.price,
      quantity,
      imageUrl: variant.image_url || product.image_url,
      maxQuantity: totalStock,
    });

    toast.success(`${product.name} added to cart`);
  };

  const handleIncrement = () => setQuantity(prev => Math.min(prev + 1, totalStock));
  const handleDecrement = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

  const galleryImages = product.image_url ? [product.image_url] : [];

  const specifications: Record<string, string> = {};
  if (product.description) {
    specifications['Description'] = product.description;
  }
  if (product.base_price) {
    specifications['Base Price'] = `$${Number(product.base_price).toLocaleString()}`;
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-6">
          <ProductGallery images={galleryImages} />
        </div>

        <div className="flex flex-col space-y-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-primary border-primary">
                {product.categories?.name || 'Premium'}
              </Badge>
              <Badge variant="outline" className="text-accent-foreground border-accent-foreground">
                {product.brands?.name || 'Certified'}
              </Badge>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-primary font-heading leading-tight">
              {product.name}
            </h1>
            <p className="text-2xl font-semibold text-accent-foreground">
              {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(product.base_price || 0))}
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {product.description}
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-border/60 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Quantity</span>
              <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" className="h-8 w-8 rounded-full border-border/60" onClick={handleDecrement}>
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="text-lg font-bold text-primary">{quantity}</span>
                <Button variant="outline" size="icon" className="h-8 w-8 rounded-full border-border/60" onClick={handleIncrement} disabled={quantity >= totalStock}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground text-center">{totalStock} available in stock</p>

            <Button size="lg" className="w-full py-6 text-xl rounded-full shadow-lg transition-all duration-300 flex items-center justify-center gap-2" onClick={handleAddToCart} disabled={!isInStock}>
              <ShoppingCart className="h-6 w-6" /> {isInStock ? 'Add to Cart' : 'Out of Stock'}
            </Button>
          </div>

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

      <div className="mt-24 border-t border-secondary/30 pt-12">
        <ProductSpecifications specs={specifications} />
      </div>
    </div>
  );
}
