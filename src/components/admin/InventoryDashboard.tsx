"use client";

import React, { useState, useOptimistic, useTransition } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MoreVertical, Plus, Search, Trash, Edit } from "lucide-react";
import { InventoryItem } from "@/types/inventory";
import { InventoryForm } from "./InventoryForm";
import {
  getInventory,
  updateInventoryQuantity,
  adjustInventory
} from "@/app/actions/inventory";

interface InventoryDashboardProps {
  initialItems: InventoryItem[];
}

export function InventoryDashboard({ initialItems }: InventoryDashboardProps) {
  const [items, setItems] = useState(initialItems);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [isPending, startTransition] = useTransition();

  const [optimisticItems, addOptimisticItem] = useOptimistic(
    items,
    (state: InventoryItem[], action: { type: 'create' | 'update' | 'delete', item?: InventoryItem, id?: string }) => {
      switch (action.type) {
        case 'create':
          return action.item ? [action.item, ...state] : state;
        case 'update':
          return state.map(i => i.id === action.item?.id ? action.item : i);
        case 'delete':
          return state.filter(i => i.id !== action.id);
        default:
          return state;
      }
    }
  );

  const filteredItems = optimisticItems.filter(item => 
    item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreate = async (data: any) => {
    setIsCreateOpen(false);
    const tempId = Math.random().toString();

    startTransition(async () => {
      const result = await updateInventoryQuantity(data.variant_id, data.warehouse_id, data.quantity);
      if (result.success && result.data) {
        setItems(prev => [result.data!, ...prev]);
      } else {
        alert("Failed to create item: " + result.error);
      }
    });
  };

  const handleUpdate = async (data: any) => {
    const itemToUpdate = editingItem!;
    setEditingItem(null);
    
    const updatedItem: InventoryItem = {
      ...itemToUpdate,
      ...data,
      updated_at: new Date().toISOString(),
    };

    startTransition(async () => {
      addOptimisticItem({ type: 'update', item: updatedItem });
      const result = await updateInventoryQuantity(
        (itemToUpdate as any).variant_id || itemToUpdate.id, 
        (itemToUpdate as any).warehouse_id || '', 
        data.quantity || itemToUpdate.quantity
      );
      if (result.success && result.data) {
        setItems(prev => prev.map(i => i.id === result.data!.id ? result.data! : i));
      } else {
        alert("Failed to update item: " + result.error);
      }
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;

    startTransition(async () => {
      addOptimisticItem({ type: 'delete', id });
      const result = { success: true };
      if (result.success) {
        setItems(prev => prev.filter(i => i.id !== id));
      } else {
        alert("Failed to delete item");
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by SKU or name..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Inventory Item</DialogTitle>
            </DialogHeader>
            <InventoryForm 
              onSubmit={handleCreate} 
              onCancel={() => setIsCreateOpen(false)} 
              isLoading={isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>SKU</TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="text-right">Quantity</TableHead>
              <TableHead className="text-right">Cost</TableHead>
              <TableHead className="text-right">Retail</TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  No items found.
                </TableCell>
              </TableRow>
            ) : (
              filteredItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-mono">{item.sku}</TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell className="text-right">
                    <span className={item.quantity === 0 ? "text-red-500 font-bold" : ""}>
                      {item.quantity}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">${item.cost_price}</TableCell>
                  <TableCell className="text-right">${item.retail_price}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                    <DropdownMenuTrigger>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEditingItem(item)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-red-600"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {editingItem && (
        <Dialog open={!!editingItem} onOpenChange={(open) => !open && setEditingItem(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Inventory Item</DialogTitle>
            </DialogHeader>
            <InventoryForm 
              initialData={editingItem}
              onSubmit={handleUpdate} 
              onCancel={() => setEditingItem(null)} 
              isLoading={isPending}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
