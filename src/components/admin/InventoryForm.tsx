"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CreateInventoryItem, InventoryItem } from "@/types/inventory";

const inventorySchema = z.object({
  sku: z.string().min(1, "SKU is required"),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  quantity: z.coerce.number().min(0, "Quantity must be positive"),
  cost_price: z.coerce.number().min(0, "Cost price must be positive"),
  retail_price: z.coerce.number().min(0, "Retail price must be positive"),
});

type InventoryFormValues = z.infer<typeof inventorySchema>;

interface InventoryFormProps {
  initialData?: InventoryItem;
  onSubmit: (data: InventoryFormValues) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function InventoryForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading,
}: InventoryFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<InventoryFormValues>({
    resolver: zodResolver(inventorySchema),
    defaultValues: initialData
      ? {
          sku: initialData.sku,
          name: initialData.name,
          description: initialData.description || "",
          quantity: initialData.quantity,
          cost_price: initialData.cost_price,
          retail_price: initialData.retail_price,
        }
      : {
          sku: "",
          name: "",
          description: "",
          quantity: 0,
          cost_price: 0,
          retail_price: 0,
        },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="sku">SKU</Label>
          <Input id="sku" {...register("sku")} placeholder="e.g. FR-001" />
          {errors.sku && <p className="text-xs text-red-500">{errors.sku.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" {...register("name")} placeholder="Item name" />
          {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" {...register("description")} placeholder="Optional description" />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="quantity">Quantity</Label>
          <Input id="quantity" type="number" {...register("quantity")} />
          {errors.quantity && <p className="text-xs text-red-500">{errors.quantity.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="cost_price">Cost Price ($)</Label>
          <Input id="cost_price" type="number" step="0.01" {...register("cost_price")} />
          {errors.cost_price && <p className="text-xs text-red-500">{errors.cost_price.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="retail_price">Retail Price ($)</Label>
          <Input id="retail_price" type="number" step="0.01" {...register("retail_price")} />
          {errors.retail_price && <p className="text-xs text-red-500">{errors.retail_price.message}</p>}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : initialData ? "Update Item" : "Create Item"}
        </Button>
      </div>
    </form>
  );
}
