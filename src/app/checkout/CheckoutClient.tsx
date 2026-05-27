"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useCartStore, getTotalPrice } from '@/store/useCartStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { CreditCard, Truck, CheckCircle, Loader2, User, Store, Clock, Calendar } from 'lucide-react';
import { atomicCheckoutJson } from '@/app/actions/checkout';
import { createClient } from '@/lib/client';
import { formatPhone, formatPhoneInput } from '@/lib/utils';
import { toast } from 'sonner';

type Step = 'shipping' | 'payment' | 'review';
type DeliveryType = 'delivery' | 'pickup';
type PaymentType = 'pay_on_pickup' | 'pay_later';

interface CheckoutClientProps {
  initialAuthState: 'authenticated' | 'none';
}

export default function CheckoutClient({ initialAuthState }: CheckoutClientProps) {
  const { items, clearCart } = useCartStore();
  const router = useRouter();
  const [authState, setAuthState] = useState<'authenticated' | 'guest' | 'none'>(initialAuthState);
  const [step, setStep] = useState<Step>('shipping');
  const [isProcessing, setIsProcessing] = useState(false);
  const [deliveryType, setDeliveryType] = useState<DeliveryType>('delivery');
  const [paymentType, setPaymentType] = useState<PaymentType>('pay_on_pickup');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
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

  const handleGuestCheckout = async () => {
    const supabase = createClient();
    const { error } = await supabase.auth.signInAnonymously();
    if (error) {
      toast.error('Unable to start guest checkout. Please sign in instead.');
      return;
    }
    setAuthState('guest');
    toast.success('Continuing as guest. You can create an account after checkout.');
  };

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

  const handlePlaceOrder = async () => {
    setIsProcessing(true);
    try {
      const shippingAddress = `${shippingInfo.address}, ${shippingInfo.city}, ${shippingInfo.province} ${shippingInfo.zipCode}`;

      const result = await atomicCheckoutJson({
        items: items.map(item => ({
          variant_id: item.variantId,
          quantity: item.quantity,
          price_at_purchase: item.price,
        })),
        shipping_address: shippingAddress,
        total_amount: grandTotal,
        delivery_type: deliveryType,
        payment_type: paymentType,
        scheduled_date: scheduledDate || undefined,
        scheduled_time: undefined,
      });

      if (!result.success || !result.order_id) {
        toast.error(result.error || 'Checkout failed');
        setIsProcessing(false);
        return;
      }

      toast.success('Order placed successfully!');
      clearCart();
      router.push(`/orders/confirmation?orderId=${result.order_id}`);
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('An unexpected error occurred while placing your order');
    } finally {
      setIsProcessing(false);
    }
  };

  const updateShipping = (field: string, value: string) => {
    setShippingInfo(prev => ({ ...prev, [field]: value }));
  };

  const updatePayment = (field: string, value: string) => {
    setPaymentInfo(prev => ({ ...prev, [field]: value }));
  };

  const today = new Date().toISOString().split('T')[0];

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

  if (authState === 'none') {
    return (
      <div className="container mx-auto px-4 py-16 text-center space-y-8 max-w-lg">
        <User className="h-16 w-16 text-primary/50 mx-auto" />
        <h1 className="text-3xl font-bold text-primary font-heading">Checkout</h1>
        <p className="text-muted-foreground">Sign in to your account or continue as a guest.</p>
        <div className="flex flex-col gap-4">
          <Link href="/sign-in?redirect=/checkout" className="w-full">
            <Button className="w-full rounded-full py-6 text-lg">Sign In</Button>
          </Link>
          <Button variant="outline" className="w-full rounded-full py-6 text-lg" onClick={handleGuestCheckout}>
            Continue as Guest
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Steps Indicator */}
      <div className="flex items-center justify-center mb-12">
        {(['shipping', 'payment', 'review'] as Step[]).map((s, i) => {
          const stepIndex = ['shipping', 'payment', 'review'].indexOf(step);
          const isCompleted = stepIndex > i;
          const isCurrent = step === s;
          return (
            <React.Fragment key={s}>
              {i > 0 && (
                <div className={`w-16 sm:w-24 h-0.5 mx-2 transition-colors duration-300 ${isCompleted ? 'bg-primary' : 'bg-border'}`} />
              )}
              <div className="flex flex-col items-center gap-2">
                <div className={`flex items-center justify-center w-10 h-10 shrink-0 rounded-full text-sm font-bold transition-all duration-300 ${
                  isCurrent ? 'bg-primary text-primary-foreground shadow-lg ring-4 ring-primary/20' :
                  isCompleted ? 'bg-primary/20 text-primary ring-2 ring-primary/30' :
                  'bg-muted text-muted-foreground ring-2 ring-border'
                }`}>
                  {isCompleted ? <CheckCircle className="h-5 w-5" /> : i + 1}
                </div>
                <span className={`text-xs font-medium capitalize ${
                  isCurrent ? 'text-primary font-semibold' : 'text-muted-foreground'
                }`}>{s}</span>
              </div>
            </React.Fragment>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          {step === 'shipping' && (
            <form onSubmit={handleShippingSubmit} className="space-y-6">
              <h2 className="text-2xl font-bold text-primary font-heading flex items-center gap-2">
                <Truck className="h-6 w-6" /> Delivery Options
              </h2>

              {/* Delivery Type */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setDeliveryType('delivery')}
                  className={`p-6 rounded-2xl border-2 text-left transition-all ${
                    deliveryType === 'delivery'
                      ? 'border-primary bg-primary/5 shadow-md'
                      : 'border-border/60 bg-white hover:border-primary/30'
                  }`}
                >
                  <Truck className={`h-8 w-8 mb-3 ${deliveryType === 'delivery' ? 'text-primary' : 'text-muted-foreground'}`} />
                  <p className="font-bold text-primary">Delivery</p>
                  <p className="text-xs text-muted-foreground mt-1">Ship to your address</p>
                </button>
                <button
                  type="button"
                  onClick={() => setDeliveryType('pickup')}
                  className={`p-6 rounded-2xl border-2 text-left transition-all ${
                    deliveryType === 'pickup'
                      ? 'border-primary bg-primary/5 shadow-md'
                      : 'border-border/60 bg-white hover:border-primary/30'
                  }`}
                >
                  <Store className={`h-8 w-8 mb-3 ${deliveryType === 'pickup' ? 'text-primary' : 'text-muted-foreground'}`} />
                  <p className="font-bold text-primary">Pick Up</p>
                  <p className="text-xs text-muted-foreground mt-1">Collect at our store</p>
                </button>
              </div>

              {/* Shipping Address (only for delivery) */}
              {deliveryType === 'delivery' && (
                <div className="space-y-4 p-6 rounded-2xl bg-secondary/10 border border-secondary/30">
                  <h3 className="text-lg font-bold text-primary font-heading">Shipping Address</h3>
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
                      <Input id="phone" type="tel" required value={shippingInfo.phone} onChange={e => updateShipping('phone', formatPhoneInput(e.target.value))} onBlur={e => updateShipping('phone', formatPhone(e.target.value))} />
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
                </div>
              )}

              {/* Pickup info */}
              {deliveryType === 'pickup' && (
                <div className="p-6 rounded-2xl bg-secondary/10 border border-secondary/30 space-y-3">
                  <h3 className="text-lg font-bold text-primary font-heading flex items-center gap-2">
                    <Store className="h-5 w-5" /> Pickup Location
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Casa Central Store — 123 Commerce St, Manila
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="pickupName">Your Name</Label>
                      <Input id="pickupName" required value={shippingInfo.firstName} onChange={e => updateShipping('firstName', e.target.value)} />
                    </div>
                    <div>
                      <Label htmlFor="pickupPhone">Phone Number</Label>
                      <Input id="pickupPhone" type="tel" required value={shippingInfo.phone} onChange={e => updateShipping('phone', formatPhoneInput(e.target.value))} onBlur={e => updateShipping('phone', formatPhone(e.target.value))} />
                    </div>
                  </div>
                </div>
              )}

              {/* Schedule */}
              <div className="p-6 rounded-2xl bg-secondary/10 border border-secondary/30 space-y-4">
                <h3 className="text-lg font-bold text-primary font-heading flex items-center gap-2">
                  <Calendar className="h-5 w-5" /> Schedule
                </h3>
                <p className="text-sm text-muted-foreground">
                  {deliveryType === 'delivery' ? 'Choose your preferred delivery date.' : 'Choose when you will pick up your order.'}
                </p>
                <div>
                  <Label htmlFor="scheduledDate">Date</Label>
                  <Input id="scheduledDate" type="date" min={today} value={scheduledDate} onChange={e => setScheduledDate(e.target.value)} />
                </div>
              </div>

              <div className="flex gap-4">
                <Button type="button" variant="outline" className="rounded-full px-8 py-7 text-lg" onClick={() => router.back()}>Back</Button>
                <Button type="submit" className="flex-1 rounded-full py-7 text-lg">
                  Continue to Payment
                </Button>
              </div>
            </form>
          )}

          {step === 'payment' && (
            <form onSubmit={handlePaymentSubmit} className="space-y-6">
              <h2 className="text-2xl font-bold text-primary font-heading flex items-center gap-2">
                <CreditCard className="h-6 w-6" /> Payment Option
              </h2>
              <p className="text-muted-foreground">Choose how you would like to pay.</p>

              {/* Payment Type */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setPaymentType('pay_on_pickup')}
                  className={`p-8 rounded-2xl border-2 text-left transition-all ${
                    paymentType === 'pay_on_pickup'
                      ? 'border-primary bg-primary/5 shadow-md'
                      : 'border-border/60 bg-white hover:border-primary/30'
                  }`}
                >
                  <Truck className={`h-10 w-10 mb-3 ${paymentType === 'pay_on_pickup' ? 'text-primary' : 'text-muted-foreground'}`} />
                  <p className="font-bold text-lg text-primary">Pay on {deliveryType === 'pickup' ? 'Pick Up' : 'Delivery'}</p>
                  <p className="text-sm text-muted-foreground mt-1">Pay when you receive your order</p>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentType('pay_later')}
                  className={`p-8 rounded-2xl border-2 text-left transition-all ${
                    paymentType === 'pay_later'
                      ? 'border-primary bg-primary/5 shadow-md'
                      : 'border-border/60 bg-white hover:border-primary/30'
                  }`}
                >
                  <Clock className={`h-10 w-10 mb-3 ${paymentType === 'pay_later' ? 'text-primary' : 'text-muted-foreground'}`} />
                  <p className="font-bold text-lg text-primary">Pay Later</p>
                  <p className="text-sm text-muted-foreground mt-1">Pay after order is confirmed</p>
                </button>
              </div>

              <div className="flex gap-4">
                <Button type="button" variant="outline" className="rounded-full px-8 py-7 text-lg" onClick={() => setStep('shipping')}>Back</Button>
                <Button type="submit" className="flex-1 rounded-full py-7 text-lg">Review Order</Button>
              </div>
            </form>
          )}

          {step === 'review' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-primary font-heading flex items-center gap-2">
                <CheckCircle className="h-6 w-6" /> Review Your Order
              </h2>
              <div className="p-4 rounded-xl bg-secondary/30 border border-secondary/50 space-y-3">
                <h3 className="font-semibold text-primary">{deliveryType === 'delivery' ? 'Shipping To' : 'Pickup Info'}</h3>
                {deliveryType === 'delivery' ? (
                  <>
                    <p className="text-sm text-muted-foreground">{shippingInfo.firstName} {shippingInfo.lastName}</p>
                    <p className="text-sm text-muted-foreground">{shippingInfo.address}, {shippingInfo.city}, {shippingInfo.province} {shippingInfo.zipCode}</p>
                    <p className="text-sm text-muted-foreground">{shippingInfo.email} | {shippingInfo.phone}</p>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground">Name: {shippingInfo.firstName}</p>
                    <p className="text-sm text-muted-foreground">Phone: {shippingInfo.phone}</p>
                    <p className="text-sm text-muted-foreground">Casa Central Store — 123 Commerce St, Manila</p>
                  </>
                )}
              </div>
              {scheduledDate && (
                <div className="p-4 rounded-xl bg-secondary/30 border border-secondary/50 space-y-1">
                  <h3 className="font-semibold text-primary">Schedule</h3>
                  {scheduledDate && <p className="text-sm text-muted-foreground">Date: {scheduledDate}</p>}
                </div>
              )}
              <div className="p-4 rounded-xl bg-secondary/30 border border-secondary/50 space-y-1">
                <h3 className="font-semibold text-primary">Payment</h3>
                <p className="text-sm text-muted-foreground">
                  {paymentType === 'pay_on_pickup' ? `Pay on ${deliveryType === 'pickup' ? 'Pick Up' : 'Delivery'}` : 'Pay Later'}
                </p>
              </div>
              <div className="flex gap-4">
                <Button type="button" variant="outline" className="rounded-full px-8 py-7 text-lg" onClick={() => setStep('payment')}>Back</Button>
                <Button 
                  className="flex-1 rounded-full py-7 text-lg" 
                  onClick={handlePlaceOrder}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Processing Order...
                    </>
                  ) : (
                    `Place Order — ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(grandTotal))}`
                  )}
                </Button>
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
                  <p className="text-sm font-bold text-accent-foreground">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(item.price * item.quantity))}</p>
                </div>
              ))}
            </div>
            <Separator />
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(subtotal))}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className="font-medium">{shippingTotal === 0 ? 'Free' : new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(shippingTotal))}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax (12%)</span>
                <span className="font-medium">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(taxTotal))}</span>
              </div>
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span className="text-primary">Total</span>
              <span className="text-primary">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(grandTotal))}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
