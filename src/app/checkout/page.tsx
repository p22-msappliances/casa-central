"use client";

import React, { useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useCartStore, getTotalPrice } from '@/store/useCartStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { CreditCard, Truck, CheckCircle } from 'lucide-react';

type Step = 'shipping' | 'payment' | 'review';

function CheckoutContent() {
  const { items, clearCart } = useCartStore();
  const router = useRouter();
  const [step, setStep] = useState<Step>('shipping');
  const [shippingInfo, setShippingInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    province: '',
    zipCode: '',
  });
  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: '',
    cardName: '',
    expiry: '',
    cvv: '',
  });

  const subtotal: number = getTotalPrice(items);
  const shippingTotal: number = 0;
  const taxTotal: number = subtotal * 0.12;
  const grandTotal: number = subtotal + shippingTotal + taxTotal;

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('payment');
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('review');
  };

  const handlePlaceOrder = () => {
    clearCart();
    router.push('/orders/confirmation');
  };

  const updateShipping = (field: string, value: string) => {
    setShippingInfo(prev => ({ ...prev, [field]: value }));
  };

  const updatePayment = (field: string, value: string) => {
    setPaymentInfo(prev => ({ ...prev, [field]: value }));
  };

  if (items.length === 0 && step === 'shipping') {
    return (
      <div className="container mx-auto px-4 py-24 text-center space-y-6">
        <Truck className="h-20 w-20 text-muted-foreground/30 mx-auto" />
        <h1 className="text-3xl font-bold text-primary font-heading">Your cart is empty</h1>
        <p className="text-muted-foreground">Add some products before checking out.</p>
        <Link href="/products">
          <Button className="rounded-full px-8 py-6 text-lg">Continue Shopping</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Steps Indicator */}
      <div className="flex items-center justify-center gap-4 mb-12">
        {(['shipping', 'payment', 'review'] as Step[]).map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
              step === s ? 'bg-primary text-primary-foreground shadow-lg' :
              ['shipping', 'payment'].includes(step) && s === 'shipping' || step === 'payment' && s === 'shipping' || step === 'review' && s !== 'review' ? 'bg-primary/20 text-primary' :
              'bg-secondary text-muted-foreground'
            }`}>
              {i + 1}
            </div>
            <span className={`text-sm font-medium capitalize hidden sm:block ${
              step === s ? 'text-primary' : 'text-muted-foreground'
            }`}>{s}</span>
            {i < 2 && <Separator className="w-12 hidden sm:block" />}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Form Area */}
        <div className="lg:col-span-2">
          {step === 'shipping' && (
            <form onSubmit={handleShippingSubmit} className="space-y-6">
              <h2 className="text-2xl font-bold text-primary font-heading flex items-center gap-2">
                <Truck className="h-6 w-6" /> Shipping Information
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" required value={shippingInfo.firstName} onChange={e => updateShipping('firstName', e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" required value={shippingInfo.lastName} onChange={e => updateShipping('lastName', e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" required value={shippingInfo.email} onChange={e => updateShipping('email', e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" type="tel" required value={shippingInfo.phone} onChange={e => updateShipping('phone', e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="address">Street Address</Label>
                <Input id="address" required value={shippingInfo.address} onChange={e => updateShipping('address', e.target.value)} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input id="city" required value={shippingInfo.city} onChange={e => updateShipping('city', e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="province">Province</Label>
                  <Input id="province" required value={shippingInfo.province} onChange={e => updateShipping('province', e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="zipCode">ZIP Code</Label>
                  <Input id="zipCode" required value={shippingInfo.zipCode} onChange={e => updateShipping('zipCode', e.target.value)} />
                </div>
              </div>
              <Button type="submit" className="w-full rounded-full py-6 text-lg">
                Continue to Payment
              </Button>
            </form>
          )}

          {step === 'payment' && (
            <form onSubmit={handlePaymentSubmit} className="space-y-6">
              <h2 className="text-2xl font-bold text-primary font-heading flex items-center gap-2">
                <CreditCard className="h-6 w-6" /> Payment Information
              </h2>
              <p className="text-muted-foreground">Your payment is processed securely.</p>
              <div>
                <Label htmlFor="cardName">Name on Card</Label>
                <Input id="cardName" required value={paymentInfo.cardName} onChange={e => updatePayment('cardName', e.target.value)} />
              </div>
              <div>
                <Label htmlFor="cardNumber">Card Number</Label>
                <Input id="cardNumber" placeholder="xxxx xxxx xxxx xxxx" required value={paymentInfo.cardNumber} onChange={e => updatePayment('cardNumber', e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="expiry">Expiry Date</Label>
                  <Input id="expiry" placeholder="MM/YY" required value={paymentInfo.expiry} onChange={e => updatePayment('expiry', e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="cvv">CVV</Label>
                  <Input id="cvv" placeholder="xxx" required value={paymentInfo.cvv} onChange={e => updatePayment('cvv', e.target.value)} />
                </div>
              </div>
              <div className="flex gap-4">
                <Button type="button" variant="outline" className="rounded-full" onClick={() => setStep('shipping')}>Back</Button>
                <Button type="submit" className="flex-1 rounded-full py-6 text-lg">Review Order</Button>
              </div>
            </form>
          )}

          {step === 'review' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-primary font-heading flex items-center gap-2">
                <CheckCircle className="h-6 w-6" /> Review Your Order
              </h2>
              <div className="p-4 rounded-xl bg-secondary/30 border border-secondary/50 space-y-3">
                <h3 className="font-semibold text-primary">Shipping To</h3>
                <p className="text-sm text-muted-foreground">{shippingInfo.firstName} {shippingInfo.lastName}</p>
                <p className="text-sm text-muted-foreground">{shippingInfo.address}, {shippingInfo.city}, {shippingInfo.province} {shippingInfo.zipCode}</p>
                <p className="text-sm text-muted-foreground">{shippingInfo.email} | {shippingInfo.phone}</p>
              </div>
              <div className="flex gap-4">
                <Button type="button" variant="outline" className="rounded-full" onClick={() => setStep('payment')}>Back</Button>
                <Button className="flex-1 rounded-full py-6 text-lg" onClick={handlePlaceOrder}>Place Order — ₱{grandTotal.toLocaleString()}</Button>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="p-6 rounded-2xl bg-secondary/20 border border-secondary/30 space-y-4 sticky top-24">
            <h3 className="text-lg font-bold text-primary font-heading">Order Summary</h3>
            <Separator />
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {items.map((item) => (
                <div key={item.variantId} className="flex gap-3 items-center">
                  <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-muted shrink-0">
                    {item.imageUrl ? (
                      <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[8px] text-muted-foreground">N/A</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-primary truncate">{item.name}</p>
                    <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-bold text-accent-foreground">₱{(item.price * item.quantity).toLocaleString()}</p>
                </div>
              ))}
            </div>
            <Separator />
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">₱{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className="font-medium">{shippingTotal === 0 ? 'Free' : `₱${shippingTotal.toLocaleString()}`}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax (12%)</span>
                <span className="font-medium">₱{taxTotal.toLocaleString()}</span>
              </div>
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span className="text-primary">Total</span>
              <span className="text-primary">₱{grandTotal.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="text-center py-24 text-muted-foreground">Loading checkout...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
