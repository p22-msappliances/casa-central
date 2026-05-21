/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export const dynamic = 'force-dynamic';

const mockResults = [
  { id: '1', name: 'Premium Refrigerator', slug: 'premium-refrigerator', price: 65000, category: 'Refrigerators', imageUrl: '' },
  { id: '2', name: 'Smart Washing Machine', slug: 'smart-washing-machine', price: 40000, category: 'Washing Machines', imageUrl: '' },
  { id: '3', name: 'High-Fidelity Soundbar', slug: 'high-fidelity-soundbar', price: 25000, category: 'Audio Systems', imageUrl: '' },
  { id: '4', name: '4K QLED TV 55"', slug: '4k-qled-tv', price: 75000, category: 'TVs', imageUrl: '' },
  { id: '5', name: 'Inverter Air Conditioner', slug: 'inverter-air-conditioner', price: 35000, category: 'Air Conditioners', imageUrl: '' },
];

export default function SearchPage() {
  const [query, setQuery] = useState('');

  const filteredResults = query
    ? mockResults.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()))
    : [];

  return (
    <div className="container mx-auto px-4 py-16 space-y-8">
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-primary font-heading">Search Products</h1>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for appliances, audio, and more..."
            className="pl-12 pr-12 py-6 text-lg rounded-full border-secondary"
            autoFocus
          />
          {query && (
            <button onClick={() => setQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2">
              <X className="h-5 w-5 text-muted-foreground hover:text-primary" />
            </button>
          )}
        </div>
      </div>

      {query && (
        <div className="max-w-3xl mx-auto space-y-4">
          <p className="text-sm text-muted-foreground">{filteredResults.length} result(s) for &ldquo;{query}&rdquo;</p>
          {filteredResults.length === 0 ? (
            <div className="text-center py-16 space-y-4">
              <Search className="h-16 w-16 text-muted-foreground/30 mx-auto" />
              <p className="text-lg text-muted-foreground">No products found. Try a different search term.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredResults.map((product) => (
                <Link key={product.id} href={`/products/${product.slug}`}>
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-card border border-secondary/30 hover:border-primary/30 hover:shadow-lg transition-all">
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted shrink-0">
                      {product.imageUrl ? (
                        <Image src={product.imageUrl} alt={product.name} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] text-muted-foreground">N/A</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-primary truncate">{product.name}</p>
                      <p className="text-xs text-muted-foreground">{product.category}</p>
                    </div>
                    <p className="font-bold text-accent-foreground text-sm">${product.price.toLocaleString()}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
