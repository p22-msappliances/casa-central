/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { createClient } from '@/lib/server';
import { Database } from '@/types/database.types';
import { revalidatePath } from 'next/cache';

type WishlistItem = Database['public']['Tables']['wishlist']['Row'];

export async function getUserWishlist() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('wishlist')
    .select(`
      id,
      product_id,
      products (
        name,
        base_price,
        image_url
      )
    `)
    .eq('user_id', user.id);

  if (error) return { success: false, error: error.message };

  const wishlist = data?.map(item => {
    const product = Array.isArray(item.products) ? item.products[0] : item.products;
    return {
      id: item.id,
      product_id: item.product_id,
      products: product,
    };
  }) || [];


  return { success: true, data: wishlist };
}

export async function toggleWishlist(productId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: 'Not authenticated' };

  const { data: existing } = await supabase
    .from('wishlist')
    .select('id')
    .eq('user_id', user.id)
    .eq('product_id', productId)
    .single();

  if (existing) {
    const { error } = await supabase
      .from('wishlist')
      .delete()
      .eq('id', existing.id);
    if (error) return { success: false, error: error.message };
  } else {
    const { error } = await supabase
      .from('wishlist')
      .insert({ user_id: user.id, product_id: productId });
    if (error) return { success: false, error: error.message };
  }

  revalidatePath('/account/wishlist');
  return { success: true };
}
