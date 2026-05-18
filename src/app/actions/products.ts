"use server";

import { createClient } from '@/lib/server';
import { revalidatePath } from 'next/cache';

export async function getProducts() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data };
}

export async function createProduct(formData: any) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('products')
    .insert([formData])
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/products');
  return { success: true, data };
}

export async function updateProduct(id: string, formData: any) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('products')
    .update(formData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/products');
  return { success: true, data };
}

export async function deleteProduct(id: string) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/products');
  return { success: true };
}
