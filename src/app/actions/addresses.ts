/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { createClient } from '@/lib/server';
import { Database } from '@/types/database.types';
import { revalidatePath } from 'next/cache';

export async function getUserAddresses() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('profiles')
    .select('address')
    .eq('id', user.id)
    .single();

  if (error) return { success: false, error: error.message };

  // The current schema only has one address per profile. 
  // We return it as a list to maintain UI compatibility.
  return { 
    success: true, 
    data: data.address ? [{
      id: user.id,
      label: 'Home',
      street: data.address,
      city: '',
      province: '',
      zip: '',
      isDefault: true
    }] : [] 
  };
}

export async function updateAddress(address: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: 'Not authenticated' };

  const { error } = await supabase
    .from('profiles')
    .update({ address })
    .eq('id', user.id);

  if (error) return { success: false, error: error.message };

  revalidatePath('/account/addresses');
  return { success: true };
}
