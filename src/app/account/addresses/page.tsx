"use client";

import React, { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { MapPin, Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import { getUserAddresses, updateAddress } from '@/app/actions/addresses';

export const dynamic = 'force-dynamic';

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  useEffect(() => {
    async function fetchAddresses() {
      try {
        const result = await getUserAddresses();
        if (result.success) setAddresses(result.data);
      } catch (err) {
        console.error('Error fetching addresses:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchAddresses();
  }, []);

  const handleUpdate = async (id: string) => {
    setSaving(true);
    try {
      const result = await updateAddress(editValue);
      if (result.success) {
        const refresh = await getUserAddresses();
        if (refresh.success) setAddresses(refresh.data);
        setEditingId(null);
      }
    } catch (err) {
      console.error('Error updating address:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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
          <p className="text-muted-foreground">No addresses saved.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div key={addr.id} className="p-4 rounded-xl bg-secondary/20 border border-secondary/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-primary">{addr.label}</span>
                {addr.isDefault && (
                  <span className="text-[10px] font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full">Default</span>
                )}
              </div>
              {editingId === addr.id ? (
                <div className="flex gap-2">
                  <input 
                    className="flex-1 px-2 py-1 text-sm border rounded bg-background" 
                    value={editValue} 
                    onChange={(e) => setEditValue(e.target.value)}
                    autoFocus
                  />
                  <Button size="sm" onClick={() => handleUpdate(addr.id)} disabled={saving} className="h-8">
                    {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Save'}
                  </Button>
                </div>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">{addr.street}</p>
                  <p className="text-sm text-muted-foreground">{addr.city}, {addr.province} {addr.zip}</p>
                  <div className="flex gap-2 pt-2">
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="rounded-full h-8 text-xs"
                      onClick={() => {
                        setEditingId(addr.id);
                        setEditValue(addr.street);
                      }}
                    >
                      <Pencil className="h-3 w-3 mr-1" /> Edit
                    </Button>
                    <Button size="sm" variant="ghost" className="rounded-full h-8 text-xs text-destructive">
                      <Trash2 className="h-3 w-3 mr-1" /> Remove
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
