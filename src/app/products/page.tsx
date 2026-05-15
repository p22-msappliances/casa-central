"use client";

import React, { useState } from 'react';

import { ProductCard } from '@/components/ui/ProductCard';
import { FilterSidebar } from '@/components/ui/FilterSidebar';
import { Button } from '@/components/ui/button';
import type { ProductService } from '@/services/product.service';
import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';

export const dynamic = 'force-dynamic';

// Mock services for now, will be replaced with actual data fetching logic
const mockProductService = {
  listProducts: async (filters: any) => {
    console.log('Fetching products with filters:', filters);
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    // Mock product data - replace with actual API response
    return {
      items: [
        {
          id: 'prod-1',
          name: 'Premium Refrigerator',
          slug: 'premium-refrigerator',
          description: 'Energy-efficient and spacious refrigerator with smart features.',
          basePrice: 65000.00,
          imageUrl: '/images/products/fridge-1.jpg',
          category: { name: 'Refrigerators' },
          brand: { name: 'CasaTech' },
          category_id: 'cat-ref',
          brand_id: 'brand-ct',
        },
        {
          id: 'prod-2',
          name: 'Smart Washing Machine',
          slug: 'smart-washing-machine',
          description: 'Advanced washing technology for superior fabric care.',
          basePrice: 40000.00,
          imageUrl: '/images/products/washer-1.jpg',
          category: { name: 'Washing Machines' },
          brand: { name: 'CasaTech' },
          category_id: 'cat-wash',
          brand_id: 'brand-ct',
        },
        {
          id: 'prod-3',
          name: 'High-Fidelity Soundbar',
          slug: 'high-fidelity-soundbar',
          description: 'Immersive audio experience for your home entertainment.',
          basePrice: 25000.00,
          imageUrl: '/images/products/soundbar-1.jpg',
          category: { name: 'Audio Systems' },
          brand: { name: 'AudioWave' },
          category_id: 'cat-audio',
          brand_id: 'brand-aw',
        },
        {
          id: 'prod-4',
          name: '4K QLED TV',
          slug: '4k-qled-tv',
          description: 'Stunning visuals and vibrant colors for an unparalleled viewing experience.',
          basePrice: 75000.00,
          imageUrl: '/images/products/tv-1.jpg',
          category: { name: 'TVs' },
          brand: { name: 'VisionPlus' },
          category_id: 'cat-tv',
          brand_id: 'brand-vp',
        }
      ].filter(p => {
        // Basic filtering logic simulation
        if (filters.category && p.category_id !== filters.category) return false;
        if (filters.brand && p.brand_id !== filters.brand) return false;
        if (filters.price && (p.basePrice < filters.price[0] || p.basePrice > filters.price[1])) return false;
        // Add more filter checks here
        return true;
      }),
      total: 4, // Mock total count
    };
  },
};

const mockCategoryService = {
  getAllCategories: async (): Promise<any[]> => [
    { id: 'cat-ref', name: 'Refrigerators', slug: 'refrigerators', description: '', parentCategoryId: null, imageUrl: '', createdAt: new Date(), updatedAt: new Date() },
    { id: 'cat-wash', name: 'Washing Machines', slug: 'washing-machines', description: '', parentCategoryId: null, imageUrl: '', createdAt: new Date(), updatedAt: new Date() },
    { id: 'cat-audio', name: 'Audio Systems', slug: 'audio-systems', description: '', parentCategoryId: null, imageUrl: '', createdAt: new Date(), updatedAt: new Date() },
    { id: 'cat-tv', name: 'TVs', slug: 'tvs', description: '', parentCategoryId: null, imageUrl: '', createdAt: new Date(), updatedAt: new Date() },
  ],
};

const mockBrandService = {
  getAllBrands: async (): Promise<any[]> => [
    { id: 'brand-ct', name: 'CasaTech', slug: 'casatech', description: '', imageUrl: '', createdAt: new Date(), updatedAt: new Date() },
    { id: 'brand-aw', name: 'AudioWave', slug: 'audiowave', description: '', imageUrl: '', createdAt: new Date(), updatedAt: new Date() },
    { id: 'brand-vp', name: 'VisionPlus', slug: 'visionplus', description: '', imageUrl: '', createdAt: new Date(), updatedAt: new Date() },
  ],
};


export default function ProductCatalogPage() {
  const [filters, setFilters] = useState({});
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch categories and brands for filters
  const { data: categories, isLoading: isLoadingCategories } = useQuery<any[]>({
    queryKey: ['categories'],
    queryFn: mockCategoryService.getAllCategories,
  });

  const { data: brands, isLoading: isLoadingBrands } = useQuery<any[]>({
    queryKey: ['brands'],
    queryFn: mockBrandService.getAllBrands,
  });

  // Fetch products based on filters and search term
  const { data: productData, isLoading: isLoadingProducts } = useQuery({
    queryKey: ['products', filters, searchTerm],
    queryFn: () => mockProductService.listProducts({ ...filters, searchTerm }),
  });

  const handleFilterChange = (newFilters: any) => {
    // Merge new filters with existing ones
    setFilters(prevFilters => ({ ...prevFilters, ...newFilters }));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // setSearchTerm will trigger a refetch via useQuery's `keepPreviousData`
    setFilters(prevFilters => ({ ...prevFilters, searchTerm }));
  };

  // Basic loading state handling
  if (isLoadingCategories || isLoadingBrands || isLoadingProducts) {
    return <div className="flex justify-center items-center h-screen">Loading Products...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-primary font-heading mb-8 text-center">Our Products</h1>

      {/* Search Bar */}
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
        {/* Filter Sidebar */}
        <div className="md:col-span-1">
          {categories && brands && (
            <FilterSidebar
              categories={categories}
              brands={brands}
              onFilterChange={handleFilterChange}
            />
          )}
        </div>

        {/* Product Grid */}
        <div className="md:col-span-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {productData?.items && productData.items.length > 0 ? (
              productData.items.map((product) => (
                <ProductCard key={product.id} product={product as any} />
              ))
            ) : (
              <p className="col-span-full text-center text-muted-foreground">No products found matching your criteria.</p>
            )}
          </div>
          {/* Pagination or Infinite Scroll would go here */}
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
