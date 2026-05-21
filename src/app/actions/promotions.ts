/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { createClient } from '@/lib/server';
import { revalidatePath } from 'next/cache';

export async function getPromotions() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('promotions')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return { success: false, error: error.message };
  return { success: true, data };
}

export async function upsertPromotion(formData: any) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('promotions')
    .upsert(formData)
    .select()
    .single();

  if (error) return { success: false, error: error.message };
  
  revalidatePath('/admin/promotions');
  return { success: true, data };
}

export async function deletePromotion(id: string) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('promotions')
    .delete()
    .eq('id', id);

  if (error) return { success: false, error: error.message };
  
  revalidatePath('/admin/promotions');
  return { success: true };
}
