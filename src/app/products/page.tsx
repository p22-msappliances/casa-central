import { Suspense } from 'react';
import { ProductCard } from '@/components/ui/ProductCard';
import { FilterSidebar } from '@/components/ui/FilterSidebar';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { getProducts, getCategories, getBrands } from '@/app/actions/catalog';
import ProductGridClient from './ProductGridClient';

interface SearchParams {
  category?: string;
  brand?: string;
  search?: string;
  page?: string;
}

export default async function ProductCatalogPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || '1');
  const limit = 24;
  const offset = (page - 1) * limit;

  const [categoriesResult, brandsResult] = await Promise.all([
    getCategories(),
    getBrands(),
  ]);

  const categories = categoriesResult.success ? categoriesResult.data || [] : [];
  const brands = brandsResult.success ? brandsResult.data || [] : [];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-primary font-heading mb-8 text-center">Our Products</h1>

      <Suspense fallback={<div className="text-center py-12 text-muted-foreground">Loading...</div>}>
        <ProductGridClient
          initialCategories={categories}
          initialBrands={brands}
          initialPage={page}
          limit={limit}
          offset={offset}
          defaultCategory={params.category}
          defaultBrand={params.brand}
          defaultSearch={params.search}
        />
      </Suspense>
    </div>
  );
}
