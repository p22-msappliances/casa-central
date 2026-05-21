/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { createAnonClient, createClient } from '@/lib/server';
import { revalidatePath, unstable_cache } from 'next/cache';
import { Database } from '@/types/database.types';

type ProductRow = Database['public']['Tables']['products']['Row'];
type ProductVariantRow = Database['public']['Tables']['product_variants']['Row'];

interface GetProductsParams {
  categoryId?: string;
  brandId?: string;
  searchTerm?: string;
  priceRange?: [number, number];
  limit?: number;
  offset?: number;
}

interface ProductWithStock extends ProductRow {
  product_variants?: (ProductVariantRow & { inventory?: { quantity: number }[] })[];
  total_stock: number;
  is_in_stock: boolean;
}

export async function getProducts({ 
  categoryId, 
  brandId, 
  searchTerm, 
  priceRange,
  limit = 24,
  offset = 0 
}: GetProductsParams = {}) {
  const supabase = await createAnonClient();
  
  let query = supabase
    .from('products')
    .select('*, product_variants(*, inventory(quantity))', { count: 'planned' });

  if (categoryId) query = query.eq('category_id', categoryId);
  if (brandId) query = query.eq('brand_id', brandId);
  if (searchTerm) query = query.ilike('name', `%${searchTerm}%`);
  if (priceRange) {
    query = query.gte('base_price', priceRange[0]).lte('base_price', priceRange[1]);
  }

  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) return { success: false, error: error.message };

  const items: ProductWithStock[] = (data || []).map((product: any) => {
    const totalStock = product.product_variants?.reduce((sum: number, v: any) => {
      return sum + (v.inventory?.reduce((s: number, inv: any) => s + (inv.quantity || 0), 0) || 0);
    }, 0) || 0;
    return { ...product, total_stock: totalStock, is_in_stock: totalStock > 0 };
  }).filter((p) => p.is_in_stock);

  return { 
    success: true, 
    data: { items, total: count || 0, hasMore: (count || 0) > offset + limit }
  };
}

// Cached categories - rarely change
export const getCategories = unstable_cache(
  async () => {
    const supabase = await createAnonClient();
    const { data, error } = await supabase
      .from('categories')
      .select('id, name, slug')
      .order('name');
    if (error) return { success: false, error: error.message };
    return { success: true, data };
  },
  ['categories'],
  { revalidate: 3600, tags: ['categories'] }
);

// Cached brands - rarely change
export const getBrands = unstable_cache(
  async () => {
    const supabase = await createAnonClient();
    const { data, error } = await supabase
      .from('brands')
      .select('id, name, slug')
      .order('name');
    if (error) return { success: false, error: error.message };
    return { success: true, data };
  },
  ['brands'],
  { revalidate: 3600, tags: ['brands'] }
);

export async function getProductBySlug(slug: string) {
  const supabase = await createAnonClient();
  const { data, error } = await supabase
    .from('products')
    .select('*, product_variants(*, inventory(quantity)), categories(name), brands(name)')
    .eq('slug', slug)
    .single();

  if (error) return { success: false, error: error.message };

  const product = data as any;
  const totalStock = product.product_variants?.reduce((sum: number, v: any) => {
    return sum + (v.inventory?.reduce((s: number, inv: any) => s + (inv.quantity || 0), 0) || 0);
  }, 0) || 0;

  return { success: true, data: { ...product, total_stock: totalStock, is_in_stock: totalStock > 0 } };
}

// CRUD operations (require auth)
export async function createCategory(data: { name: string; slug: string; description?: string; image_url?: string }) {
  const supabase = await createClient();
  const { data: result, error } = await supabase
    .from('categories')
    .insert(data)
    .select()
    .single();
  if (error) return { success: false, error: error.message };
  revalidatePath('/admin/categories');
  revalidatePath('/products');
  return { success: true, data: result };
}

export async function updateCategory(id: string, data: { name?: string; slug?: string; description?: string; image_url?: string }) {
  const supabase = await createClient();
  const { data: result, error } = await supabase
    .from('categories')
    .update(data)
    .eq('id', id)
    .select()
    .single();
  if (error) return { success: false, error: error.message };
  revalidatePath('/admin/categories');
  revalidatePath('/products');
  return { success: true, data: result };
}

export async function deleteCategory(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) return { success: false, error: error.message };
  revalidatePath('/admin/categories');
  revalidatePath('/products');
  return { success: true };
}

export async function createBrand(data: { name: string; slug: string; description?: string; image_url?: string }) {
  const supabase = await createClient();
  const { data: result, error } = await supabase
    .from('brands')
    .insert(data)
    .select()
    .single();
  if (error) return { success: false, error: error.message };
  revalidatePath('/admin/brands');
  revalidatePath('/products');
  return { success: true, data: result };
}

export async function updateBrand(id: string, data: { name?: string; slug?: string; description?: string; image_url?: string }) {
  const supabase = await createClient();
  const { data: result, error } = await supabase
    .from('brands')
    .update(data)
    .eq('id', id)
    .select()
    .single();
  if (error) return { success: false, error: error.message };
  revalidatePath('/admin/brands');
  revalidatePath('/products');
  return { success: true, data: result };
}

export async function deleteBrand(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('brands').delete().eq('id', id);
  if (error) return { success: false, error: error.message };
  revalidatePath('/admin/brands');
  revalidatePath('/products');
  return { success: true };
}
