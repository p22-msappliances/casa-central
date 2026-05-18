"use server";

import { createClient } from '@/lib/server';

export async function getAdminStats() {
  const supabase = await createClient();

  const [revenue, orders, products, customers] = await Promise.all([
    supabase.from('orders').select('total_amount'),
    supabase.from('orders').select('id'),
    supabase.from('products').select('id'),
    supabase.from('profiles').select('id'),
  ]);

  const totalRevenue = revenue.data?.reduce((acc, curr) => acc + Number(curr.total_amount), 0) || 0;
  const orderCount = orders.data?.length || 0;
  const productCount = products.data?.length || 0;
  const customerCount = customers.data?.length || 0;

  return {
    success: true,
    data: {
      totalRevenue,
      orderCount,
      productCount,
      customerCount,
    }
  };
}

export async function getAdminOrders() {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      profiles (
        first_name,
        last_name,
        email
      ),
      order_items (
        count
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    return { success: false, error: error.message };
  }

  // Transform the data to match the expected UI format
  const orders = data.map(order => ({
    id: order.id,
    customer: order.profiles 
      ? `${order.profiles.first_name || ''} ${order.profiles.last_name || ''}`.trim() || order.profiles.email 
      : 'Unknown Customer',
    date: new Date(order.created_at).toISOString().split('T')[0],
    total: order.total_amount,
    status: order.status,
    items: order.order_items?.[0]?.count || 0,
  }));

  return { success: true, data: orders };
}
