/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Eye, Loader2, X, ChevronDown, Plus, Receipt } from 'lucide-react';
import { getAdminOrders, getAdminOrderById } from '@/app/actions/admin';
import { updateOrderStatus, recordPayment } from '@/app/actions/orders';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-blue-500/10 text-blue-500',
  PROCESSING: 'bg-yellow-500/10 text-yellow-500',
  SHIPPED: 'bg-primary/10 text-primary',
  DELIVERED: 'bg-green-500/10 text-green-500',
  CANCELLED: 'bg-red-500/10 text-red-500',
  PAID: 'bg-emerald-500/10 text-emerald-500',
};

const STATUS_FLOW: Record<string, string[]> = {
  PENDING: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
  PAID: ['PROCESSING'],
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [orderDetail, setOrderDetail] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [paymentTxnId, setPaymentTxnId] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    try {
      const result = await getAdminOrders();
      if (result.success) {
        setOrders(result.data || []);
      } else {
        toast.error('Failed to load orders');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }

  async function openOrderDetail(id: string) {
    setSelectedOrder({ id });
    setDetailLoading(true);
    setOrderDetail(null);
    try {
      const result = await getAdminOrderById(id);
      console.log('getAdminOrderById result:', JSON.stringify(result, null, 2));
      if (result.success) {
        setOrderDetail(result.data);
        setPaymentAmount(String(result.data?.total_amount || ''));
      } else {
        toast.error(`Failed to load order details: ${result.error}`);
      }
    } catch (err) {
      console.error('openOrderDetail error:', err);
      toast.error(`An unexpected error occurred: ${err}`);
    } finally {
      setDetailLoading(false);
    }
  }

  async function handleStatusChange(newStatus: string) {
    if (!selectedOrder?.id) return;
    const result = await updateOrderStatus(selectedOrder.id, newStatus as any);
    if (result.success) {
      toast.success(`Status updated to ${newStatus}`);
      openOrderDetail(selectedOrder.id);
      fetchOrders();
    } else {
      toast.error(result.error || 'Failed to update status');
    }
  }

  async function handleRecordPayment() {
    if (!selectedOrder?.id || !paymentAmount) return;
    const result = await recordPayment(selectedOrder.id, {
      amount: parseFloat(paymentAmount),
      method: paymentMethod,
      transaction_id: paymentTxnId || undefined,
    });
    if (result.success) {
      toast.success('Payment recorded successfully');
      openOrderDetail(selectedOrder.id);
      fetchOrders();
    } else {
      toast.error(result.error || 'Failed to record payment');
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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
            {orders.map((order) => (
              <tr key={order.id} className="border-b border-secondary/10 hover:bg-secondary/10 transition-colors">
                <td className="p-4 font-medium text-primary">
                  #{order.id.slice(0, 8).toUpperCase()}
                </td>
                <td className="p-4 text-muted-foreground">{order.customer}</td>
                <td className="p-4 text-muted-foreground">{order.date}</td>
                <td className="p-4 text-muted-foreground">{order.items}</td>
                <td className="p-4 font-semibold">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(order.total))}</td>
                <td className="p-4">
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${STATUS_COLORS[order.status] || 'bg-gray-500/10 text-gray-500'}`}>
                    {order.status}
                  </span>
                </td>
                <td className="p-4">
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => openOrderDetail(order.id)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={7} className="p-8 text-center text-muted-foreground">
                  No orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {orderDetail ? `Order #${orderDetail.id.slice(0, 8).toUpperCase()}` : 'Loading...'}
            </DialogTitle>
          </DialogHeader>

          {detailLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : orderDetail ? (
            <div className="space-y-6">
              {/* Status & Actions */}
              <div className="flex items-center gap-3 flex-wrap">
                <Badge className={STATUS_COLORS[orderDetail.status] || ''}>
                  {orderDetail.status}
                </Badge>
                {STATUS_FLOW[orderDetail.status]?.length > 0 && (
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <Button variant="outline" size="sm" className="gap-1">
                        Update Status <ChevronDown className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {STATUS_FLOW[orderDetail.status].map((s) => (
                        <DropdownMenuItem key={s} onSelect={() => handleStatusChange(s)}>
                          {s}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>

              {/* Customer Info */}
              <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-secondary/20 border border-secondary/30">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Customer</p>
                  <p className="font-medium text-primary">
                    {orderDetail.profiles
                      ? `${orderDetail.profiles.first_name || ''} ${orderDetail.profiles.last_name || ''}`.trim() || orderDetail.profiles.email
                      : 'Unknown'}
                  </p>
                  <p className="text-sm text-muted-foreground">{orderDetail.profiles?.email}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Contact</p>
                  <p className="text-sm text-muted-foreground">{orderDetail.profiles?.phone_number || 'N/A'}</p>
                </div>
              </div>

              {/* Shipping Address */}
              <div>
                <h3 className="text-sm font-semibold text-primary mb-2">Shipping Address</h3>
                <p className="text-sm text-muted-foreground p-3 rounded-lg bg-secondary/10">
                  {orderDetail.shipping_address || 'No address provided'}
                </p>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="text-sm font-semibold text-primary mb-2">Items ({orderDetail.order_items?.length || 0})</h3>
                <div className="rounded-lg border border-secondary/20 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-secondary/20 text-muted-foreground">
                        <th className="p-3 text-left font-medium">Product</th>
                        <th className="p-3 text-left font-medium">SKU</th>
                        <th className="p-3 text-center font-medium">Qty</th>
                        <th className="p-3 text-right font-medium">Price</th>
                        <th className="p-3 text-right font-medium">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orderDetail.order_items?.map((item: any, idx: number) => (
                        <tr key={idx} className="border-t border-secondary/10">
                          <td className="p-3 font-medium text-primary">
                            {item.product_variants?.products?.name || 'Unknown Product'}
                          </td>
                          <td className="p-3 text-muted-foreground font-mono text-xs">
                            {item.product_variants?.sku || '-'}
                          </td>
                          <td className="p-3 text-center">{item.quantity}</td>
                          <td className="p-3 text-right">
                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(item.price_at_purchase)}
                          </td>
                          <td className="p-3 text-right font-semibold">
                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(item.price_at_purchase * item.quantity)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Total */}
              <div className="flex justify-end">
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Total Amount</p>
                  <p className="text-2xl font-bold text-primary">
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(orderDetail.total_amount))}
                  </p>
                </div>
              </div>

              {/* Payments */}
              <div>
                <h3 className="text-sm font-semibold text-primary mb-2 flex items-center gap-2">
                  <Receipt className="h-4 w-4" /> Payments
                </h3>
                {orderDetail.payments?.length > 0 ? (
                  <div className="space-y-2">
                    {orderDetail.payments.map((p: any) => (
                      <div key={p.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/10 border border-secondary/20">
                        <div>
                          <p className="text-sm font-medium text-primary">{p.method}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(p.created_at).toLocaleDateString()} {p.transaction_id ? `· ${p.transaction_id}` : ''}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-primary">
                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(p.amount)}
                          </p>
                          <Badge variant="outline" className="text-xs">{p.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">No payments recorded</p>
                )}
              </div>

              {/* Record Payment */}
              <div className="p-4 rounded-xl bg-secondary/20 border border-secondary/30 space-y-3">
                <h3 className="text-sm font-semibold text-primary">Record Payment</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">Amount</Label>
                    <Input
                      type="number"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      placeholder="0.00"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Method</Label>
                    <Select value={paymentMethod} onValueChange={(v) => v && setPaymentMethod(v)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CASH">Cash</SelectItem>
                        <SelectItem value="CARD">Card</SelectItem>
                        <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                        <SelectItem value="GCASH">GCash</SelectItem>
                        <SelectItem value="MAYA">Maya</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Transaction ID (optional)</Label>
                  <Input
                    value={paymentTxnId}
                    onChange={(e) => setPaymentTxnId(e.target.value)}
                    placeholder="e.g. TXN-12345"
                    className="mt-1"
                  />
                </div>
                <Button onClick={handleRecordPayment} className="w-full gap-2">
                  <Plus className="h-4 w-4" /> Record Payment
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">Failed to load order details.</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
