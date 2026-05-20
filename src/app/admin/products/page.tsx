"use client";

import React, { useEffect, useState } from "react";
import { Plus, Search, Edit, Trash2, Loader2 } from "lucide-react";
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
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  searchProducts,
} from "@/app/actions/products";
import { getBrands, getCategories } from "@/app/actions/catalog";
import { Database } from "@/types/database.types";

type Product = Database["public"]["Tables"]["products"]["Row"];

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const [productsRes, brandsRes, categoriesRes] = await Promise.all([
        getProducts(),
        getBrands(),
        getCategories(),
      ]);

      if (productsRes.success) setProducts(productsRes.data || []);
      else toast.error('Failed to load products: ' + productsRes.error);

      if (brandsRes.success) setBrands(brandsRes.data || []);
      if (categoriesRes.success) setCategories(categoriesRes.data || []);
    } catch (error: any) {
      toast.error("Failed to load data: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch() {
    if (!searchTerm.trim()) {
      fetchData();
      return;
    }

    const result = await searchProducts(searchTerm);
    if (result.success) {
      setProducts(result.data || []);
    } else {
      toast.error("Search failed");
    }
  }

  async function handleSaveProduct() {
    if (!formData.name || !formData.description || !formData.base_price || !formData.slug) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!formData.brand_id || !formData.category_id) {
      toast.error("Please select both a brand and category");
      return;
    }

    setIsSaving(true);
    try {
      const result = editingProduct
        ? await updateProduct(editingProduct.id, formData)
        : await createProduct({
            ...formData,
            id: crypto.randomUUID(),
          });

      if (result.success) {
        toast.success(editingProduct ? "Product updated" : "Product created");
        setIsDialogOpen(false);
        setEditingProduct(null);
        setFormData({});
        await fetchData();
      } else {
        toast.error(result.error || "Operation failed");
      }
    } catch (error) {
      toast.error("Operation failed");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteProduct(id: string) {
    if (!confirm("Are you sure you want to delete this product?")) return;

    const result = await deleteProduct(id);
    if (result.success) {
      toast.success("Product deleted");
      await fetchData();
    } else {
      toast.error(result.error || "Failed to delete product");
    }
  }

  function openAddDialog() {
    setEditingProduct(null);
    setFormData({});
    setIsDialogOpen(true);
  }

  function openEditDialog(product: Product) {
    setEditingProduct(product);
    setFormData(product);
    setIsDialogOpen(true);
  }

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <h1 className="text-3xl font-bold text-primary font-heading">Products</h1>
          <p className="text-muted-foreground mt-1">Manage your product catalog.</p>
        </div>
        <Button className="rounded-full" onClick={openAddDialog}>
          <Plus className="h-4 w-4 mr-2" /> Add Product
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
        </div>
        <Button onClick={handleSearch} variant="outline">
          Search
        </Button>
      </div>

      <div className="rounded-xl bg-card border border-secondary/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground border-b border-secondary/30 bg-secondary/20">
                <th className="p-4 font-medium">Product Name</th>
                <th className="p-4 font-medium">Brand</th>
                <th className="p-4 font-medium">Category</th>
                <th className="p-4 font-medium">Price</th>
                <th className="p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-muted-foreground">
                    No products found
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr
                    key={product.id}
                    className="border-b border-secondary/10 hover:bg-secondary/10 transition-colors"
                  >
                    <td className="p-4 font-medium text-primary">{product.name}</td>
                    <td className="p-4 text-muted-foreground">
                      {brands.find((b) => b.id === product.brand_id)?.name || "-"}
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {categories.find((c) => c.id === product.category_id)?.name || "-"}
                    </td>
                    <td className="p-4 font-semibold">
                      ${product.base_price.toLocaleString()}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full"
                          onClick={() => openEditDialog(product)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full text-destructive"
                          onClick={() => handleDeleteProduct(product.id)}
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
              {editingProduct ? "Edit Product" : "Add Product"}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Fill in the product details below.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                value={formData.name || ""}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Premium Refrigerator"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description *</Label>
              <textarea
                id="description"
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                rows={3}
                value={formData.description || ""}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Product description"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="brand">Brand *</Label>
                <select
                  id="brand"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  value={formData.brand_id || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, brand_id: e.target.value })
                  }
                >
                  <option value="">Select brand</option>
                  {brands.map((brand) => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="category">Category *</Label>
                <select
                  id="category"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  value={formData.category_id || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, category_id: e.target.value })
                  }
                >
                  <option value="">Select category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="price">Base Price *</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.base_price || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, base_price: parseFloat(e.target.value) })
                  }
                  placeholder="0.00"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  value={formData.slug || ""}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="product-slug"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input
                id="imageUrl"
                value={formData.image_url || ""}
                onChange={(e) =>
                  setFormData({ ...formData, image_url: e.target.value })
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
            <Button onClick={handleSaveProduct} disabled={isSaving}>
              {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingProduct ? "Update Product" : "Create Product"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
