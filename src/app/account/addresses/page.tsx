"use client";

import React, { Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { MapPin, Plus, Pencil, Trash2 } from 'lucide-react';

const mockAddresses = [
  { id: '1', label: 'Home', street: '123 Rizal St.', city: 'Quezon City', province: 'Metro Manila', zip: '1100', isDefault: true },
  { id: '2', label: 'Office', street: '456 Ayala Ave.', city: 'Makati', province: 'Metro Manila', zip: '1223', isDefault: false },
];

function AddressesContent() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-primary font-heading flex items-center gap-2">
          <MapPin className="h-6 w-6" /> My Addresses
        </h2>
        <Button size="sm" className="rounded-full">
          <Plus className="h-4 w-4 mr-1" /> Add Address
        </Button>
      </div>
      {mockAddresses.length === 0 ? (
        <div className="text-center py-12 space-y-4">
          <MapPin className="h-16 w-16 text-muted-foreground/30 mx-auto" />
          <p className="text-muted-foreground">No addresses saved.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {mockAddresses.map((addr) => (
            <div key={addr.id} className="p-4 rounded-xl bg-secondary/20 border border-secondary/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-primary">{addr.label}</span>
                {addr.isDefault && (
                  <span className="text-[10px] font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full">Default</span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{addr.street}</p>
              <p className="text-sm text-muted-foreground">{addr.city}, {addr.province} {addr.zip}</p>
              <div className="flex gap-2 pt-2">
                <Button size="sm" variant="ghost" className="rounded-full h-8 text-xs">
                  <Pencil className="h-3 w-3 mr-1" /> Edit
                </Button>
                <Button size="sm" variant="ghost" className="rounded-full h-8 text-xs text-destructive">
                  <Trash2 className="h-3 w-3 mr-1" /> Remove
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AddressesPage() {
  return (
    <Suspense fallback={<div className="p-4 text-muted-foreground">Loading addresses...</div>}>
      <AddressesContent />
    </Suspense>
  );
}
