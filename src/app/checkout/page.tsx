import { createClient } from '@/lib/server';
import CheckoutClient from './CheckoutClient';

export default async function CheckoutPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const initialAuthState = user ? 'authenticated' : 'none' as const;

  return <CheckoutClient initialAuthState={initialAuthState} />;
}
