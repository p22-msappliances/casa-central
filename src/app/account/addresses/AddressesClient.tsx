/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MapPin, Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import { updateAddress } from '@/app/actions/addresses';
import { Input } from '@/components/ui/input';

export function AddressesClient({ initialAddresses }: { initialAddresses: any[] }) {
  const [addresses, setAddresses] = useState(initialAddresses);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  async function refetch() {
    const { getUserAddresses } = await import('@/app/actions/addresses');
    const result = await getUserAddresses();
    if (result.success && result.data) setAddresses(result.data || []);
  }

  const handleUpdate = async (id: string) => {
    setSaving(true);
    try {
      const result = await updateAddress(editValue);
      if (result.success) {
        await refetch();
        setEditingId(null);
      }
    } catch {
      console.error('Error updating address');
    } finally {
      setSaving(false);
    }
  };

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

      {addresses.length === 0 ? (
        <div className="text-center py-12 space-y-4">
          <MapPin className="h-16 w-16 text-muted-foreground/30 mx-auto" />
          <p className="text-muted-foreground">No addresses saved yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {addresses.map((addr: any) => (
            <div key={addr.id} className="p-4 rounded-xl bg-secondary/20 border border-secondary/30 flex items-start justify-between group">
              {editingId === addr.id ? (
                <div className="flex-1 flex gap-2">
                  <Input
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="flex-1"
                  />
                  <Button size="sm" onClick={() => handleUpdate(addr.id)} disabled={saving}>
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setEditingId(null)}>Cancel</Button>
                </div>
              ) : (
                <>
                  <div className="space-y-1">
                    <p className="text-sm text-primary">{addr.address_line}</p>
                    <p className="text-xs text-muted-foreground">{addr.city}, {addr.state} {addr.postal_code}</p>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full"
                      onClick={() => { setEditingId(addr.id); setEditValue(addr.address_line); }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
