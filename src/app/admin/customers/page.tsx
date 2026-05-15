"use client";

import React from 'react';
import { Mail, Phone } from 'lucide-react';

const mockCustomers = [
  { id: '1', name: 'Maria Santos', email: 'maria@email.com', phone: '+63 912 345 6789', orders: 5, spent: 285000, joined: '2026-01-15' },
  { id: '2', name: 'Jose Reyes', email: 'jose@email.com', phone: '+63 923 456 7890', orders: 3, spent: 120000, joined: '2026-02-20' },
  { id: '3', name: 'Anna Cruz', email: 'anna@email.com', phone: '+63 934 567 8901', orders: 8, spent: 420000, joined: '2025-11-05' },
  { id: '4', name: 'Pedro Tan', email: 'pedro@email.com', phone: '+63 945 678 9012', orders: 2, spent: 85000, joined: '2026-03-10' },
  { id: '5', name: 'Sofia Garcia', email: 'sofia@email.com', phone: '+63 956 789 0123', orders: 6, spent: 310000, joined: '2025-12-01' },
];

export default function AdminCustomersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary font-heading">Customers</h1>
        <p className="text-muted-foreground mt-1">View and manage customers.</p>
      </div>
      <div className="rounded-xl bg-card border border-secondary/30 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-muted-foreground border-b border-secondary/30 bg-secondary/20">
              <th className="p-4 font-medium">Customer</th>
              <th className="p-4 font-medium">Contact</th>
              <th className="p-4 font-medium">Orders</th>
              <th className="p-4 font-medium">Total Spent</th>
              <th className="p-4 font-medium">Member Since</th>
            </tr>
          </thead>
          <tbody>
            {mockCustomers.map((c) => (
              <tr key={c.id} className="border-b border-secondary/10 hover:bg-secondary/10 transition-colors">
                <td className="p-4 font-medium text-primary">{c.name}</td>
                <td className="p-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-3 w-3" /> {c.email}
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-3 w-3" /> {c.phone}
                    </div>
                  </div>
                </td>
                <td className="p-4 text-muted-foreground">{c.orders}</td>
                <td className="p-4 font-semibold">₱{c.spent.toLocaleString()}</td>
                <td className="p-4 text-muted-foreground">{c.joined}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
