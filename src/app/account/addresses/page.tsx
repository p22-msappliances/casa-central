/* eslint-disable @typescript-eslint/no-explicit-any */
import { getUserAddresses } from '@/app/actions/addresses';
import { AddressesClient } from './AddressesClient';

export const dynamic = 'force-dynamic';

export default async function AddressesPage() {
  const result = await getUserAddresses();
  const addresses = result.success ? (result.data || []) : [];

  return <AddressesClient initialAddresses={addresses} />;
}
