/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';

interface FilterSidebarProps {
  categories: Array<{ id: string; name: string }>;
  brands: Array<{ id: string; name: string }>;
  onFilterChange: (filters: any) => void;
  minPrice: number;
  maxPrice: number;
  initialCategoryIds?: string[];
  initialBrandIds?: string[];
}

export const FilterSidebar = ({
  categories,
  brands,
  onFilterChange,
  minPrice,
  maxPrice,
  initialCategoryIds,
  initialBrandIds,
}: FilterSidebarProps) => {
  const [priceRange, setPriceRange] = useState<[number, number]>([minPrice, maxPrice]);
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set(initialCategoryIds));
  const [selectedBrands, setSelectedBrands] = useState<Set<string>>(new Set(initialBrandIds));
  const [categorySearch, setCategorySearch] = useState('');
  const [brandSearch, setBrandSearch] = useState('');

  const onFilterRef = useRef(onFilterChange);
  onFilterRef.current = onFilterChange;
  const latestPriceRef = useRef<[number, number]>([minPrice, maxPrice]);

  useEffect(() => {
    setPriceRange([minPrice, maxPrice]);
    latestPriceRef.current = [minPrice, maxPrice];
  }, [minPrice, maxPrice]);

  const filteredCategories = useMemo(
    () => categories.filter(cat => cat.name.toLowerCase().includes(categorySearch.toLowerCase())),
    [categories, categorySearch]
  );

  const filteredBrands = useMemo(
    () => brands.filter(brand => brand.name.toLowerCase().includes(brandSearch.toLowerCase())),
    [brands, brandSearch]
  );

  const allCategoriesSelected = categories.length > 0 && categories.every(cat => selectedCategories.has(cat.id));
  const allBrandsSelected = brands.length > 0 && brands.every(brand => selectedBrands.has(brand.id));

  const handleSliderChange = (value: number | readonly number[]) => {
    if (Array.isArray(value) && value.length === 2) {
      setPriceRange([value[0], value[1]]);
      latestPriceRef.current = [value[0], value[1]];
    }
  };

  const handleSliderCommit = (value: number | readonly number[]) => {
    if (Array.isArray(value) && value.length === 2) {
      onFilterRef.current({ price: [value[0], value[1]] });
    }
  };

  const handleMinInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    if (!isNaN(val)) {
      const newRange: [number, number] = [val, priceRange[1]];
      setPriceRange(newRange);
      latestPriceRef.current = newRange;
    }
  };

  const handleMaxInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    if (!isNaN(val)) {
      const newRange: [number, number] = [priceRange[0], val];
      setPriceRange(newRange);
      latestPriceRef.current = newRange;
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') onFilterRef.current({ price: latestPriceRef.current });
  };

  const handleInputBlur = () => {
    onFilterRef.current({ price: latestPriceRef.current });
  };

  const toggleCategory = (id: string) => {
    const next = new Set(selectedCategories);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedCategories(next);
    onFilterRef.current({ categoryIds: Array.from(next) });
  };

  const toggleBrand = (id: string) => {
    const next = new Set(selectedBrands);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedBrands(next);
    onFilterRef.current({ brandIds: Array.from(next) });
  };

  const toggleAllCategories = () => {
    if (allCategoriesSelected) {
      setSelectedCategories(new Set());
      onFilterRef.current({ categoryIds: [] });
    } else {
      const all = new Set(categories.map(cat => cat.id));
      setSelectedCategories(all);
      onFilterRef.current({ categoryIds: Array.from(all) });
    }
  };

  const toggleAllBrands = () => {
    if (allBrandsSelected) {
      setSelectedBrands(new Set());
      onFilterRef.current({ brandIds: [] });
    } else {
      const all = new Set(brands.map(brand => brand.id));
      setSelectedBrands(all);
      onFilterRef.current({ brandIds: Array.from(all) });
    }
  };

  const formatPrice = (val: number) => `₱${val.toLocaleString()}`;

  return (
    <div className="space-y-6">
      <div className="p-5 rounded-2xl bg-white border border-border/50 shadow-sm">
        <h3 className="text-lg font-bold text-primary font-heading mb-6">Filters</h3>
        <div className="space-y-6">
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">Categories</h4>
            <Input
              type="text"
              placeholder="Search categories..."
              value={categorySearch}
              onChange={(e) => setCategorySearch(e.target.value)}
              className="h-8 text-sm mb-2"
            />
            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-border/40">
              <Checkbox
                id="select-all-cat"
                checked={allCategoriesSelected}
                onCheckedChange={toggleAllCategories}
                className="data-[state=checked]:bg-accent data-[state=checked]:border-accent"
              />
              <Label htmlFor="select-all-cat" className="text-xs font-medium text-muted-foreground cursor-pointer">
                Select All {selectedCategories.size > 0 && `(${selectedCategories.size})`}
              </Label>
            </div>
            <div className="space-y-2 max-h-36 overflow-y-auto">
              {filteredCategories.length === 0 ? (
                <p className="text-xs text-muted-foreground py-1">No matches</p>
              ) : (
                filteredCategories.map((cat) => (
                  <div key={cat.id} className="flex items-center gap-2">
                    <Checkbox
                      id={`cat-${cat.id}`}
                      checked={selectedCategories.has(cat.id)}
                      onCheckedChange={() => toggleCategory(cat.id)}
                      className="data-[state=checked]:bg-accent data-[state=checked]:border-accent"
                    />
                    <Label htmlFor={`cat-${cat.id}`} className="text-sm text-muted-foreground cursor-pointer">
                      {cat.name}
                    </Label>
                  </div>
                ))
              )}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">Brands</h4>
            <Input
              type="text"
              placeholder="Search brands..."
              value={brandSearch}
              onChange={(e) => setBrandSearch(e.target.value)}
              className="h-8 text-sm mb-2"
            />
            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-border/40">
              <Checkbox
                id="select-all-brand"
                checked={allBrandsSelected}
                onCheckedChange={toggleAllBrands}
                className="data-[state=checked]:bg-accent data-[state=checked]:border-accent"
              />
              <Label htmlFor="select-all-brand" className="text-xs font-medium text-muted-foreground cursor-pointer">
                Select All {selectedBrands.size > 0 && `(${selectedBrands.size})`}
              </Label>
            </div>
            <div className="space-y-2 max-h-36 overflow-y-auto">
              {filteredBrands.length === 0 ? (
                <p className="text-xs text-muted-foreground py-1">No matches</p>
              ) : (
                filteredBrands.map((brand) => (
                  <div key={brand.id} className="flex items-center gap-2">
                    <Checkbox
                      id={`brand-${brand.id}`}
                      checked={selectedBrands.has(brand.id)}
                      onCheckedChange={() => toggleBrand(brand.id)}
                      className="data-[state=checked]:bg-accent data-[state=checked]:border-accent"
                    />
                    <Label htmlFor={`brand-${brand.id}`} className="text-sm text-muted-foreground cursor-pointer">
                      {brand.name}
                    </Label>
                  </div>
                ))
              )}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">Price Range</h4>
            <div className="flex items-center justify-between text-sm font-medium mb-2">
              <span className="text-accent">{formatPrice(priceRange[0])}</span>
              <span className="text-muted-foreground">—</span>
              <span className="text-accent">{formatPrice(priceRange[1])}</span>
            </div>
            <Slider
              value={priceRange}
              min={minPrice}
              max={maxPrice}
              step={500}
              onValueChange={handleSliderChange}
              onValueCommitted={handleSliderCommit}
              className="[&_span[role='slider']]:bg-accent [&_span[role='slider']]:h-3 [&_span[role='slider']]:w-3"
            />
            <div className="flex items-center gap-3 mt-3">
              <div className="flex-1">
                <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Min</label>
                <Input
                  type="number"
                  value={priceRange[0]}
                  onChange={handleMinInputChange}
                  onBlur={handleInputBlur}
                  onKeyDown={handleInputKeyDown}
                  className="h-8 text-sm"
                />
              </div>
              <div className="flex-1">
                <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Max</label>
                <Input
                  type="number"
                  value={priceRange[1]}
                  onChange={handleMaxInputChange}
                  onBlur={handleInputBlur}
                  onKeyDown={handleInputKeyDown}
                  className="h-8 text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
