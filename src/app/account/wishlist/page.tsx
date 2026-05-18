"use client";

import React, { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Heart, ShoppingCart, Trash2, Loader2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { getUserWishlist, toggleWishlist } from '@/app/actions/wishlist';

export const dynamic = 'force-dynamic';

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchWishlist() {
      try {
        const result = await getUserWishlist();
        if (result.success) setWishlist(result.data);
      } catch (err) {
        console.error('Error fetching wishlist:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchWishlist();
  }, []);

  const handleToggle = async (productId: string) => {
    setUpdatingId(productId);
    try {
      const result = await toggleWishlist(productId);
      if (result.success) {
        // Refresh wishlist data
        const refreshResult = await getUserWishlist();
        if (refreshResult.success) setWishlist(refreshResult.data);
      }
    } catch (err) {
      console.error('Error toggling wishlist:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-primary font-heading flex items-center gap-2">
        <Heart className="h-6 w-6" /> My Wishlist
      </h2>
      {wishlist.length === 0 ? (
        <div className="text-center py-12 space-y-4">
          <Heart className="h-16 w-16 text-muted-foreground/30 mx-auto" />
          <p className="text-muted-foreground">Your wishlist is empty.</p>
          <Link href="/products">
            <Button className="rounded-full px-8">Discover Products</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {wishlist.map((item) => (
            <div key={item.id} className="p-4 rounded-xl bg-secondary/20 border border-secondary/30 flex gap-4">
              <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-muted shrink-0">
                {item.imageUrl ? (
                  <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[10px] text-muted-foreground">N/A</div>
                )}
              </div>
              <div className="flex-1 space-y-2">
                <p className="font-semibold text-primary">{item.name}</p>
                <p className="text-sm font-bold text-accent-foreground">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(item.price))}</p>
                <div className="flex gap-2">
                  <Button size="sm" className="rounded-full text-xs h-8">
                    <ShoppingCart className="h-3 w-3 mr-1" /> Add to Cart
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="rounded-full h-8 text-destructive"
                    onClick={() => handleToggle(item.id)}
                    disabled={updatingId === item.id}
                  >
                    {updatingId === item.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
