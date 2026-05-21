/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface FilterSidebarProps {
  categories: Array<{ id: string; name: string }>;
  brands: Array<{ id: string; name: string }>;
  onFilterChange: (filters: any) => void;
}

export const FilterSidebar = ({
  categories,
  brands,
  onFilterChange,
}: FilterSidebarProps) => {
  const handlePriceChange = (value: number | readonly number[]) => {
    if (Array.isArray(value) && value.length === 2) {
      onFilterChange({ price: [value[0], value[1]] });
    }
  };

  const handleCategoryChange = (value: string | null) => {
    onFilterChange({ categoryId: value === 'all' ? '' : value || '' });
  };

  const handleBrandChange = (value: string | null) => {
    onFilterChange({ brandId: value === 'all' ? '' : value || '' });
  };

  return (
    <div className="space-y-6">
      <div className="p-5 rounded-2xl bg-white border border-border/50 shadow-sm">
        <h3 className="text-lg font-bold text-primary font-heading mb-6">Filters</h3>
        <div className="space-y-6">
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">Categories</h4>
            <Select onValueChange={handleCategoryChange} defaultValue="all">
              <SelectTrigger className="w-full border-border/60 bg-white">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">Brands</h4>
            <Select onValueChange={handleBrandChange} defaultValue="all">
              <SelectTrigger className="w-full border-border/60 bg-white">
                <SelectValue placeholder="Select a brand" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Brands</SelectItem>
                {brands.map((brand) => (
                  <SelectItem key={brand.id} value={brand.id}>
                    {brand.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">Price Range</h4>
            <Slider
              defaultValue={[0, 1000000]}
              max={1000000}
              step={500}
              min={0}
              onValueChange={handlePriceChange}
              className="[&_span[role='slider']]:bg-accent [&_span[role='slider']]:h-3 [&_span[role='slider']]:w-3"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>$0</span>
              <span>$1,000,000</span>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">Energy Rating</h4>
            <div className="space-y-2">
              {['A+++', 'A++', 'A+', 'A'].map((rating) => (
                <div key={rating} className="flex items-center gap-2">
                  <Checkbox
                    id={`energy-${rating}`}
                    onCheckedChange={() => onFilterChange({ energyRating: rating })}
                    className="data-[state=checked]:bg-accent data-[state=checked]:border-accent"
                  />
                  <Label htmlFor={`energy-${rating}`} className="text-sm text-muted-foreground cursor-pointer">
                    {rating}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
