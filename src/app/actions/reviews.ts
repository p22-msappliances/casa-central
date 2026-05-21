/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { createClient } from '@/lib/server';
import { Database } from '@/types/database.types';
import { revalidatePath } from 'next/cache';

type Review = Database['public']['Tables']['reviews']['Row'];

export async function getProductReviews(productId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('reviews')
    .select('*, profiles(first_name, last_name)')
    .eq('product_id', productId)
    .order('created_at', { ascending: false });

  if (error) return { success: false, error: error.message };
  return { success: true, data };
}

export async function createReview(productId: string, reviewData: { rating: number; comment?: string }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('reviews')
    .insert([{
      id: crypto.randomUUID(),
      product_id: productId,
      user_id: user.id,
      rating: reviewData.rating,
      comment: reviewData.comment,
    }])
    .select()
    .single();

  if (error) return { success: false, error: error.message };
  revalidatePath(`/products/${productId}`);
  return { success: true, data };
}

export async function updateReview(reviewId: string, reviewData: { rating?: number; comment?: string }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: 'Not authenticated' };

  const { data: review } = await supabase
    .from('reviews')
    .select('user_id')
    .eq('id', reviewId)
    .single();

  if (!review || review.user_id !== user.id) {
    return { success: false, error: 'Unauthorized' };
  }

  const { data, error } = await supabase
    .from('reviews')
    .update({ ...reviewData, updated_at: new Date().toISOString() })
    .eq('id', reviewId)
    .select()
    .single();

  if (error) return { success: false, error: error.message };
  revalidatePath(`/products`);
  return { success: true, data };
}

export async function deleteReview(reviewId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: 'Not authenticated' };

  const { data: review } = await supabase
    .from('reviews')
    .select('user_id')
    .eq('id', reviewId)
    .single();

  if (!review || review.user_id !== user.id) {
    return { success: false, error: 'Unauthorized' };
  }

  const { error } = await supabase
    .from('reviews')
    .delete()
    .eq('id', reviewId);

  if (error) return { success: false, error: error.message };
  revalidatePath(`/products`);
  return { success: true };
}
