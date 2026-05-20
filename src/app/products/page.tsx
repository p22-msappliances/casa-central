"use client";

import React, { useState, useEffect, useCallback } from 'react';

import { ProductCard } from '@/components/ui/ProductCard';
import { FilterSidebar } from '@/components/ui/FilterSidebar';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { getProducts, getCategories, getBrands } from '@/app/actions/catalog';
import { Database } from '@/types/database.types';

type ProductRow = Database['public']['Tables']['products']['Row'];
type ProductWithVariants = ProductRow & {
  product_variants?: Database['public']['Tables']['product_variants']['Row'][];
};

export default function ProductCatalogPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [brandId, setBrandId] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000000]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data: categoriesData, isLoading: isLoadingCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const result = await getCategories();
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
  });

  const { data: brandsData, isLoading: isLoadingBrands } = useQuery({
    queryKey: ['brands'],
    queryFn: async () => {
      const result = await getBrands();
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
  });

  const { data: productData, isLoading: isLoadingProducts } = useQuery({
    queryKey: ['products', categoryId, brandId, priceRange, debouncedSearch],
    queryFn: async () => {
      const result = await getProducts({ 
        categoryId: categoryId || undefined, 
        brandId: brandId || undefined, 
        searchTerm: debouncedSearch || undefined,
        priceRange 
      });
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
  });

  const handleFilterChange = useCallback((newFilters: any) => {
    if (newFilters.categoryId !== undefined) setCategoryId(newFilters.categoryId);
    if (newFilters.brandId !== undefined) setBrandId(newFilters.brandId);
    if (newFilters.price !== undefined) setPriceRange(newFilters.price as [number, number]);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const isLoading = isLoadingCategories || isLoadingBrands || isLoadingProducts;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-primary font-heading mb-8 text-center">Our Products</h1>

      <form onSubmit={handleSearch} className="mb-8 flex items-center justify-center space-x-4">
        <input
          type="text"
          placeholder="Search for products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-1/2 px-4 py-2 border border-secondary rounded-md focus:ring-primary focus:border-primary"
        />
        <Button type="submit" variant="outline" className="flex items-center rounded-full px-6">
          <Search className="h-4 w-4 mr-2" /> Search
        </Button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-1">
          {categoriesData && brandsData && (
            <FilterSidebar
              categories={categoriesData}
              brands={brandsData}
              onFilterChange={handleFilterChange}
            />
          )}
        </div>

        <div className="md:col-span-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {isLoading ? (
              <p className="col-span-full text-center text-muted-foreground">Loading products...</p>
            ) : productData?.items && productData.items.length > 0 ? (
              productData.items.map((product: ProductWithVariants) => (
                <ProductCard 
                  key={product.id} 
                  product={{
                    ...product,
                    product_variants: product.product_variants || []
                  }} 
                />
              ))
            ) : (
              <p className="col-span-full text-center text-muted-foreground">No products found matching your criteria.</p>
            )}
          </div>
          {productData && productData.total > (productData.items?.length || 0) && (
            <div className="flex justify-center mt-8">
              <Button variant="outline" className="rounded-full px-6 py-3">
                Load More Products
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
