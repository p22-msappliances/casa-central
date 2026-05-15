"use client";

import React, { Suspense } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CheckCircle, Package, ArrowRight } from 'lucide-react';

function ConfirmationContent() {
  const orderNumber = `CC-${Date.now().toString(36).toUpperCase()}`;

  return (
    <div className="container mx-auto px-4 py-24 text-center space-y-8">
      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
        <CheckCircle className="h-10 w-10 text-primary" />
      </div>
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-primary font-heading">Order Placed Successfully!</h1>
        <p className="text-lg text-muted-foreground">Thank you for shopping with CASA CENTRAL.</p>
      </div>
      <div className="p-6 rounded-2xl bg-secondary/20 border border-secondary/30 inline-block">
        <p className="text-sm text-muted-foreground mb-1">Order Reference</p>
        <p className="text-2xl font-bold text-primary font-mono">{orderNumber}</p>
      </div>
      <p className="text-muted-foreground max-w-md mx-auto">
        You will receive an email confirmation shortly. We will notify you once your order has been shipped.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link href="/account/orders">
          <Button className="rounded-full px-8 py-6 text-lg flex items-center gap-2">
            <Package className="h-5 w-5" /> View My Orders
          </Button>
        </Link>
        <Link href="/products">
          <Button variant="outline" className="rounded-full px-8 py-6 text-lg flex items-center gap-2">
            Continue Shopping <ArrowRight className="h-5 w-5" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={<div className="text-center py-24 text-muted-foreground">Loading confirmation...</div>}>
      <ConfirmationContent />
    </Suspense>
  );
}
