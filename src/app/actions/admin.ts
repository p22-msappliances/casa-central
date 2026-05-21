/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { createClient } from '@/lib/server';
import { Database } from '@/types/database.types';

export async function getAdminStats() {
  const supabase = await createClient();

  const [revenue, orders, products, customers] = await Promise.all([
    supabase.from('orders').select('total_amount'),
    supabase.from('orders').select('id'),
    supabase.from('products').select('id'),
    supabase.from('profiles').select('id').eq('role', 'CUSTOMER'),
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

