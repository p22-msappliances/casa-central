/* eslint-disable @typescript-eslint/no-explicit-any */
import { getUserOrders } from '@/app/actions/orders';
import { Button } from '@/components/ui/button';
import { Package, Eye } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function OrdersPage() {
  const result = await getUserOrders();
  const orders = result.success ? (result.data || []) : [];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-primary font-heading flex items-center gap-2">
        <Package className="h-6 w-6" /> My Orders
      </h2>
      {orders.length === 0 ? (
        <div className="text-center py-12 space-y-4">
          <Package className="h-16 w-16 text-muted-foreground/30 mx-auto" />
          <p className="text-muted-foreground">No orders yet.</p>
          <Link href="/products">
            <Button className="rounded-full px-8">Start Shopping</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order: any) => (
            <div key={order.id} className="p-4 rounded-xl bg-secondary/20 border border-secondary/30 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-bold text-primary">Order #{order.id.slice(0, 8).toUpperCase()}</p>
                <p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString('en-US')} · {order.order_items?.length || 0} item(s)</p>
                <p className="text-sm font-semibold text-accent-foreground">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(order.total_amount))}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                  order.status === 'SHIPPED' ? 'bg-primary/10 text-primary' :
                  order.status === 'DELIVERED' ? 'bg-green-500/10 text-green-500' :
                  'bg-yellow-500/10 text-yellow-500'
                }`}>{order.status}</span>
                <Link href={`/orders/${order.id}`}>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Eye className="h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
