"use server";

import { createClient } from '@/lib/server';
import { Database } from '@/types/database.types';
import { redirect } from 'next/navigation';

type Order = Database['public']['Tables']['orders']['Row'];
type OrderItem = Database['public']['Tables']['order_items']['Row'];

export async function getUserOrders() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(count)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) return { success: false, error: error.message };

  // Map data to match the UI expectations
  const orders = data?.map(order => ({
    id: order.id,
    date: new Date(order.created_at).toISOString().split('T')[0],
    total: order.total_amount,
    status: order.status,
    items: order.order_items?.[0]?.count || 0
  })) || [];

  return { success: true, data: orders };
}
