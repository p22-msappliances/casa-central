"use client";

import React from 'react';
import { AlertTriangle, Package } from 'lucide-react';

const mockInventory = [
  { id: '1', product: 'Premium Refrigerator', sku: 'FR-001', warehouse: 'Main Warehouse', quantity: 15, threshold: 10 },
  { id: '2', product: 'Smart Washing Machine', sku: 'WM-001', warehouse: 'Main Warehouse', quantity: 4, threshold: 10 },
  { id: '3', product: 'High-Fidelity Soundbar', sku: 'AU-001', warehouse: 'East Branch', quantity: 8, threshold: 5 },
  { id: '4', product: '4K QLED TV 55"', sku: 'TV-001', warehouse: 'Main Warehouse', quantity: 0, threshold: 5 },
  { id: '5', product: 'Inverter AC', sku: 'AC-001', warehouse: 'Main Warehouse', quantity: 12, threshold: 10 },
];

export default function AdminInventoryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary font-heading">Inventory</h1>
        <p className="text-muted-foreground mt-1">Track stock levels across warehouses.</p>
      </div>
      {mockInventory.filter(i => i.quantity <= i.threshold).length > 0 && (
        <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
          <div>
            <p className="font-semibold text-yellow-500">Low Stock Alert</p>
            <p className="text-sm text-muted-foreground">{mockInventory.filter(i => i.quantity <= i.threshold).length} products are running low.</p>
          </div>
        </div>
      )}
      <div className="rounded-xl bg-card border border-secondary/30 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-muted-foreground border-b border-secondary/30 bg-secondary/20">
              <th className="p-4 font-medium">Product</th>
              <th className="p-4 font-medium">SKU</th>
              <th className="p-4 font-medium">Warehouse</th>
              <th className="p-4 font-medium">Quantity</th>
              <th className="p-4 font-medium">Low Stock Threshold</th>
              <th className="p-4 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {mockInventory.map((item) => (
              <tr key={item.id} className="border-b border-secondary/10">
                <td className="p-4 font-medium text-primary">{item.product}</td>
                <td className="p-4 text-muted-foreground font-mono">{item.sku}</td>
                <td className="p-4 text-muted-foreground">{item.warehouse}</td>
                <td className="p-4">
                  <span className={`font-bold ${item.quantity === 0 ? 'text-red-500' : item.quantity <= item.threshold ? 'text-yellow-500' : 'text-green-500'}`}>
                    {item.quantity}
                  </span>
                </td>
                <td className="p-4 text-muted-foreground">{item.threshold}</td>
                <td className="p-4">
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                    item.quantity === 0 ? 'bg-red-500/10 text-red-500' :
                    item.quantity <= item.threshold ? 'bg-yellow-500/10 text-yellow-500' :
                    'bg-green-500/10 text-green-500'
                  }`}>
                    {item.quantity === 0 ? 'Out of Stock' : item.quantity <= item.threshold ? 'Low Stock' : 'In Stock'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
