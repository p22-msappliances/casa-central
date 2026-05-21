/* eslint-disable @typescript-eslint/no-explicit-any */
import { getCategories } from '@/app/actions/catalog';
import { CategoriesClient } from './CategoriesClient';

export default async function AdminCategoriesPage() {
  const result = await getCategories();
  const categories = result.success ? (result.data || []) : [];

  return <CategoriesClient initialCategories={categories} />;
}
