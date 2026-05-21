/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Heart, ShoppingCart, Trash2, Loader2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { toggleWishlist } from '@/app/actions/wishlist';

export function WishlistClient({ initialWishlist }: { initialWishlist: any[] }) {
  const [wishlist, setWishlist] = useState(initialWishlist);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleToggle = async (productId: string) => {
    setUpdatingId(productId);
    try {
      const result = await toggleWishlist(productId);
      if (result.success) {
        const { getUserWishlist } = await import('@/app/actions/wishlist');
        const refreshResult = await getUserWishlist();
        if (refreshResult.success && refreshResult.data) {
          setWishlist(refreshResult.data || []);
        }
      }
    } catch {
      console.error('Error toggling wishlist');
    } finally {
      setUpdatingId(null);
    }
  };

  if (wishlist.length === 0) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-primary font-heading flex items-center gap-2">
          <Heart className="h-6 w-6" /> My Wishlist
        </h2>
        <div className="text-center py-12 space-y-4">
          <Heart className="h-16 w-16 text-muted-foreground/30 mx-auto" />
          <p className="text-muted-foreground">Your wishlist is empty.</p>
          <Link href="/products">
            <Button className="rounded-full px-8">Browse Products</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-primary font-heading flex items-center gap-2">
        <Heart className="h-6 w-6" /> My Wishlist
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {wishlist.map((item: any) => (
          <div key={item.id} className="rounded-xl bg-secondary/20 border border-secondary/30 overflow-hidden group">
            <div className="relative aspect-square bg-secondary/30">
              {item.products?.image_url ? (
                <Image src={item.products.image_url} alt={item.products.name} fill className="object-cover" />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground/30">
                  <ShoppingCart className="h-12 w-12" />
                </div>
              )}
            </div>
            <div className="p-4 space-y-3">
              <Link href={`/products/${item.products?.slug}`}>
                <h3 className="font-semibold text-primary hover:text-accent-foreground transition-colors line-clamp-1">
                  {item.products?.name || 'Unknown Product'}
                </h3>
              </Link>
              <p className="text-lg font-bold text-accent-foreground">
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(item.products?.base_price))}
              </p>
              <div className="flex gap-2">
                <Link href={`/products/${item.products?.slug}`} className="flex-1">
                  <Button variant="outline" className="w-full rounded-full">
                    <ShoppingCart className="h-4 w-4 mr-2" /> View
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full text-destructive"
                  onClick={() => handleToggle(item.product_id)}
                  disabled={updatingId === item.product_id}
                >
                  {updatingId === item.product_id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
