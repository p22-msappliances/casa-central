/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
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
import { upsertCMSContent, deleteCMSContent } from '@/app/actions/cms';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function CMSClient({ initialContent }: { initialContent: any[] }) {
  const [content, setContent] = useState(initialContent);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [form, setForm] = useState({
    id: '',
    key: '',
    type: 'BANNER',
    value: '',
  });

  async function refetch() {
    const { getAllCMSContent } = await import('@/app/actions/admin');
    const result = await getAllCMSContent();
    if (result.success) setContent(result.data || []);
  }

  async function handleSave() {
    setIsSaving(true);
    try {
      const result = await upsertCMSContent({
        ...form,
        value: typeof form.value === 'string' ? JSON.parse(form.value) : form.value,
      });

      if (result.success) {
        toast.success(editingItem ? 'Content updated' : 'Content created');
        setIsDialogOpen(false);
        setEditingItem(null);
        setForm({ id: '', key: '', type: 'BANNER', value: '' });
        await refetch();
      } else {
        toast.error(result.error || 'An error occurred');
      }
    } catch {
      toast.error('Invalid JSON format');
    }
    setIsSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this content?')) return;
    const result = await deleteCMSContent(id);
    if (result.success) {
      toast.success('Content deleted');
      await refetch();
    } else {
      toast.error(result.error || 'Failed to delete');
    }
  }

  function openAdd() {
    setEditingItem(null);
    setForm({ id: '', key: '', type: 'BANNER', value: '' });
    setIsDialogOpen(true);
  }

  function openEdit(item: any) {
    setEditingItem(item);
    setForm({
      id: item.id,
      key: item.key,
      type: item.type,
      value: JSON.stringify(item.value, null, 2),
    });
    setIsDialogOpen(true);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary font-heading">CMS Content</h1>
          <p className="text-muted-foreground mt-1">Manage banners, popups, and site content.</p>
        </div>
        <Button className="rounded-full" onClick={openAdd}>
          <Plus className="h-4 w-4 mr-2" /> Add Content
        </Button>
      </div>

      <div className="rounded-xl bg-card border border-secondary/30 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-muted-foreground border-b border-secondary/30 bg-secondary/20">
              <th className="p-4 font-medium">Key</th>
              <th className="p-4 font-medium">Type</th>
              <th className="p-4 font-medium">Value</th>
              <th className="p-4 font-medium">Updated</th>
              <th className="p-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {content.map((item) => (
              <tr key={item.id} className="border-b border-secondary/10 hover:bg-secondary/10 transition-colors">
                <td className="p-4 font-mono text-xs text-primary">{item.key}</td>
                <td className="p-4">
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-primary/10 text-primary">{item.type}</span>
                </td>
                <td className="p-4 text-muted-foreground max-w-xs truncate">{JSON.stringify(item.value).slice(0, 50)}...</td>
                <td className="p-4 text-muted-foreground text-xs">{new Date(item.updated_at).toLocaleDateString('en-US')}</td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => openEdit(item)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-destructive" onClick={() => handleDelete(item.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {content.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-muted-foreground">No CMS content found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] bg-card border-secondary/30 text-primary">
          <DialogHeader>
            <DialogTitle className="font-heading">
              {editingItem ? 'Edit Content' : 'Add Content'}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Configure the CMS content.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="key">Content Key *</Label>
              <Input id="key" value={form.key} onChange={(e) => setForm({ ...form, key: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_') })} placeholder="e.g. homepage_banner" />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="type">Type</Label>
              <Select value={form.type} onValueChange={(v) => v && setForm({ ...form, type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="BANNER">Banner</SelectItem>
                  <SelectItem value="POPUP">Popup</SelectItem>
                  <SelectItem value="TEXT">Text</SelectItem>
                  <SelectItem value="HTML">HTML</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="value">Value (JSON) *</Label>
              <textarea
                id="value"
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 font-mono"
                rows={8}
                value={form.value}
                onChange={(e) => setForm({ ...form, value: e.target.value })}
                placeholder='{"title": "Welcome", "subtitle": "Shop now"}'
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSaving}>Cancel</Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingItem ? 'Update Content' : 'Create Content'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
