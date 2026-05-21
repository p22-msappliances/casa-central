/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
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
import { upsertPromotion, deletePromotion } from '@/app/actions/promotions';
import { toast } from 'sonner';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function PromotionsClient({ initialPromotions }: { initialPromotions: any[] }) {
  const [promotions, setPromotions] = useState(initialPromotions);
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

  async function refetch() {
    const { getPromotions } = await import('@/app/actions/promotions');
    const result = await getPromotions();
    if (result.success) setPromotions(result.data || []);
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
      await refetch();
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
      await refetch();
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary font-heading">Promotions</h1>
          <p className="text-muted-foreground mt-1">Manage discount codes and promotions.</p>
        </div>
        <Button className="rounded-full" onClick={openAdd}>
          <Plus className="h-4 w-4 mr-2" /> Add Promotion
        </Button>
      </div>

      <div className="rounded-xl bg-card border border-secondary/30 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-muted-foreground border-b border-secondary/30 bg-secondary/20">
              <th className="p-4 font-medium">Name</th>
              <th className="p-4 font-medium">Code</th>
              <th className="p-4 font-medium">Discount</th>
              <th className="p-4 font-medium">Valid Until</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {promotions.map((promo) => (
              <tr key={promo.id} className="border-b border-secondary/10 hover:bg-secondary/10 transition-colors">
                <td className="p-4 font-medium text-primary">{promo.name}</td>
                <td className="p-4 font-mono text-xs bg-secondary/20 px-2 py-1 rounded w-fit">{promo.code}</td>
                <td className="p-4">{promo.discount_value}{promo.discount_type === 'PERCENT' ? '%' : '₱'}</td>
                <td className="p-4 text-muted-foreground">{promo.end_date}</td>
                <td className="p-4">
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${promo.active ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                    {promo.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => openEdit(promo)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-destructive" onClick={() => handleDelete(promo.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {promotions.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-muted-foreground">No promotions found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px] bg-card border-secondary/30 text-primary">
          <DialogHeader>
            <DialogTitle className="font-heading">
              {editingPromo ? 'Edit Promotion' : 'Add Promotion'}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Configure the promotion details.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Promotion Name *</Label>
              <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Summer Sale" />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="code">Promo Code *</Label>
              <Input id="code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="e.g. SUMMER20" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="discount_type">Type</Label>
                <Select value={form.discount_type} onValueChange={(v) => v && setForm({ ...form, discount_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PERCENT">Percentage</SelectItem>
                    <SelectItem value="FIXED">Fixed Amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="discount_value">Value *</Label>
                <Input id="discount_value" type="number" value={form.discount_value} onChange={(e) => setForm({ ...form, discount_value: e.target.value })} placeholder="0" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="start_date">Start Date</Label>
                <Input id="start_date" type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="end_date">End Date</Label>
                <Input id="end_date" type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox id="active" checked={form.active} onCheckedChange={(checked: any) => setForm({ ...form, active: checked })} />
              <Label htmlFor="active">Active</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSaving}>Cancel</Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingPromo ? 'Update Promotion' : 'Create Promotion'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
