"use server";

import { createClient } from '@/lib/server';
import { Database } from '@/types/database.types';
import { revalidatePath } from 'next/cache';

// Submit Contact Form
export async function submitContact(formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const subject = formData.get('subject') as string;
  const message = formData.get('message') as string;

  if (!name || !email || !subject || !message) {
    return { success: false, error: 'All fields are required' };
  }

  const supabase = await createClient();
  const { error } = await supabase.from('analytics_events').insert({
    event_type: 'contact_submission',
    metadata: { name, email, subject, message },
  });

  if (error) {
    console.error("Contact submission error:", error.message);
    return { success: false, error: "Failed to send message" };
  }

  return { success: true };
}

// Newsletter Subscription
export async function subscribeNewsletter(formData: FormData) {
  const email = formData.get('email') as string;
  if (!email) return { success: false, error: "Email is required" };

  const supabase = await createClient();
  const { error } = await supabase.from('analytics_events').insert({
    event_type: 'newsletter_subscription',
    metadata: { email },
  });

  if (error) {
    console.error("Newsletter error:", error.message);
    return { success: false, error: "Failed to subscribe" };
  }

  return { success: true };
}

// Admin Settings
export async function getAdminSettings() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('cms_content')
    .select('value')
    .eq('key', 'store_settings')
    .single();

  if (error) {
    console.error('Error getting admin settings:', error);
    return { success: false, error: error.message };
  }

  // Ensure default values are returned if no settings are found
  if (!data?.value) {
    return { 
      success: true, 
      data: {
        store_name: 'CASA CENTRAL',
        email: 'hello@casacentral.com',
        address: '123 Rizal Ave., Quezon City, Metro Manila',
        free_shipping_threshold: 5000,
        standard_shipping_fee: 150,
        tax_rate: 12
      }
    };
  }

  return { success: true, data: data.value };
}

export async function saveAdminSettings(formData: FormData) {
  const supabase = await createClient();
  
  // Extracting all fields from formData and converting to appropriate types
  const settings = {
    store_name: formData.get('store_name') as string,
    email: formData.get('email') as string,
    address: formData.get('address') as string,
    free_shipping_threshold: parseFloat(formData.get('free_shipping_threshold') as string),
    standard_shipping_fee: parseFloat(formData.get('standard_shipping_fee') as string),
    tax_rate: parseFloat(formData.get('tax_rate') as string),
  };

  // Basic validation for required fields
  if (!settings.store_name || !settings.email || !settings.address || isNaN(settings.free_shipping_threshold) || isNaN(settings.standard_shipping_fee) || isNaN(settings.tax_rate)) {
    return { success: false, error: 'Please fill in all required fields with valid data.' };
  }

  const { error } = await supabase
    .from('cms_content')
    .upsert({ key: 'store_settings', value: settings, type: 'SECTION' }, { onConflict: 'key' });

  if (error) {
    console.error("Save settings error:", error.message);
    return { success: false, error: "Failed to save settings" };
  }

  revalidatePath('/admin/settings');
  return { success: true };
}
