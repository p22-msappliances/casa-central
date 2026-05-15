"use client";

import React from 'react';

import { Button } from '@/components/ui/button';
import { Package, Eye } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

const mockOrders = [
  { id: 'CC-ABC123', date: '2026-05-10', total: 95000, status: 'Shipped', items: 3 },
  { id: 'CC-DEF456', date: '2026-04-28', total: 45000, status: 'Delivered', items: 1 },
  { id: 'CC-GHI789', date: '2026-04-15', total: 120000, status: 'Delivered', items: 2 },
];

export default function OrdersPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-primary font-heading flex items-center gap-2">
        <Package className="h-6 w-6" /> My Orders
      </h2>
      {mockOrders.length === 0 ? (
        <div className="text-center py-12 space-y-4">
          <Package className="h-16 w-16 text-muted-foreground/30 mx-auto" />
          <p className="text-muted-foreground">No orders yet.</p>
          <Link href="/products">
            <Button className="rounded-full px-8">Start Shopping</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {mockOrders.map((order) => (
            <div key={order.id} className="p-4 rounded-xl bg-secondary/20 border border-secondary/30 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-bold text-primary font-mono">{order.id}</p>
                <p className="text-xs text-muted-foreground">{order.date} · {order.items} item(s)</p>
                <p className="text-sm font-semibold text-accent-foreground">₱{order.total.toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                  order.status === 'Shipped' ? 'bg-primary/10 text-primary' :
                  order.status === 'Delivered' ? 'bg-green-500/10 text-green-500' :
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
