/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { Plus, Edit, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  createBrand,
  updateBrand,
  deleteBrand,
} from "@/app/actions/catalog";

export function BrandsClient({ initialBrands }: { initialBrands: any[] }) {
  const [brands, setBrands] = useState(initialBrands);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<any>({});

  async function refetch() {
    const { getBrands } = await import('@/app/actions/catalog');
    const result = await getBrands();
    if (result.success) setBrands(result.data || []);
  }

  async function handleSaveBrand() {
    if (!formData.name || !formData.slug) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSaving(true);
    try {
      const result = editingBrand
        ? await updateBrand(editingBrand.id, formData)
        : await createBrand(formData);

      if (result.success) {
        toast.success(editingBrand ? "Brand updated" : "Brand created");
        setIsDialogOpen(false);
        setEditingBrand(null);
        setFormData({});
        await refetch();
      } else {
        toast.error(result.error || "Operation failed");
      }
    } catch {
      toast.error("Operation failed");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteBrand(id: string) {
    if (!confirm("Are you sure you want to delete this brand? This may affect products linked to it.")) return;

    const result = await deleteBrand(id);
    if (result.success) {
      toast.success("Brand deleted");
      await refetch();
    } else {
      toast.error(result.error || "Failed to delete brand");
    }
  }

  function openAddDialog() {
    setEditingBrand(null);
    setFormData({});
    setIsDialogOpen(true);
  }

  function openEditDialog(brand: any) {
    setEditingBrand(brand);
    setFormData(brand);
    setIsDialogOpen(true);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary font-heading">Brands</h1>
          <p className="text-muted-foreground mt-1">Manage your product brands.</p>
        </div>
        <Button className="rounded-full" onClick={openAddDialog}>
          <Plus className="h-4 w-4 mr-2" /> Add Brand
        </Button>
      </div>

      <div className="rounded-xl bg-card border border-secondary/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground border-b border-secondary/30 bg-secondary/20">
                <th className="p-4 font-medium">Name</th>
                <th className="p-4 font-medium">Slug</th>
                <th className="p-4 font-medium">Description</th>
                <th className="p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {brands.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-4 text-center text-muted-foreground">
                    No brands found
                  </td>
                </tr>
              ) : (
                brands.map((brand: any) => (
                  <tr
                    key={brand.id}
                    className="border-b border-secondary/10 hover:bg-secondary/10 transition-colors"
                  >
                    <td className="p-4 font-medium text-primary">{brand.name}</td>
                    <td className="p-4 text-muted-foreground font-mono text-xs">{brand.slug}</td>
                    <td className="p-4 text-muted-foreground max-w-md truncate">
                      {brand.description || "-"}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full"
                          onClick={() => openEditDialog(brand)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full text-destructive"
                          onClick={() => handleDeleteBrand(brand.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px] bg-card border-secondary/30 text-primary">
          <DialogHeader>
            <DialogTitle className="font-heading">
              {editingBrand ? "Edit Brand" : "Add Brand"}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Fill in the brand details below.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Brand Name *</Label>
              <Input
                id="name"
                value={formData.name || ""}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Samsung"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="slug">Slug *</Label>
              <Input
                id="slug"
                value={formData.slug || ""}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') })}
                placeholder="brand-slug"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                rows={3}
                value={formData.description || ""}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Brand description"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="logoUrl">Logo URL</Label>
              <Input
                id="logoUrl"
                value={formData.logo_url || ""}
                onChange={(e) =>
                  setFormData({ ...formData, logo_url: e.target.value })
                }
                placeholder="https://..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveBrand} disabled={isSaving}>
              {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingBrand ? "Update Brand" : "Create Brand"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
