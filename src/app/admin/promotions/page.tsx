"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2, Percent } from 'lucide-react';

const mockPromos = [
  { id: '1', name: 'Summer Sale', code: 'SUMMER20', discount: '20%', type: 'Percent', start: '2026-06-01', end: '2026-06-30', active: true },
  { id: '2', name: 'New Customer Welcome', code: 'WELCOME10', discount: '10%', type: 'Percent', start: '2026-01-01', end: '2026-12-31', active: true },
  { id: '3', name: 'Free Shipping', code: 'FREESHIP', discount: '₱500', type: 'Flat', start: '2026-05-01', end: '2026-05-31', active: false },
  { id: '4', name: 'Audio Fest', code: 'AUDIO15', discount: '15%', type: 'Percent', start: '2026-07-01', end: '2026-07-15', active: true },
];

export default function AdminPromotionsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary font-heading">Promotions</h1>
          <p className="text-muted-foreground mt-1">Manage discount codes and promotions.</p>
        </div>
        <Button className="rounded-full">
          <Plus className="h-4 w-4 mr-2" /> New Promotion
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockPromos.map((promo) => (
          <div key={promo.id} className="p-4 rounded-xl bg-card border border-secondary/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-primary">{promo.name}</span>
              <div className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                promo.active ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
              }`}>{promo.active ? 'Active' : 'Inactive'}</div>
            </div>
            <div className="flex items-center gap-2">
              <Percent className="h-4 w-4 text-primary" />
              <span className="text-2xl font-bold text-primary">{promo.discount}</span>
            </div>
            <div className="text-xs text-muted-foreground space-y-1">
              <p><span className="font-medium">Code:</span> <span className="font-mono text-primary">{promo.code}</span></p>
              <p>{promo.start} → {promo.end}</p>
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="ghost" size="sm" className="rounded-full h-8 text-xs">
                <Pencil className="h-3 w-3 mr-1" /> Edit
              </Button>
              <Button variant="ghost" size="sm" className="rounded-full h-8 text-xs text-destructive">
                <Trash2 className="h-3 w-3 mr-1" /> Delete
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
