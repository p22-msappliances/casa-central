"use server";

import { createClient } from '@/lib/server';
import { revalidatePath } from 'next/cache';

export async function getProducts({ categoryId, brandId, searchTerm, priceRange }: any) {
  const supabase = await createClient();
  
  let query = supabase
    .from('products')
    .select('*, product_variants(*)', { count: 'exact' });

  if (categoryId) {
    query = query.eq('category_id', categoryId);
  }
  if (brandId) {
    query = query.eq('brand_id', brandId);
  }
  if (searchTerm) {
    query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
  }
  if (priceRange) {
    query = query.gte('base_price', priceRange[0]).lte('base_price', priceRange[1]);
  }

  const { data, error, count } = await query;

  if (error) {
    return { success: false, error: error.message };
  }

  return { 
    success: true, 
    data: {
      items: data || [],
      total: count || 0
    } 
  };
}

export async function getCategories() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name');

  if (error) return { success: false, error: error.message };
  return { success: true, data };
}

export async function getBrands() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('brands')
    .select('*')
    .order('name');

  if (error) return { success: false, error: error.message };
  return { success: true, data };
}

export async function createCategory(data: { name: string; slug: string; description?: string; image_url?: string }) {
  const supabase = await createClient();
  const { data: result, error } = await supabase
    .from('categories')
    .insert(data)
    .select()
    .single();

  if (error) return { success: false, error: error.message };
  
  revalidatePath('/admin/categories');
  revalidatePath('/admin/products');
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
  revalidatePath('/admin/products');
  revalidatePath('/products');
  return { success: true, data: result };
}

export async function deleteCategory(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id);

  if (error) return { success: false, error: error.message };
  
  revalidatePath('/admin/categories');
  revalidatePath('/admin/products');
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
  revalidatePath('/admin/products');
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
  revalidatePath('/admin/products');
  revalidatePath('/products');
  return { success: true, data: result };
}

export async function deleteBrand(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('brands')
    .delete()
    .eq('id', id);

  if (error) return { success: false, error: error.message };
  
  revalidatePath('/admin/brands');
  revalidatePath('/admin/products');
  revalidatePath('/products');
  return { success: true };
}

export async function getProductBySlug(slug: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products')
    .select('*, product_variants(*), categories(name), brands(name)')
    .eq('slug', slug)
    .single();

  if (error) return { success: false, error: error.message };
  return { success: true, data };
}
