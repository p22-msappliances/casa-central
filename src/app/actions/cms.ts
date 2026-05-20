"use server";

import { createClient } from '@/lib/server';
import { revalidatePath } from 'next/cache';

export async function getCMSContent() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('cms_content')
    .select('*')
    .order('updated_at', { ascending: false });

  if (error) return { success: false, error: error.message };
  return { success: true, data };
}

export async function upsertCMSContent(formData: any) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('cms_content')
    .upsert(formData)
    .select()
    .single();

  if (error) return { success: false, error: error.message };
  
  revalidatePath('/admin/cms');
  return { success: true, data };
}

export async function deleteCMSContent(id: string) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('cms_content')
    .delete()
    .eq('id', id);

  if (error) return { success: false, error: error.message };
  
  revalidatePath('/admin/cms');
  return { success: true };
}
