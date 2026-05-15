"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';

const mockOrders = [
  { id: 'CC-ABC123', customer: 'Maria Santos', date: '2026-05-10', total: 65000, status: 'Shipped', items: 3 },
  { id: 'CC-DEF456', customer: 'Jose Reyes', date: '2026-05-09', total: 25000, status: 'Pending', items: 1 },
  { id: 'CC-GHI789', customer: 'Anna Cruz', date: '2026-05-08', total: 95000, status: 'Delivered', items: 2 },
  { id: 'CC-JKL012', customer: 'Pedro Tan', date: '2026-05-07', total: 42000, status: 'Processing', items: 1 },
  { id: 'CC-MNO345', customer: 'Sofia Garcia', date: '2026-05-06', total: 78000, status: 'Cancelled', items: 2 },
];

export default function AdminOrdersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary font-heading">Orders</h1>
        <p className="text-muted-foreground mt-1">Manage customer orders.</p>
      </div>
      <div className="rounded-xl bg-card border border-secondary/30 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-muted-foreground border-b border-secondary/30 bg-secondary/20">
              <th className="p-4 font-medium">Order ID</th>
              <th className="p-4 font-medium">Customer</th>
              <th className="p-4 font-medium">Date</th>
              <th className="p-4 font-medium">Items</th>
              <th className="p-4 font-medium">Total</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {mockOrders.map((order) => (
              <tr key={order.id} className="border-b border-secondary/10 hover:bg-secondary/10 transition-colors">
                <td className="p-4 font-mono font-medium text-primary">{order.id}</td>
                <td className="p-4 text-muted-foreground">{order.customer}</td>
                <td className="p-4 text-muted-foreground">{order.date}</td>
                <td className="p-4 text-muted-foreground">{order.items}</td>
                <td className="p-4 font-semibold">₱{order.total.toLocaleString()}</td>
                <td className="p-4">
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                    order.status === 'Delivered' ? 'bg-green-500/10 text-green-500' :
                    order.status === 'Shipped' ? 'bg-primary/10 text-primary' :
                    order.status === 'Processing' ? 'bg-yellow-500/10 text-yellow-500' :
                    order.status === 'Pending' ? 'bg-blue-500/10 text-blue-500' :
                    'bg-red-500/10 text-red-500'
                  }`}>{order.status}</span>
                </td>
                <td className="p-4">
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                    <Eye className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
