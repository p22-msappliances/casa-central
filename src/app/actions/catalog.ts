/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { createAnonClient, createClient } from '@/lib/server';
import { revalidatePath, unstable_cache } from 'next/cache';
import { Database } from '@/types/database.types';

type ProductRow = Database['public']['Tables']['products']['Row'];
type ProductVariantRow = Database['public']['Tables']['product_variants']['Row'];

interface GetProductsParams {
  categorySlugs?: string[];
  brandSlugs?: string[];
  searchTerm?: string;
  priceRange?: [number, number];
  limit?: number;
  offset?: number;
  cursor?: string;
}

interface ProductWithStock extends ProductRow {
  product_variants?: (ProductVariantRow & { inventory?: { quantity: number }[] })[];
  total_stock: number;
  is_in_stock: boolean;
}

const getCachedSlugMap = unstable_cache(
  async () => {
    const supabase = await createAnonClient();
    const [catResult, brandResult] = await Promise.all([
      supabase.from('categories').select('slug, id'),
      supabase.from('brands').select('slug, id'),
    ]);
    return {
      categorySlugToId: Object.fromEntries((catResult.data || []).map(c => [c.slug, c.id])),
      brandSlugToId: Object.fromEntries((brandResult.data || []).map(b => [b.slug, b.id])),
    };
  },
  ['slug-map'],
  { revalidate: 3600, tags: ['categories', 'brands'] }
);

export async function getProducts({ 
  categorySlugs, 
  brandSlugs, 
  searchTerm, 
  priceRange,
  limit = 24,
  offset,
  cursor
}: GetProductsParams = {}) {
  const supabase = await createAnonClient();
  
  let query = supabase
    .from('products')
    .select('id, name, slug, base_price, image_url, category_id, brand_id, created_at, product_variants(id, price, inventory(quantity))', { count: 'planned' });

  const map = await getCachedSlugMap();

  if (categorySlugs && categorySlugs.length > 0) {
    const ids = categorySlugs.map(s => map.categorySlugToId[s]).filter(Boolean);
    if (ids.length > 0) query = query.in('category_id', ids);
  }
  if (brandSlugs && brandSlugs.length > 0) {
    const ids = brandSlugs.map(s => map.brandSlugToId[s]).filter(Boolean);
    if (ids.length > 0) query = query.in('brand_id', ids);
  }
  if (searchTerm) {
    const supabase2 = await createAnonClient();
    const [brandMatches, categoryMatches] = await Promise.all([
      supabase2.from('brands').select('id').ilike('name', `%${searchTerm}%`),
      supabase2.from('categories').select('id').ilike('name', `%${searchTerm}%`),
    ]);
    const brandEq = (brandMatches.data || []).map(b => `brand_id.eq.${b.id}`);
    const categoryEq = (categoryMatches.data || []).map(c => `category_id.eq.${c.id}`);
    const orParts = [`name.ilike.%${searchTerm}%`, ...brandEq, ...categoryEq];
    query = query.or(orParts.join(','));
  }
  if (priceRange) {
    query = query.gte('base_price', priceRange[0]).lte('base_price', priceRange[1]);
  }

  if (cursor) {
    query = query.lt('created_at', cursor);
  }

  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .range(offset !== undefined ? offset : 0, offset !== undefined ? offset + limit - 1 : limit - 1);

  if (error) return { success: false, error: error.message };

  const items: ProductWithStock[] = (data || []).map((product: any) => {
    const totalStock = product.product_variants?.reduce((sum: number, v: any) => {
      return sum + (v.inventory?.reduce((s: number, inv: any) => s + (inv.quantity || 0), 0) || 0);
    }, 0) || 0;
    return { ...product, total_stock: totalStock, is_in_stock: totalStock > 0 };
  }).filter((p) => p.is_in_stock);

  const nextCursor = items.length > 0 ? items[items.length - 1].created_at : null;

  return { 
    success: true, 
    data: { items, nextCursor, total: count || 0, hasMore: (count || 0) > (offset !== undefined ? offset + limit : limit) }
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

// Cached price range - rarely changes
export const getPriceRange = unstable_cache(
  async () => {
    const supabase = await createAnonClient();
    const { data, error } = await supabase
      .from('products')
      .select('base_price');
    if (error) return { success: false, error: error.message };
    const prices = data.map(p => Number(p.base_price));
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    return { success: true, data: { min, max } };
  },
  ['price-range'],
  { revalidate: 3600, tags: ['price-range'] }
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
