"use client";

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2, Percent, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { getPromotions, upsertPromotion, deletePromotion } from '@/app/actions/promotions';
import { toast } from 'sonner';

export default function AdminPromotionsPage() {
  const [promotions, setPromotions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [form, setForm] = useState({
    id: '',
    name: '',
    code: '',
    discount_type: 'PERCENT',
    discount_value: '',
    start_date: '',
    end_date: '',
    active: true,
  });

  useEffect(() => {
    fetchPromotions();
  }, []);

  async function fetchPromotions() {
    setLoading(true);
    const result = await getPromotions();
    if (result.success) {
      setPromotions(result.data || []);
    } else {
      toast.error('Failed to load promotions');
    }
    setLoading(false);
  }

  async function handleSave() {
    setIsSaving(true);
    const result = await upsertPromotion({
      ...form,
      discount_value: parseFloat(form.discount_value),
    });

    if (result.success) {
      toast.success(editingPromo ? 'Promotion updated' : 'Promotion created');
      setIsDialogOpen(false);
      setEditingPromo(null);
      setForm({ id: '', name: '', code: '', discount_type: 'PERCENT', discount_value: '', start_date: '', end_date: '', active: true });
      await fetchPromotions();
    } else {
      toast.error(result.error || 'An error occurred');
    }
    setIsSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this promotion?')) return;
    const result = await deletePromotion(id);
    if (result.success) {
      toast.success('Promotion deleted');
      await fetchPromotions();
    } else {
      toast.error(result.error || 'Failed to delete');
    }
  }

  function openAdd() {
    setEditingPromo(null);
    setForm({ id: '', name: '', code: '', discount_type: 'PERCENT', discount_value: '', start_date: '', end_date: '', active: true });
    setIsDialogOpen(true);
  }

  function openEdit(promo: any) {
    setEditingPromo(promo);
    setForm({
      id: promo.id,
      name: promo.name,
      code: promo.code,
      discount_type: promo.discount_type,
      discount_value: promo.discount_value.toString(),
      start_date: promo.start_date,
      end_date: promo.end_date,
      active: promo.active,
    });
    setIsDialogOpen(true);
  }

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
        <div>
          <h1 className="text-3xl font-bold text-primary font-heading">Promotions</h1>
          <p className="text-muted-foreground mt-1">Manage discount codes and promotions.</p>
        </div>
        <Button className="rounded-full" onClick={openAdd}>
          <Plus className="h-4 w-4 mr-2" /> New Promotion
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {promotions.map((promo) => (
          <div key={promo.id} className="p-4 rounded-xl bg-card border border-secondary/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-primary">{promo.name}</span>
              <div className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                promo.active ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
              }`}>{promo.active ? 'Active' : 'Inactive'}</div>
            </div>
            <div className="flex items-center gap-2">
              <Percent className="h-4 w-4 text-primary" />
              <span className="text-2xl font-bold text-primary">
                {promo.discount_type === 'PERCENT' ? `${promo.discount_value}%` : `$${promo.discount_value}`}
              </span>
            </div>
            <div className="text-xs text-muted-foreground space-y-1">
              <p><span className="font-medium">Code:</span> <span className="font-mono text-primary">{promo.code}</span></p>
              <p>{promo.start_date} → {promo.end_date}</p>
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="ghost" size="sm" className="rounded-full h-8 text-xs" onClick={() => openEdit(promo)}>
                <Pencil className="h-3 w-3 mr-1" /> Edit
              </Button>
              <Button variant="ghost" size="sm" className="rounded-full h-8 text-xs text-destructive" onClick={() => handleDelete(promo.id)}>
                <Trash2 className="h-3 w-3 mr-1" /> Delete
              </Button>
            </div>
          </div>
        ))}
        {promotions.length === 0 && (
          <div className="col-span-full py-20 text-center text-muted-foreground">
            No promotions found.
          </div>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-card border-secondary/30 text-primary">
          <DialogHeader>
            <DialogTitle className="font-heading">{editingPromo ? 'Edit Promotion' : 'New Promotion'}</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Set up a discount code for your customers.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Promotion Name</Label>
              <Input 
                id="name" 
                value={form.name} 
                onChange={(e) => setForm({...form, name: e.target.value})}
                placeholder="e.g. Summer Sale"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="code">Discount Code</Label>
              <Input 
                id="code" 
                value={form.code} 
                onChange={(e) => setForm({...form, code: e.target.value})}
                placeholder="e.g. SUMMER20"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="type">Type</Label>
                <select 
                  id="type"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={form.discount_type}
                  onChange={(e) => setForm({...form, discount_type: e.target.value})}
                >
                  <option value="PERCENT">Percentage</option>
                  <option value="FLAT">Flat Amount</option>
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="value">Value</Label>
                <Input 
                  id="value" 
                  type="number" 
                  value={form.discount_value} 
                  onChange={(e) => setForm({...form, discount_value: e.target.value})}
                  placeholder="0"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="start">Start Date</Label>
                <Input 
                  id="start" 
                  type="date" 
                  value={form.start_date} 
                  onChange={(e) => setForm({...form, start_date: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="end">End Date</Label>
                <Input 
                  id="end" 
                  type="date" 
                  value={form.end_date} 
                  onChange={(e) => setForm({...form, end_date: e.target.value})}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                id="active" 
                checked={form.active} 
                onChange={(e) => setForm({...form, active: e.target.checked})}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <Label htmlFor="active">Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save Promotion
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
