/* eslint-disable @typescript-eslint/no-explicit-any */
import { getBrands } from '@/app/actions/catalog';
import { BrandsClient } from './BrandsClient';

export default async function AdminBrandsPage() {
  const result = await getBrands();
  const brands = result.success ? (result.data || []) : [];

  return <BrandsClient initialBrands={brands} />;
}
