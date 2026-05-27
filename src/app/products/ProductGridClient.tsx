/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { ProductCard } from '@/components/ui/ProductCard';
import { FilterSidebar } from '@/components/ui/FilterSidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { useQuery } from '@tanstack/react-query';
import { Search, SlidersHorizontal, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { getProducts } from '@/app/actions/catalog';
import { Database } from '@/types/database.types';

type ProductRow = Database['public']['Tables']['products']['Row'];
type ProductWithVariants = ProductRow & {
  product_variants?: Database['public']['Tables']['product_variants']['Row'][];
  total_stock?: number;
  is_in_stock?: boolean;
};

interface ProductGridClientProps {
  initialCategories: any[];
  initialBrands: any[];
  initialPriceRange: { min: number; max: number };
  initialPage: number;
  limit: number;
  offset: number;
  defaultCategory?: string;
  defaultBrand?: string;
  defaultSearch?: string;
  wishlistProductIds?: string[];
}

export default function ProductGridClient({
  initialCategories,
  initialBrands,
  initialPriceRange,
  initialPage,
  limit,
  offset,
  defaultCategory,
  defaultBrand,
  defaultSearch,
  wishlistProductIds = [],
}: ProductGridClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const idToSlug = useMemo(() => {
    const map = new Map<string, string>();
    initialCategories.forEach((c: any) => map.set(c.id, c.slug));
    initialBrands.forEach((b: any) => map.set(b.id, b.slug));
    return map;
  }, [initialCategories, initialBrands]);

  const slugToId = useMemo(() => {
    const map = new Map<string, string>();
    initialCategories.forEach((c: any) => map.set(c.slug, c.id));
    initialBrands.forEach((b: any) => map.set(b.slug, b.id));
    return map;
  }, [initialCategories, initialBrands]);

function parseSlugs(value: string | undefined): string[] {
  if (!value) return [];
  return value.split(',').filter(Boolean);
}

  const [categorySlugs, setCategorySlugs] = useState<string[]>(parseSlugs(defaultCategory));
  const [brandSlugs, setBrandSlugs] = useState<string[]>(parseSlugs(defaultBrand));
  const [searchTerm, setSearchTerm] = useState(defaultSearch || '');
  const [debouncedSearch, setDebouncedSearch] = useState(defaultSearch || '');
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [priceRange, setPriceRange] = useState<[number, number] | undefined>(undefined);
  const [filterOpen, setFilterOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const initialCategoryIds = useMemo(
    () => categorySlugs.map(s => slugToId.get(s)).filter(Boolean) as string[],
    [categorySlugs, slugToId]
  );
  const initialBrandIds = useMemo(
    () => brandSlugs.map(s => slugToId.get(s)).filter(Boolean) as string[],
    [brandSlugs, slugToId]
  );

  const { data: productData, isLoading } = useQuery({
    queryKey: ['products', categorySlugs.join(','), brandSlugs.join(','), debouncedSearch, currentPage, priceRange?.[0], priceRange?.[1]],
    queryFn: async () => {
      const result = await getProducts({
        categorySlugs: categorySlugs.length > 0 ? categorySlugs : undefined,
        brandSlugs: brandSlugs.length > 0 ? brandSlugs : undefined,
        searchTerm: debouncedSearch || undefined,
        priceRange,
        limit,
        offset: (currentPage - 1) * limit,
      });
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    placeholderData: (prev) => prev,
    staleTime: 30 * 1000,
  });

  const updateURL = useCallback((params: Record<string, string>) => {
    const newParams = new URLSearchParams(searchParams.toString());
    Object.entries(params).forEach(([key, value]) => {
      if (value) newParams.set(key, value);
      else newParams.delete(key);
    });
    if (params.page === '1') newParams.delete('page');
    router.push(`${pathname}?${newParams.toString()}`, { scroll: false });
  }, [router, pathname, searchParams]);

  const handleFilterChange = useCallback((newFilters: any) => {
    if (newFilters.categoryIds !== undefined) {
      const slugs = newFilters.categoryIds.map((id: string) => idToSlug.get(id) || id);
      setCategorySlugs(slugs);
      setCurrentPage(1);
      updateURL({ category: slugs.join(','), page: '1' });
    }
    if (newFilters.brandIds !== undefined) {
      const slugs = newFilters.brandIds.map((id: string) => idToSlug.get(id) || id);
      setBrandSlugs(slugs);
      setCurrentPage(1);
      updateURL({ brand: slugs.join(','), page: '1' });
    }
    if (newFilters.price !== undefined && Array.isArray(newFilters.price)) {
      setPriceRange(newFilters.price as [number, number]);
      setCurrentPage(1);
    }
  }, [updateURL, idToSlug]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    updateURL({ search: debouncedSearch, page: '1' });
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    updateURL({ page: newPage.toString() });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const totalPages = productData ? Math.ceil(productData.total / limit) : 1;

  return (
    <>
      <form onSubmit={handleSearch} className="mb-8 flex items-center justify-center space-x-4">
        <Input
          type="text"
          placeholder="Search for products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-1/2"
        />
        <Button type="submit" variant="outline" className="rounded-full px-6">
          <Search className="h-4 w-4 mr-2" /> Search
        </Button>
      </form>

      <div className="flex md:hidden items-center gap-2 mb-4">
        <Button
          variant="outline"
          size="sm"
          className="rounded-full"
          onClick={() => setFilterOpen(true)}
        >
          <SlidersHorizontal className="h-4 w-4 mr-2" /> Filters
        </Button>
      </div>

      <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
        <SheetContent side="left" className="w-72 sm:max-w-xs overflow-y-auto" showCloseButton={false}>
          <div className="flex items-center justify-between p-4 border-b border-brand-soft-gray/60">
            <SheetTitle className="text-base font-bold">Filters</SheetTitle>
            <Button variant="ghost" size="icon-sm" onClick={() => setFilterOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="p-4">
            <FilterSidebar
              categories={initialCategories}
              brands={initialBrands}
              minPrice={initialPriceRange.min}
              maxPrice={initialPriceRange.max}
              initialCategoryIds={initialCategoryIds}
              initialBrandIds={initialBrandIds}
              onFilterChange={(filters) => { handleFilterChange(filters); setFilterOpen(false); }}
            />
          </div>
        </SheetContent>
      </Sheet>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="hidden md:block md:col-span-1">
          <FilterSidebar
            categories={initialCategories}
            brands={initialBrands}
            minPrice={initialPriceRange.min}
            maxPrice={initialPriceRange.max}
            initialCategoryIds={initialCategoryIds}
            initialBrandIds={initialBrandIds}
            onFilterChange={handleFilterChange}
          />
        </div>

        <div className="md:col-span-3">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-2xl bg-muted/30 animate-pulse aspect-[3/4]" />
              ))}
            </div>
          ) : productData?.items && productData.items.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {productData.items.map((product: ProductWithVariants) => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    initialIsWishlisted={wishlistProductIds.includes(product.id)}
                  />
                ))}
              </div>
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <Button
                    variant="outline"
                    size="icon"
                    disabled={currentPage === 1}
                    onClick={() => handlePageChange(currentPage - 1)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground px-4">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    disabled={currentPage >= totalPages}
                    onClick={() => handlePageChange(currentPage + 1)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          ) : (
            <p className="col-span-full text-center text-muted-foreground py-12">
              No products found matching your criteria.
            </p>
          )}
        </div>
      </div>
    </>
  );
}
