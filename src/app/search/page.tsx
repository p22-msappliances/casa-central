/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, X, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { searchProducts } from '@/app/actions/products';

export const dynamic = 'force-dynamic';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }
    const timer = setTimeout(async () => {
      setLoading(true);
      const result = await searchProducts(query, 20);
      setResults(result.success && result.data ? result.data : []);
      setSearched(true);
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

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

      {loading && (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {!loading && searched && (
        <div className="max-w-3xl mx-auto space-y-4">
          <p className="text-sm text-muted-foreground">{results.length} result(s) for &ldquo;{query}&rdquo;</p>
          {results.length === 0 ? (
            <div className="text-center py-16 space-y-4">
              <Search className="h-16 w-16 text-muted-foreground/30 mx-auto" />
              <p className="text-lg text-muted-foreground">No products found. Try a different search term.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {results.map((product: any) => (
                <Link key={product.id} href={`/products/${product.slug}`}>
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-card border border-secondary/30 hover:border-primary/30 hover:shadow-lg transition-all">
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted shrink-0">
                      {product.image_url ? (
                        <Image src={product.image_url} alt={product.name} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] text-muted-foreground">N/A</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-primary truncate">{product.name}</p>
                    </div>
                    <p className="font-bold text-accent-foreground text-sm">${Number(product.base_price).toLocaleString()}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {!query && !searched && (
        <div className="text-center py-16 text-muted-foreground">
          <Search className="h-16 w-16 mx-auto mb-4 opacity-30" />
          <p>Type to search our catalog</p>
        </div>
      )}
    </div>
  );
}
