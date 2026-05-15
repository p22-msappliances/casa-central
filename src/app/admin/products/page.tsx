"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

const mockProducts = [
  { id: '1', name: 'Premium Refrigerator', sku: 'FR-001', category: 'Refrigerators', price: 65000, stock: 15, status: 'Active' },
  { id: '2', name: 'Smart Washing Machine', sku: 'WM-001', category: 'Washing Machines', price: 40000, stock: 23, status: 'Active' },
  { id: '3', name: 'High-Fidelity Soundbar', sku: 'AU-001', category: 'Audio Systems', price: 25000, stock: 8, status: 'Active' },
  { id: '4', name: '4K QLED TV 55"', sku: 'TV-001', category: 'TVs', price: 75000, stock: 0, status: 'Out of Stock' },
  { id: '5', name: 'Inverter Air Conditioner', sku: 'AC-001', category: 'Air Conditioners', price: 35000, stock: 12, status: 'Active' },
];

export default function AdminProductsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary font-heading">Products</h1>
          <p className="text-muted-foreground mt-1">Manage your product catalog.</p>
        </div>
        <Button className="rounded-full">
          <Plus className="h-4 w-4 mr-2" /> Add Product
        </Button>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search products..." className="pl-10" />
        </div>
      </div>
      <div className="rounded-xl bg-card border border-secondary/30 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-muted-foreground border-b border-secondary/30 bg-secondary/20">
              <th className="p-4 font-medium">Product</th>
              <th className="p-4 font-medium">SKU</th>
              <th className="p-4 font-medium">Category</th>
              <th className="p-4 font-medium">Price</th>
              <th className="p-4 font-medium">Stock</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {mockProducts.map((product) => (
              <tr key={product.id} className="border-b border-secondary/10 hover:bg-secondary/10 transition-colors">
                <td className="p-4 font-medium text-primary">{product.name}</td>
                <td className="p-4 text-muted-foreground font-mono">{product.sku}</td>
                <td className="p-4 text-muted-foreground">{product.category}</td>
                <td className="p-4 font-semibold">₱{product.price.toLocaleString()}</td>
                <td className="p-4">
                  <span className={`font-semibold ${product.stock <= 5 ? 'text-red-500' : 'text-muted-foreground'}`}>
                    {product.stock}
                  </span>
                </td>
                <td className="p-4">
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                    product.status === 'Active' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                  }`}>{product.status}</span>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
