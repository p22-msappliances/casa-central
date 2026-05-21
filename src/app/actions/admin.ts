/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { createClient } from '@/lib/server';
import { Database } from '@/types/database.types';

export async function getAdminStats() {
  const supabase = await createClient();

  const [revenueResult, orderCountResult, productCountResult, customerCountResult] = await Promise.all([
    supabase.from('orders').select('total_amount'),
    supabase.from('orders').select('*', { count: 'exact', head: true }),
    supabase.from('products').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'CUSTOMER'),
  ]);

  const totalRevenue = revenueResult.data?.reduce((acc, curr) => acc + Number(curr.total_amount), 0) || 0;

  return {
    success: true,
    data: {
      totalRevenue,
      orderCount: orderCountResult.count || 0,
      productCount: productCountResult.count || 0,
      customerCount: customerCountResult.count || 0,
    }
  };
}

export async function getDashboardCharts() {
  const supabase = await createClient();

  // 1. Monthly Sales
  const { data: salesData, error: salesError } = await supabase
    .from('orders')
    .select('created_at, total_amount')
    .order('created_at', { ascending: true });

  // 2. Revenue by Category
  const { data: categoryData, error: catError } = await supabase
    .from('order_items')
    .select('price_at_purchase, quantity, product_variants(products(category(name)))');

  if (salesError || catError) {
    return { success: false, error: salesError?.message || catError?.message };
  }

  // Process Monthly Sales
  const monthlyMap: Record<string, { sales: number; orders: number }> = {};
  salesData?.forEach(order => {
    const month = new Date(order.created_at).toLocaleString('default', { month: 'short' });
    if (!monthlyMap[month]) monthlyMap[month] = { sales: 0, orders: 0 };
    monthlyMap[month].sales += Number(order.total_amount);
    monthlyMap[month].orders += 1;
  });

  const formattedSales = Object.entries(monthlyMap).map(([month, data]) => ({
    month,
    sales: data.sales,
    orders: data.orders,
  }));

  // Process Revenue by Category
  const categoryMap: Record<string, number> = {};
  categoryData?.forEach(item => {
    const product = (item.product_variants as any)?.products;
    const catName = product?.category?.name || 'Other';
    const revenue = Number(item.price_at_purchase) * Number(item.quantity);
    categoryMap[catName] = (categoryMap[catName] || 0) + revenue;
  });

  const formattedPerformance = Object.entries(categoryMap).map(([name, revenue]) => ({
    name,
    revenue,
  })).sort((a, b) => b.revenue - a.revenue);

  return {
    success: true,
    data: {
      salesData: formattedSales,
      productPerformance: formattedPerformance,
    }
  };
}

export async function getAdminOrders(limit = 50, cursor?: string) {
  const supabase = await createClient();

  let query = supabase
    .from('orders')
    .select(`
      id, user_id, total_amount, status, created_at,
      profiles (
        first_name,
        last_name,
        email
      ),
      order_items (
        count
      )
    `, { count: 'planned' })
    .order('created_at', { ascending: false });

  if (cursor) {
    query = query.lt('created_at', cursor);
  }

  const { data, error, count } = await query.limit(limit + 1);

  if (error) {
    return { success: false, error: error.message };
  }

  const hasMore = data.length > limit;
  const items = hasMore ? data.slice(0, -1) : data;
  const nextCursor = hasMore ? items[items.length - 1].created_at : null;

  const orders = items.map((order: any) => ({
    id: order.id,
    customer: order.profiles
      ? `${order.profiles.first_name || ''} ${order.profiles.last_name || ''}`.trim() || order.profiles.email
      : 'Unknown Customer',
    date: new Date(order.created_at).toISOString().split('T')[0],
    total: order.total_amount,
    status: order.status,
    items: order.order_items?.[0]?.count || 0,
  }));

  return { success: true, data: orders, nextCursor, hasMore, estimatedTotal: count };
}

export async function getAdminOrderById(id: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      profiles (
        id,
        first_name,
        last_name,
        email,
        phone_number
      ),
      order_items (
        *,
        product_variants (
          sku,
          price,
          products (
            id,
            name,
            slug,
            image_url
          )
        )
      ),
      payments (
        id,
        created_at,
        amount,
        method,
        status,
        transaction_id
      )
    `)
    .eq('id', id)
    .single();

  if (error) return { success: false, error: error.message };

  return { success: true, data };
}

export async function getCMSContent(key: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('cms_content')
    .select('*')
    .eq('key', key)
    .single();

  if (error && error.code !== 'PGRST116') {
    return { success: false, error: error.message };
  }

  return { success: true, data: data || null };
}

export async function getAllCMSContent() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('cms_content')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return { success: false, error: error.message };
  return { success: true, data };
}

export async function updateCMSContent(key: string, value: any, type?: Database['public']['Enums']['cms_content_type']) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: 'Not authenticated' };

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || !['ADMIN', 'SUPER_ADMIN', 'EDITOR'].includes(profile.role!)) {
    return { success: false, error: 'Unauthorized' };
  }

  const { data: existing } = await supabase
    .from('cms_content')
    .select('id')
    .eq('key', key)
    .single();

  if (existing) {
    const { data, error } = await supabase
      .from('cms_content')
      .update({ value, type, updated_at: new Date().toISOString() })
      .eq('key', key)
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data };
  } else {
    const { data, error } = await supabase
      .from('cms_content')
      .insert([{ id: crypto.randomUUID(), key, value, type }])
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data };
  }
}

