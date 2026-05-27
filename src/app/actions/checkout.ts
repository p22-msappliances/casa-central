"use server";

import { createClient } from '@/lib/server';
import { checkoutSchema, leadInquirySchema } from '@/lib/schemas';
import { formatPhone } from '@/lib/utils';
import { revalidatePath } from 'next/cache';

export async function atomicCheckout(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: 'Not authenticated' };

  const rawItems: { variant_id: string; quantity: number; price_at_purchase: number }[] = [];
  let i = 0;
  while (formData.has(`items[${i}][variant_id]`)) {
    rawItems.push({
      variant_id: formData.get(`items[${i}][variant_id]`) as string,
      quantity: Number(formData.get(`items[${i}][quantity]`)),
      price_at_purchase: Number(formData.get(`items[${i}][price_at_purchase]`)),
    });
    i++;
  }

  const parsed = checkoutSchema.safeParse({
    items: rawItems,
    shipping_address: formData.get('shipping_address'),
    total_amount: Number(formData.get('total_amount')),
    delivery_type: formData.get('delivery_type'),
    payment_type: formData.get('payment_type'),
    scheduled_date: formData.get('scheduled_date') || undefined,
    scheduled_time: formData.get('scheduled_time') || undefined,
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues.map(e => e.message).join(', ') };
  }

  const { items, shipping_address, total_amount, delivery_type, payment_type, scheduled_date, scheduled_time } = parsed.data;
  const orderId = crypto.randomUUID();

  const { data, error } = await supabase.rpc('atomic_checkout', {
    p_items: items.map(item => ({
      variant_id: item.variant_id,
      quantity: item.quantity,
      price_at_purchase: item.price_at_purchase,
    })),
    p_user_id: user.id,
    p_shipping_address: shipping_address,
    p_total_amount: total_amount,
    p_order_id: orderId,
    p_delivery_type: delivery_type,
    p_payment_type: payment_type,
    p_scheduled_date: scheduled_date || null,
    p_scheduled_time: scheduled_time || null,
  });

  if (error) return { success: false, error: error.message };

  const result = data as { success: boolean; error?: string; order_id?: string };
  if (!result.success) {
    return { success: false, error: result.error || 'Checkout failed' };
  }

  revalidatePath('/account/orders');
  return { success: true, order_id: result.order_id };
}

export async function atomicCheckoutJson(input: {
  items: { variant_id: string; quantity: number; price_at_purchase: number }[];
  shipping_address: string;
  total_amount: number;
  delivery_type: 'delivery' | 'pickup';
  payment_type: 'pay_on_pickup' | 'pay_later';
  scheduled_date?: string;
  scheduled_time?: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: 'Not authenticated' };

  const parsed = checkoutSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues.map(e => e.message).join(', ') };
  }

  const { items, shipping_address, total_amount, delivery_type, payment_type, scheduled_date, scheduled_time } = parsed.data;
  const orderId = crypto.randomUUID();

  const { data, error } = await supabase.rpc('atomic_checkout', {
    p_items: items.map(item => ({
      variant_id: item.variant_id,
      quantity: item.quantity,
      price_at_purchase: item.price_at_purchase,
    })),
    p_user_id: user.id,
    p_shipping_address: shipping_address,
    p_total_amount: total_amount,
    p_order_id: orderId,
    p_delivery_type: delivery_type,
    p_payment_type: payment_type,
    p_scheduled_date: scheduled_date || null,
    p_scheduled_time: scheduled_time || null,
  });

  if (error) return { success: false, error: error.message };

  const result = data as { success: boolean; error?: string; order_id?: string };
  if (!result.success) {
    return { success: false, error: result.error || 'Checkout failed' };
  }

  revalidatePath('/account/orders');
  return { success: true, order_id: result.order_id };
}

export async function submitLeadInquiry(input: {
  name: string;
  email: string;
  phone?: string;
  message?: string;
  product_id?: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const parsed = leadInquirySchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues.map(e => e.message).join(', ') };
  }

  const { name, email, phone, message, product_id } = parsed.data;

  const { error } = await supabase.from('lead_inquiries').insert([{
    name,
    email,
    phone: phone ? formatPhone(phone) : null,
    message: message || null,
    product_id: product_id || null,
    user_id: user?.id || null,
  }]);

  if (error) return { success: false, error: error.message };
  return { success: true };
}
