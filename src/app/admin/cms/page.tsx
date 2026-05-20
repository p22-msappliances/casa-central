"use client";

import React, { useEffect, useState } from 'react';
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
import { getCMSContent, upsertCMSContent, deleteCMSContent } from '@/app/actions/cms';
import { toast } from 'sonner';

export default function AdminCMSPage() {
  const [content, setContent] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [form, setForm] = useState({
    id: '',
    key: '',
    type: 'BANNER',
    value: '',
  });

  useEffect(() => {
    fetchContent();
  }, []);

  async function fetchContent() {
    setLoading(true);
    const result = await getCMSContent();
    if (result.success) {
      setContent(result.data || []);
    } else {
      toast.error('Failed to load CMS content');
    }
    setLoading(false);
  }

  async function handleSave() {
    setIsSaving(true);
    const result = await upsertCMSContent({
      ...form,
      value: typeof form.value === 'string' ? JSON.parse(form.value) : form.value,
    });

    if (result.success) {
      toast.success(editingItem ? 'Content updated' : 'Content created');
      setIsDialogOpen(false);
      setEditingItem(null);
      setForm({ id: '', key: '', type: 'BANNER', value: '' });
      await fetchContent();
    } else {
      toast.error(result.error || 'An error occurred');
    }
    setIsSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this content?')) return;
    const result = await deleteCMSContent(id);
    if (result.success) {
      toast.success('Content deleted');
      await fetchContent();
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
          <h1 className="text-3xl font-bold text-primary font-heading">Content Management</h1>
          <p className="text-muted-foreground mt-1">Manage banners, pages, and blog posts.</p>
        </div>
        <Button className="rounded-full" onClick={openAdd}>
          <Plus className="h-4 w-4 mr-2" /> New Content
        </Button>
      </div>
      <div className="rounded-xl bg-card border border-secondary/30 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-muted-foreground border-b border-secondary/30 bg-secondary/20">
              <th className="p-4 font-medium">Key / Title</th>
              <th className="p-4 font-medium">Type</th>
              <th className="p-4 font-medium">Last Updated</th>
              <th className="p-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {content.map((item) => (
              <tr key={item.id} className="border-b border-secondary/10 hover:bg-secondary/10 transition-colors">
                <td className="p-4 font-medium text-primary">{item.key}</td>
                <td className="p-4">
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-secondary text-muted-foreground">{item.type}</span>
                </td>
                <td className="p-4 text-muted-foreground">
                  {item.updated_at ? new Date(item.updated_at).toLocaleDateString() : '-'}
                </td>
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
                <td colSpan={4} className="p-8 text-center text-muted-foreground">No content found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px] bg-card border-secondary/30 text-primary">
          <DialogHeader>
            <DialogTitle className="font-heading">{editingItem ? 'Edit Content' : 'New Content'}</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Manage a CMS entry. Use JSON for the value.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="key">Key (Unique Identifier)</Label>
              <Input 
                id="key" 
                value={form.key} 
                onChange={(e) => setForm({...form, key: e.target.value})}
                placeholder="e.g. homepage_hero_title"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="type">Content Type</Label>
              <select 
                id="type"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={form.type}
                onChange={(e) => setForm({...form, type: e.target.value})}
              >
                <option value="BANNER">Banner</option>
                <option value="PAGE">Page</option>
                <option value="SECTION">Section</option>
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="value">Value (JSON)</Label>
              <textarea 
                id="value" 
                className="flex min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 font-mono"
                value={form.value} 
                onChange={(e) => setForm({...form, value: e.target.value})}
                placeholder='{ "title": "Welcome to Casa Central", "subtitle": "Best Appliances" }'
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save Content
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
