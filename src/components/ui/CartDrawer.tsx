"use client";

import React, { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Trash2, Plus, Minus } from 'lucide-react';
import { useCartStore, getTotalPrice, getTotalItems } from '@/store/useCartStore';
import Image from 'next/image';
import Link from 'next/link';

export const CartDrawer = () => {
  const [open, setOpen] = useState(false);
  const { items, removeItem, updateQuantity, hydrated } = useCartStore();
  const totalPrice = getTotalPrice(items);
  const totalCount = getTotalItems(items);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <button
        onClick={() => setOpen(true)}
        className="relative p-2 rounded-full hover:bg-muted transition-colors cursor-pointer"
        aria-label="Open shopping cart"
      >
        <ShoppingCart className="h-5 w-5 text-muted-foreground" />
        {totalCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-brand-gold text-brand-navy text-[10px] font-bold shadow-sm">
            {totalCount}
          </span>
        )}
      </button>
      <SheetContent className="w-full sm:max-w-md bg-white text-foreground flex flex-col">
        <SheetHeader className="mb-8">
          <SheetTitle className="text-2xl font-bold text-primary font-heading">
            Shopping Cart
          </SheetTitle>
        </SheetHeader>

        <div className="flex-grow overflow-y-auto space-y-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4 py-12">
              <ShoppingCart className="h-16 w-16 text-muted-foreground/20" />
              <p className="text-lg text-muted-foreground">Your cart is empty</p>
              <Link href="/products">
                <Button variant="outline" className="rounded-full px-8" onClick={() => setOpen(false)}>
                  Start Shopping
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.variantId} className="flex gap-4 p-3 rounded-xl bg-muted/30 border border-border/50">
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-muted shrink-0">
                    {item.imageUrl ? (
                      <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] text-muted-foreground">N/A</div>
                    )}
                  </div>
                  <div className="flex-grow flex flex-col justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-primary truncate">{item.name}</h4>
                      <p className="text-xs text-muted-foreground">₱{item.price.toLocaleString()}</p>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2 bg-white rounded-full px-2 py-1 border border-border/50">
                        <button
                          className="h-6 w-6 rounded-full flex items-center justify-center hover:bg-muted transition-colors cursor-pointer"
                          onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3 text-muted-foreground" />
                        </button>
                        <span className="text-xs font-bold w-4 text-center text-foreground">{item.quantity}</span>
                        <button
                          className="h-6 w-6 rounded-full flex items-center justify-center hover:bg-muted transition-colors cursor-pointer"
                          onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3 text-muted-foreground" />
                        </button>
                      </div>
                      <button
                        className="h-8 w-8 rounded-full flex items-center justify-center text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                        onClick={() => removeItem(item.variantId)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="mt-8 pt-6 border-t border-border/50 space-y-4">
            <div className="flex justify-between items-center text-lg font-semibold">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="text-primary font-bold">₱{totalPrice.toLocaleString()}</span>
            </div>
            <Link href="/checkout" className="block w-full" onClick={() => setOpen(false)}>
              <Button className="w-full py-6 text-lg rounded-full shadow-lg bg-primary hover:bg-primary/90 text-primary-foreground transition-all">
                Proceed to Checkout
              </Button>
            </Link>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};
