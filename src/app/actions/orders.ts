/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { createClient } from '@/lib/server';
import { Database } from '@/types/database.types';
import { revalidatePath } from 'next/cache';

type Order = Database['public']['Tables']['orders']['Row'];
type OrderItem = Database['public']['Tables']['order_items']['Insert'];

export async function getUserOrders() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*), payments(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) return { success: false, error: error.message };
  return { success: true, data };
}

export async function getOrderById(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*, product_variants(*)), payments(*)')
    .eq('id', id)
    .single();

  if (error) return { success: false, error: error.message };

  if (data.user_id !== user.id) {
    return { success: false, error: 'Unauthorized' };
  }

  return { success: true, data };
}

export async function createOrder(orderData: {
  items: { variant_id: string; quantity: number; price_at_purchase: number }[];
  shipping_address: string;
  total_amount: number;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: 'Not authenticated' };

  const orderId = crypto.randomUUID();

  // 1. Check and Decrement Inventory
  for (const item of orderData.items) {
    const { data: invRows } = await supabase
      .from('inventory')
      .select('id, quantity, product_variants(sku, price, products(id, name, slug))')
      .eq('variant_id', item.variant_id);

    const totalAvailable = invRows?.reduce((sum, row) => sum + (row.quantity || 0), 0) || 0;

    if (totalAvailable < item.quantity) {
      const productName = (invRows?.[0] as any)?.product_variants?.products?.name || `Variant ${item.variant_id.slice(0, 8)}`;
      return { success: false, error: `Insufficient stock for "${productName}". Available: ${totalAvailable}, Requested: ${item.quantity}` };
    }

    // Decrement from warehouses with stock (FIFO)
    let remaining = item.quantity;
    for (const inv of (invRows || []).sort((a, b) => (b.quantity || 0) - (a.quantity || 0))) {
      if (remaining <= 0) break;
      const take = Math.min(remaining, inv.quantity || 0);
      if (take > 0) {
        const { error: invError } = await supabase
          .from('inventory')
          .update({ quantity: (inv.quantity || 0) - take })
          .eq('id', inv.id);

        if (invError) return { success: false, error: `Failed to update inventory: ${invError.message}` };
        remaining -= take;
      }
    }
  }

  // 2. Create Order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert([{
      id: orderId,
      user_id: user.id,
      shipping_address: orderData.shipping_address,
      total_amount: orderData.total_amount,
      status: 'PENDING',
    }])
    .select()
    .single();

  if (orderError) return { success: false, error: orderError.message };

  // 3. Create Order Items
  const orderItems = orderData.items.map(item => ({
    id: crypto.randomUUID(),
    order_id: orderId,
    variant_id: item.variant_id,
    quantity: item.quantity,
    price_at_purchase: item.price_at_purchase,
  }));

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems);

  if (itemsError) {
    // Rollback: ideally would use a DB transaction, but since we can't easily here, we just delete the order
    await supabase.from('orders').delete().eq('id', orderId);
    // Note: Inventory rollback would be complex here without a real transaction
    return { success: false, error: itemsError.message };
  }

  revalidatePath('/account/orders');
  return { success: true, data: order };
}

export async function updateOrderStatus(orderId: string, status: Database['public']['Enums']['order_status']) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: 'Not authenticated' };

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || !['ADMIN', 'SUPER_ADMIN', 'CUSTOMER_SUPPORT'].includes(profile.role!)) {
    return { success: false, error: 'Unauthorized' };
  }

  const { data, error } = await supabase
    .from('orders')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', orderId)
    .select()
    .single();

  if (error) return { success: false, error: error.message };
  revalidatePath('/admin/orders');
  return { success: true, data };
}

export async function recordPayment(orderId: string, paymentData: {
  amount: number;
  method: string;
  transaction_id?: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('payments')
    .insert([{
      id: crypto.randomUUID(),
      order_id: orderId,
      amount: paymentData.amount,
      method: paymentData.method,
      transaction_id: paymentData.transaction_id,
      status: 'COMPLETED', // Set to completed since we're mocking the payment success
    }])
    .select()
    .single();

  if (error) return { success: false, error: error.message };

  await updateOrderStatus(orderId, 'PAID');
  revalidatePath('/account/orders');
  return { success: true, data };
}

export async function getAdminOrders(limit = 50, offset = 0) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: 'Not authenticated' };

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || !['ADMIN', 'SUPER_ADMIN', 'CUSTOMER_SUPPORT'].includes(profile.role!)) {
    return { success: false, error: 'Unauthorized' };
  }

  const { data, error, count } = await supabase
    .from('orders')
    .select('*, profiles(first_name, last_name, email), order_items(*)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) return { success: false, error: error.message };
  return { success: true, data, total: count };
}

export async function deleteOrder(orderId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: 'Not authenticated' };

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'SUPER_ADMIN') {
    return { success: false, error: 'Unauthorized' };
  }

  const { error } = await supabase
    .from('orders')
    .delete()
    .eq('id', orderId);

  if (error) return { success: false, error: error.message };
  revalidatePath('/admin/orders');
  return { success: true };
}
