import React from 'react';
import { readInventoryItems } from "@/app/actions/inventory";
import { InventoryDashboard } from "@/components/admin/InventoryDashboard";

export default async function AdminInventoryPage() {
  const result = await readInventoryItems({ page: 1, pageSize: 100 });
  const initialItems = (result.success && result.data) ? result.data : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary font-heading">Inventory</h1>
        <p className="text-muted-foreground mt-1">Track stock levels across warehouses.</p>
      </div>

      <InventoryDashboard initialItems={initialItems} />
    </div>
  );
}
