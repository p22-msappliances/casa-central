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

  // 1. Batch fetch ALL inventory records in ONE query
  const variantIds = orderData.items.map(item => item.variant_id);
  const { data: allInventory, error: invFetchError } = await supabase
    .from('inventory')
    .select('id, variant_id, quantity, product_variants(sku, price, products(id, name, slug))')
    .in('variant_id', variantIds);

  if (invFetchError) return { success: false, error: invFetchError.message };

  // Group by variant_id in memory
  const inventoryByVariant = new Map<string, any[]>();
  for (const inv of allInventory || []) {
    const existing = inventoryByVariant.get(inv.variant_id) || [];
    existing.push(inv);
    inventoryByVariant.set(inv.variant_id, existing);
  }

  // Check stock for ALL items in memory
  for (const item of orderData.items) {
    const invRows = inventoryByVariant.get(item.variant_id) || [];
    const totalAvailable = invRows.reduce((sum, row) => sum + (row.quantity || 0), 0);

    if (totalAvailable < item.quantity) {
      const productName = invRows[0]?.product_variants?.products?.name || `Variant ${item.variant_id.slice(0, 8)}`;
      return { success: false, error: `Insufficient stock for "${productName}". Available: ${totalAvailable}, Requested: ${item.quantity}` };
    }
  }

  // Calculate all inventory updates in memory
  const inventoryUpdates: { id: string; quantity: number }[] = [];
  for (const item of orderData.items) {
    let remaining = item.quantity;
    const invRows = (inventoryByVariant.get(item.variant_id) || [])
      .sort((a, b) => (b.quantity || 0) - (a.quantity || 0));

    for (const inv of invRows) {
      if (remaining <= 0) break;
      const take = Math.min(remaining, inv.quantity || 0);
      if (take > 0) {
        inventoryUpdates.push({ id: inv.id, quantity: (inv.quantity || 0) - take });
        remaining -= take;
      }
    }
  }

  // Execute all inventory updates in parallel
  if (inventoryUpdates.length > 0) {
    const updatePromises = inventoryUpdates.map(u =>
      supabase.from('inventory').update({ quantity: u.quantity }).eq('id', u.id)
    );
    const results = await Promise.all(updatePromises);
    for (const { error: invError } of results) {
      if (invError) return { success: false, error: `Failed to update inventory: ${invError.message}` };
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
    .select('id, user_id, total_amount, status, created_at')
    .single();

  if (orderError) return { success: false, error: orderError.message };

  // 3. Create Order Items (batch insert)
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
    await supabase.from('orders').delete().eq('id', orderId);
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

export async function getAdminOrders(limit = 50, cursor?: string) {
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

  let query = supabase
    .from('orders')
    .select('id, user_id, total_amount, status, created_at, updated_at, shipping_address, profiles(first_name, last_name, email), order_items(count)', { count: 'planned' })
    .order('created_at', { ascending: false });

  if (cursor) {
    query = query.lt('created_at', cursor);
  }

  const { data, error, count } = await query.limit(limit + 1);

  if (error) return { success: false, error: error.message };

  const hasMore = data.length > limit;
  const items = hasMore ? data.slice(0, -1) : data;
  const nextCursor = hasMore ? items[items.length - 1].created_at : null;

  return { success: true, data: items, nextCursor, hasMore, estimatedTotal: count };
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
