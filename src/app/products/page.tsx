import { Suspense } from 'react';
import { ProductCard } from '@/components/ui/ProductCard';
import { FilterSidebar } from '@/components/ui/FilterSidebar';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { getProducts, getCategories, getBrands, getPriceRange } from '@/app/actions/catalog';
import { getUserWishlist } from '@/app/actions/wishlist';
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

  const [categoriesResult, brandsResult, priceRangeResult, wishlistResult] = await Promise.all([
    getCategories(),
    getBrands(),
    getPriceRange(),
    getUserWishlist(),
  ]);

  const categories = categoriesResult.success ? categoriesResult.data || [] : [];
  const brands = brandsResult.success ? brandsResult.data || [] : [];
  const priceRange = priceRangeResult.success && priceRangeResult.data
    ? priceRangeResult.data : { min: 0, max: 1000000 };
  
  const wishlistProductIds = wishlistResult.success ? wishlistResult.data?.map(item => item.product_id) : [];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-primary font-heading mb-8 text-center">Our Products</h1>

      <Suspense fallback={<div className="text-center py-12 text-muted-foreground">Loading...</div>}>
        <ProductGridClient
          initialCategories={categories}
          initialBrands={brands}
          initialPriceRange={priceRange}
          initialPage={page}
          limit={limit}
          offset={offset}
          defaultCategory={params.category}
          defaultBrand={params.brand}
          defaultSearch={params.search}
          wishlistProductIds={wishlistProductIds}
        />
      </Suspense>
    </div>
  );
}
