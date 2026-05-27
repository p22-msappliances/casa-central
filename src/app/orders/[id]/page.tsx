/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from '@/lib/server';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Package, CreditCard, MapPin, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-500/10 text-yellow-500',
  PAID: 'bg-blue-500/10 text-blue-500',
  SHIPPED: 'bg-primary/10 text-primary',
  DELIVERED: 'bg-green-500/10 text-green-500',
  CANCELLED: 'bg-red-500/10 text-red-500',
};

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return notFound();

  const { data: order, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (
        id, quantity, price_at_purchase,
        product_variants (
          id, sku, price, image_url, attributes,
          products (id, name, slug, image_url)
        )
      ),
      payments (id, amount, method, status, transaction_id, created_at)
    `)
    .eq('id', id)
    .single();

  if (error || !order || order.user_id !== user.id) return notFound();

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/account/orders">
          <Button variant="ghost" size="icon" className="rounded-full"><ArrowLeft className="h-5 w-5" /></Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-primary font-heading flex items-center gap-2">
            <Package className="h-7 w-7" /> Order #{id.slice(0, 8).toUpperCase()}
          </h1>
          <p className="text-sm text-muted-foreground">{new Date(order.created_at).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Badge className={`text-sm px-4 py-1 ${statusColors[order.status] || ''}`}>{order.status}</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-5 rounded-xl bg-card border border-secondary/30 space-y-3">
          <h3 className="font-bold text-primary flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            {order.delivery_type === 'pickup' ? 'Pick Up' : 'Shipping Address'}
          </h3>
          {order.delivery_type === 'pickup' ? (
            <p className="text-sm text-muted-foreground">Customer will pick up at store</p>
          ) : (
            <p className="text-sm text-muted-foreground">{order.shipping_address}</p>
          )}
        </div>
        <div className="p-5 rounded-xl bg-card border border-secondary/30 space-y-3">
          <h3 className="font-bold text-primary flex items-center gap-2"><CreditCard className="h-4 w-4" /> Payment</h3>
          {order.payments?.length > 0 ? (
            order.payments.map((p: any) => (
              <div key={p.id} className="text-sm text-muted-foreground space-y-1">
                <p>{p.method} — {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(p.amount))}</p>
                <p>Status: {p.status} · Ref: {p.transaction_id}</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No payment recorded</p>
          )}
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="text-lg font-bold text-primary font-heading">Order Items</h3>
        {order.order_items?.map((item: any) => {
          const product = item.product_variants?.products;
          return (
            <div key={item.id} className="flex items-center gap-4 p-4 rounded-xl bg-card border border-secondary/30">
              <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center text-[10px] text-muted-foreground shrink-0 overflow-hidden">
                {product?.image_url ? (
                  <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                ) : 'N/A'}
              </div>
              <div className="flex-1 min-w-0">
                <Link href={`/products/${product?.slug}`} className="font-semibold text-primary hover:text-accent-foreground transition-colors truncate block">
                  {product?.name || 'Unknown Product'}
                </Link>
                <p className="text-xs text-muted-foreground">SKU: {item.product_variants?.sku || 'N/A'} · Qty: {item.quantity}</p>
              </div>
              <p className="font-bold text-accent-foreground">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(item.price_at_purchase * item.quantity))}</p>
            </div>
          );
        })}
      </div>

      <Separator />

      <div className="flex justify-between items-center">
        <span className="text-lg text-muted-foreground">Total</span>
        <span className="text-2xl font-bold text-primary">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(order.total_amount))}</span>
      </div>

      <div className="text-center pt-4">
        <Link href="/products"><Button variant="outline" className="rounded-full px-8">Continue Shopping</Button></Link>
      </div>
    </div>
  );
}
